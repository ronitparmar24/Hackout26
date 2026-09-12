from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import text
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
    # Fetch some context for the run
    run = db.execute(text("SELECT * FROM runs WHERE id = :id"), {"id": run_id}).fetchone()
    if not run:
        raise HTTPException(404, "Run not found")
        
    suppliers = db.execute(text(
        "SELECT * FROM suppliers WHERE run_id = :id ORDER BY total_emissions DESC LIMIT 5"
    ), {"id": run_id}).fetchall()
    
    context = {
        "run_metrics": dict(run._mapping),
        "top_emitters": [dict(s._mapping) for s in suppliers]
    }
    
    response = get_chat_response(run_id, req.message, context)
    return {"response": response}

@router.get("/api/summary/{run_id}")
def get_summary(run_id: str, db=Depends(get_db)):
    run = db.execute(text("SELECT * FROM runs WHERE id = :id"), {"id": run_id}).fetchone()
    if not run:
        raise HTTPException(404, "Run not found")
    
    if run.executive_summary:
        return {
            "executive_summary": run.executive_summary,
            "recommended_actions": run.recommended_actions
        }
        
    summary_data = generate_executive_summary(dict(run._mapping))
    
    # Save back to db
    db.execute(
        text("UPDATE runs SET executive_summary = :es, recommended_actions = :ra WHERE id = :id"),
        {"es": summary_data["executive_summary"], "ra": summary_data["recommended_actions"], "id": run_id}
    )
    db.commit()
    
    return summary_data

@router.post("/api/filter-nlp")
def filter_nlp(req: NLPFilterRequest):
    filters = extract_nlp_filters(req.query)
    return filters

@router.get("/api/forecast/{run_id}")
def get_forecast(run_id: str, db=Depends(get_db)):
    run = db.execute(text("SELECT * FROM runs WHERE id = :id"), {"id": run_id}).fetchone()
    if not run:
        raise HTTPException(404, "Run not found")
        
    return generate_forecast(dict(run._mapping))

@router.get("/api/anomaly-explanation/{supplier_id}")
def get_anomaly_explanation(supplier_id: str, db=Depends(get_db)):
    supplier = db.execute(text("SELECT * FROM suppliers WHERE id = :id"), {"id": supplier_id}).fetchone()
    if not supplier:
        raise HTTPException(404, "Supplier not found")
        
    if supplier.risk_score is not None:
        return {
            "risk_score": supplier.risk_score,
            "risk_justification": supplier.risk_justification,
            "anomaly_reason": supplier.anomaly_reason
        }
        
    risk_data = calculate_risk_score(dict(supplier._mapping))
    
    db.execute(
        text("UPDATE suppliers SET risk_score = :rs, risk_justification = :rj, anomaly_reason = :ar WHERE id = :id"),
        {"rs": risk_data["risk_score"], "rj": risk_data["risk_justification"], "ar": risk_data["anomaly_reason"], "id": supplier_id}
    )
    db.commit()
    
    return risk_data
