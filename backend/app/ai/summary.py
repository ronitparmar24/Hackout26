from app.ai.llm import generate_ai_response
import json

def generate_executive_summary(run_data: dict) -> dict:
    """
    Synthesizes run metrics into an executive summary + prioritized action items.
    """
    prompt = f"Generate an executive summary and recommended actions for this supply chain data: {json.dumps(run_data)}. Keep it concise."
    response = generate_ai_response(prompt=prompt)
    
    # In a real implementation we would parse the LLM output. 
    # For now, we rely on the fallback engine returning a structured-ish string and we split it.
    parts = response.split("Recommended Actions:")
    summary = parts[0].replace("Executive Summary:", "").strip()
    actions = parts[1].strip() if len(parts) > 1 else ""
    
    return {
        "executive_summary": summary,
        "recommended_actions": actions
    }
