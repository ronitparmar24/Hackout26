from app.ai.llm import generate_ai_response
import json

def generate_forecast(run_data: dict) -> dict:
    """
    Calculates a 4-quarter emissions trajectory: BAU vs Optimized.
    """
    # Simple heuristic for hackathon: calculate 10% reduction if recommendations applied
    total = run_data.get("total_emissions", 1000)
    
    bau = [total, total * 1.05, total * 1.10, total * 1.15]
    optimized = [total, total * 0.95, total * 0.85, total * 0.75]
    
    return {
        "quarters": ["Q1", "Q2", "Q3", "Q4"],
        "bau": bau,
        "optimized": optimized
    }
