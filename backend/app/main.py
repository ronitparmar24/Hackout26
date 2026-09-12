import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

from fastapi import FastAPI, HTTPException
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


@app.get("/api/runs")
def list_runs():
    runs = list(db.runs.find({}, {"_id": 0}).sort("created_at", -1))
    return runs


@app.get("/api/runs/{run_id}")
def get_run(run_id: str):
    run = db.runs.find_one({"id": run_id}, {"_id": 0})
    if not run:
        raise HTTPException(404, "Run not found")
    suppliers = list(db.suppliers.find({"run_id": run_id}, {"_id": 0}).sort("total_emissions", -1))
    recs = list(db.recommendations.find({"run_id": run_id}, {"_id": 0}).sort("emissions_reduction_pct", -1))

    sup_map = {s["id"]: s["supplier_name"] for s in suppliers}
    for r in recs:
        if "from_supplier" not in r:
            r["from_supplier"] = sup_map.get(r.get("supplier_id"), "Unknown")
        if "to_supplier" not in r:
            r["to_supplier"] = sup_map.get(r.get("recommended_supplier_id"), "Unknown")

    return {
        "run_id": run_id,
        "filename": run.get("filename"),
        "status": run.get("status"),
        "total_suppliers": run.get("total_suppliers"),
        "total_emissions": float(run.get("total_emissions") or 0),
        "suppliers": suppliers,
        "recommendations": recs,
    }
