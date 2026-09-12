import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.database import engine
from app.api.upload import router as upload_router
from app.api.export import router as export_router

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


@app.get("/health")
def health():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}


@app.get("/api/runs/{run_id}")
def get_run(run_id: str):
    from app.core.database import get_db
    from fastapi import HTTPException
    with engine.connect() as conn:
        run = conn.execute(text("SELECT * FROM runs WHERE id = :id"), {"id": run_id}).fetchone()
        if not run:
            raise HTTPException(404, "Run not found")
        suppliers = conn.execute(text(
            "SELECT * FROM suppliers WHERE run_id = :id ORDER BY total_emissions DESC"
        ), {"id": run_id}).fetchall()
        return {
            "run_id": run_id,
            "filename": run.filename,
            "status": run.status,
            "total_suppliers": run.total_suppliers,
            "total_emissions": float(run.total_emissions) if run.total_emissions else 0,
            "suppliers": [dict(s._mapping) for s in suppliers],
        }

