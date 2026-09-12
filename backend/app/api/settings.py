from fastapi import APIRouter, Depends
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
    settings = db.company_settings.find_one({"id": "default"}, {"_id": 0})
    if not settings:
        return {
            "company_name": "Acme Corp",
            "industry": "Manufacturing",
            "target_reduction_pct": 0.0,
            "baseline_year": 2023,
            "currency": "USD",
            "default_region": "Global"
        }
    return settings


@router.post("/api/settings")
def update_settings(req: SettingsUpdate, db=Depends(get_db)):
    data = req.dict()
    data["id"] = "default"
    db.company_settings.update_one(
        {"id": "default"},
        {"$set": data},
        upsert=True
    )
    return {"status": "success"}
