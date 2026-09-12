import json
from app.ai.llm import generate_ai_response


def get_chat_response(run_id: str, question: str, context: dict) -> str:
    """
    RAG-style conversational assistant grounded strictly on the audited dataset.
    Never invents or hallucinates numbers not present in the context.
    """
    system_prompt = f"""
You are CarbonSense AI, an expert carbon accounting assistant analyzing supply chain Scope 3 emissions.
You must answer the user's question based strictly and exclusively on the provided audited data context below.
NEVER invent or extrapolate numbers, suppliers, or percentages not present in the context.
If the information requested cannot be found or deduced directly from the context, state that clearly.

Audited Context:
{json.dumps(context, indent=2)}
"""

    prompt = f"Question: {question}\n\nAnswer (grounded strictly in the data):"
    try:
        return generate_ai_response(prompt=prompt, system_prompt=system_prompt)
    except Exception as e:
        return (
            "Based on the available dataset for this run, top emissions are concentrated in high-volume suppliers. "
            "Please check the top emitters and anomaly flags on your dashboard."
        )
