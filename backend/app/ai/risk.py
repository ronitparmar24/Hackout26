from app.ai.llm import generate_ai_response

def calculate_risk_score(supplier_data: dict) -> dict:
    """
    Computes 0-100 Supply Chain Risk Score and generates feature-attribution explanations.
    """
    # Simple heuristic: Higher emissions relative to peers = higher risk
    # If anomaly, add 30 to risk score. If estimated data, add 20.
    risk_score = 30
    if supplier_data.get("is_anomaly"):
        risk_score += 40
    if supplier_data.get("energy_kwh_estimated") or supplier_data.get("transport_km_estimated"):
        risk_score += 20
        
    risk_score = min(100, max(0, risk_score))
    
    prompt = f"Explain the risk for this supplier data: {supplier_data}. Focus on anomaly reasons and estimated data."
    response = generate_ai_response(prompt=prompt)
    
    return {
        "risk_score": risk_score,
        "risk_justification": response,
        "anomaly_reason": "High variance detected in material quantities" if supplier_data.get("is_anomaly") else None
    }
