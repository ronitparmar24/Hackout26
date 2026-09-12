from datetime import datetime
import uuid
from fastapi import APIRouter, Depends
from app.core.database import get_db
from pydantic import BaseModel

router = APIRouter()


class ApplyRecommendationRequest(BaseModel):
    run_id: str
    supplier_id: str
    recommended_supplier_id: str


@router.post("/api/recommendations/apply")
def apply_recommendation(req: ApplyRecommendationRequest, db=Depends(get_db)):
    new_id = str(uuid.uuid4())
    db.applied_recommendations.insert_one({
        "id": new_id,
        "run_id": req.run_id,
        "supplier_id": req.supplier_id,
        "recommended_supplier_id": req.recommended_supplier_id,
        "applied_at": datetime.utcnow().isoformat()
    })
    return {"status": "success", "id": new_id}
