from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from app.core.database import get_db
from pydantic import BaseModel
import uuid

router = APIRouter()

class ApplyRecommendationRequest(BaseModel):
    run_id: str
    supplier_id: str
    recommended_supplier_id: str

@router.post("/api/recommendations/apply")
def apply_recommendation(req: ApplyRecommendationRequest, db=Depends(get_db)):
    new_id = str(uuid.uuid4())
    db.execute(text("""
        INSERT INTO applied_recommendations (id, run_id, supplier_id, recommended_supplier_id)
        VALUES (:id, :run, :sup, :rsup)
    """), {
        "id": new_id,
        "run": req.run_id,
        "sup": req.supplier_id,
        "rsup": req.recommended_supplier_id
    })
    db.commit()
    return {"status": "success", "id": new_id}
