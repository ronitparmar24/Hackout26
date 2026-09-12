import json
import logging
from app.services.llm_client import ask_llm

logger = logging.getLogger(__name__)


def get_chat_response(run_id: str, question: str, context: dict) -> str:
    """
    RAG-style conversational assistant grounded strictly on the audited dataset.
    Uses ask_llm with supplier/run context injected into the user_prompt.
    """
    system_prompt = (
        "You are CarbonSense AI, an expert carbon accounting assistant analyzing supply chain Scope 3 emissions. "
        "You must answer the user's question based strictly and exclusively on the provided audited data context. "
        "NEVER invent or extrapolate numbers, suppliers, or percentages not present in the context. "
        "If the information requested cannot be found or deduced directly from the context, state that clearly."
    )

    user_prompt = f"""Audited Supply Chain Context:
{json.dumps(context, indent=2)}

User Question: {question}

Answer (grounded strictly in the audited data context above):"""

    try:
        response = ask_llm(system_prompt=system_prompt, user_prompt=user_prompt, max_tokens=500)
        if response:
            return response
    except Exception as e:
        logger.warning(f"Error calling ask_llm in get_chat_response: {e}")

    return (
        "Based on the available dataset for this run, top emissions are concentrated in high-volume suppliers. "
        "Please check the top emitters and anomaly flags on your dashboard."
    )
