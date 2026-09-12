import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import db, init_db
from app.api.upload import router as upload_router
from app.api.export import router as export_router
from app.api.ai import router as ai_router
from app.api.settings import router as settings_router
from app.api.recommendations import router as recs_router

app = FastAPI(title="Carbon-Aware Supply Chain Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(export_router)
app.include_router(ai_router)
app.include_router(settings_router)
app.include_router(recs_router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    try:
        db.command("ping")
        return {"status": "ok", "database": "mongodb"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


from app.core.auth import get_current_user, AuthenticatedUser, DEMO_GUEST_USER_ID
import time

# Fast In-Memory TTL Cache (60s TTL) for millisecond responses
_RUNS_CACHE = {}  # key: user_id -> {"data": [...], "ts": float}
_RUN_DETAIL_CACHE = {}  # key: run_id -> {"data": {...}, "ts": float}
CACHE_TTL = 60.0  # seconds


def invalidate_run_caches():
    """Clear memory caches when new data is uploaded."""
    _RUNS_CACHE.clear()
    _RUN_DETAIL_CACHE.clear()


@app.get("/api/runs")
def list_runs(current_user: AuthenticatedUser = Depends(get_current_user)):
    """List runs isolated by requesting user, with in-memory caching for instant page navigation."""
    cache_key = f"guest:{DEMO_GUEST_USER_ID}" if current_user.is_guest else f"user:{current_user.user_id}"
    now = time.time()
    
    if cache_key in _RUNS_CACHE and (now - _RUNS_CACHE[cache_key]["ts"]) < CACHE_TTL:
        return _RUNS_CACHE[cache_key]["data"]

    if current_user.is_guest:
        # Guest demo user sees demo/shared runs
        query = {"$or": [{"user_id": DEMO_GUEST_USER_ID}, {"user_id": None}, {"user_id": {"$exists": False}}]}
    else:
        # Authenticated user sees their own runs plus initial seeded sample runs
        query = {"$or": [{"user_id": current_user.user_id}, {"user_id": None}, {"user_id": {"$exists": False}}]}

    runs = list(db.runs.find(query, {"_id": 0}).sort("created_at", -1))
    for r in runs:
        run_identifier = r.get("run_id") or r.get("id") or ""
        r["id"] = run_identifier
        r["run_id"] = run_identifier

    _RUNS_CACHE[cache_key] = {"data": runs, "ts": now}
    return runs


@app.get("/api/history")
def get_history(current_user: AuthenticatedUser = Depends(get_current_user)):
    """Alias for /api/runs protected by Supabase Auth."""
    return list_runs(current_user)


@app.get("/api/runs/{run_id}")
def get_run(run_id: str, current_user: AuthenticatedUser = Depends(get_current_user)):
    """Fetch run details with in-memory caching to eliminate 2+ second database roundtrips."""
    now = time.time()
    if run_id in _RUN_DETAIL_CACHE and (now - _RUN_DETAIL_CACHE[run_id]["ts"]) < CACHE_TTL:
        cached_run = _RUN_DETAIL_CACHE[run_id]["data"]
        # Verify ownership
        run_owner = cached_run.get("user_id")
        if run_owner and run_owner not in (current_user.user_id, DEMO_GUEST_USER_ID) and not current_user.is_guest:
            raise HTTPException(403, "Access denied: this run belongs to another organization.")
        return cached_run

    run = db.runs.find_one({"$or": [{"id": run_id}, {"run_id": run_id}]}, {"_id": 0})
    if not run:
        raise HTTPException(404, "Run not found")

    # Double-check user ownership for defense-in-depth
    run_owner = run.get("user_id")
    if run_owner and run_owner not in (current_user.user_id, DEMO_GUEST_USER_ID) and not current_user.is_guest:
        raise HTTPException(403, "Access denied: this run belongs to another organization.")

    actual_run_id = run.get("id") or run.get("run_id") or run_id
    suppliers = list(db.suppliers.find({"run_id": actual_run_id}, {"_id": 0}).sort("total_emissions", -1))
    recs = list(db.recommendations.find({"run_id": actual_run_id}, {"_id": 0}).sort("emissions_reduction_pct", -1))

    sup_map = {s["id"]: s["supplier_name"] for s in suppliers}
    for r in recs:
        if "from_supplier" not in r:
            r["from_supplier"] = sup_map.get(r.get("supplier_id"), "Unknown")
        if "to_supplier" not in r:
            r["to_supplier"] = sup_map.get(r.get("recommended_supplier_id"), "Unknown")

    run_detail = {
        "id": actual_run_id,
        "run_id": actual_run_id,
        "user_id": run_owner,
        "filename": run.get("filename"),
        "status": run.get("status"),
        "total_suppliers": run.get("total_suppliers"),
        "total_emissions": float(run.get("total_emissions") or 0),
        "executive_summary": run.get("executive_summary") or run.get("summary"),
        "recommended_actions": run.get("recommended_actions"),
        "suppliers": suppliers,
        "recommendations": recs,
    }

    _RUN_DETAIL_CACHE[run_id] = {"data": run_detail, "ts": now}
    _RUN_DETAIL_CACHE[actual_run_id] = {"data": run_detail, "ts": now}
    return run_detail

