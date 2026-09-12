from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from app.core.database import get_db
from app.ai.assistant import get_chat_response
from app.ai.summary import generate_executive_summary
from app.ai.nlp_filter import extract_nlp_filters
from app.ai.forecast import generate_forecast
from app.ai.risk import calculate_risk_score
from pydantic import BaseModel

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class NLPFilterRequest(BaseModel):
    query: str


@router.post("/api/chat/{run_id}")
def chat_with_data(run_id: str, req: ChatRequest, db=Depends(get_db)):
    run = db.runs.find_one({"id": run_id}, {"_id": 0})
    if not run:
        raise HTTPException(404, "Run not found")
        
    suppliers = list(db.suppliers.find({"run_id": run_id}, {"_id": 0}).sort("total_emissions", -1).limit(5))
    
    context = {
        "run_metrics": run,
        "top_emitters": suppliers
    }
    
    response = get_chat_response(run_id, req.message, context)
    return {"response": response}


@router.get("/api/summary/{run_id}")
def get_summary(run_id: str, db=Depends(get_db)):
    run = db.runs.find_one({"id": run_id}, {"_id": 0})
    if not run:
        raise HTTPException(404, "Run not found")
    
    if run.get("executive_summary"):
        return {
            "executive_summary": run["executive_summary"],
            "recommended_actions": run.get("recommended_actions")
        }
        
    summary_data = generate_executive_summary(run)
    
    # Save back to MongoDB
    db.runs.update_one(
        {"id": run_id},
        {"$set": {
            "executive_summary": summary_data["executive_summary"],
            "recommended_actions": summary_data["recommended_actions"]
        }}
    )
    
    return summary_data


@router.post("/api/filter-nlp")
def filter_nlp(req: NLPFilterRequest):
    filters = extract_nlp_filters(req.query)
    return filters


@router.get("/api/forecast/{run_id}")
def get_forecast(run_id: str, db=Depends(get_db)):
    run = db.runs.find_one({"id": run_id}, {"_id": 0})
    if not run:
        raise HTTPException(404, "Run not found")
        
    return generate_forecast(run)


@router.get("/api/anomaly-explanation/{supplier_id}")
def get_anomaly_explanation(supplier_id: str, db=Depends(get_db)):
    supplier = db.suppliers.find_one({"id": supplier_id}, {"_id": 0})
    if not supplier:
        raise HTTPException(404, "Supplier not found")
        
    if supplier.get("risk_score") is not None:
        return {
            "risk_score": supplier["risk_score"],
            "risk_justification": supplier["risk_justification"],
            "anomaly_reason": supplier.get("anomaly_reason")
        }
        
    risk_data = calculate_risk_score(supplier)
    
    db.suppliers.update_one(
        {"id": supplier_id},
        {"$set": {
            "risk_score": risk_data["risk_score"],
            "risk_justification": risk_data["risk_justification"],
            "anomaly_reason": risk_data["anomaly_reason"]
        }}
    )
    
    return risk_data
