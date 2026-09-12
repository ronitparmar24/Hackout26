from app.ai.llm import generate_ai_response
import json

def get_chat_response(run_id: str, message: str, context: dict) -> str:
    """
    RAG-style conversational assistant.
    context contains run metrics, top emitters, and anomalies.
    """
    system_prompt = f"""
    You are CarbonSense AI, an expert climate-tech assistant analyzing supply chain emissions.
    Use the following context to answer the user's question accurately. Do not hallucinate numbers.
    Context: {json.dumps(context)}
    """
    
    return generate_ai_response(prompt=message, system_prompt=system_prompt)
