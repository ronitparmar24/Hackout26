from fastapi import APIRouter, Depends
from sqlalchemy import text
from app.core.database import get_db
from pydantic import BaseModel

router = APIRouter()

class SettingsUpdate(BaseModel):
    company_name: str
    industry: str
    target_reduction_pct: float
    baseline_year: int
    currency: str
    default_region: str

@router.get("/api/settings")
def get_settings(db=Depends(get_db)):
    settings = db.execute(text("SELECT * FROM company_settings WHERE id = 'default'")).fetchone()
    if not settings:
        return {
            "company_name": "Acme Corp",
            "industry": "Manufacturing",
            "target_reduction_pct": 0.0,
            "baseline_year": 2023,
            "currency": "USD",
            "default_region": "Global"
        }
    return dict(settings._mapping)

@router.post("/api/settings")
def update_settings(req: SettingsUpdate, db=Depends(get_db)):
    db.execute(text("""
        INSERT INTO company_settings (id, company_name, industry, target_reduction_pct, baseline_year, currency, default_region)
        VALUES ('default', :cname, :ind, :tgt, :byear, :curr, :reg)
        ON CONFLICT(id) DO UPDATE SET 
            company_name=excluded.company_name,
            industry=excluded.industry,
            target_reduction_pct=excluded.target_reduction_pct,
            baseline_year=excluded.baseline_year,
            currency=excluded.currency,
            default_region=excluded.default_region
    """), {
        "cname": req.company_name,
        "ind": req.industry,
        "tgt": req.target_reduction_pct,
        "byear": req.baseline_year,
        "curr": req.currency,
        "reg": req.default_region
    })
    db.commit()
    return {"status": "success"}
