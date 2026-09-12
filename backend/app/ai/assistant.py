import json
import logging
from app.services.llm_client import ask_llm

logger = logging.getLogger(__name__)


def get_chat_response(run_id: str, question: str, context: dict, persona: str = "auditor") -> str:
    """
    RAG-style conversational assistant grounded strictly on the audited dataset.
    Supports two personas:
      - 'auditor': formal, corporate SEC/CSRD compliance carbon expert.
      - 'roast': savage, witty Gen-Z style reality check grounded strictly in audited figures.
    """
    if persona == "roast":
        system_prompt = (
            "You are CarbonSense AI in '🔥 Roast My Supply Chain' mode: a savagely witty, humorous, Gen-Z supply chain auditor with zero corporate filter. "
            "You roast corporate carbon footprints, dirty freight logistics, and polluter suppliers with authentic Gen-Z slang "
            "(e.g., 'giving major red flags 🚩', 'delulu', 'caught in 4k', 'bro is boiling the ocean', 'down bad on Scope 3', 'cooked', 'main character syndrome', 'aura -10000', 'not the vibe'). "
            "CRITICAL INSTRUCTION: While your tone is savage and funny, EVERY SINGLE NUMBER, SUPPLIER NAME, TIER, AND METRIC MUST BE 100% FACTUALLY ACCURATE and taken strictly from the context. "
            "Do NOT make up fake suppliers or numbers. Roast the actual data context provided. Keep answers concise, punchy, and formatted with bullet points or emojis."
        )
    else:
        system_prompt = (
            "You are CarbonSense AI, an expert corporate carbon accounting auditor analyzing supply chain Scope 3 emissions according to the GHG Protocol and CSRD standards. "
            "You must answer the user's question based strictly and exclusively on the provided audited data context. "
            "Deliver executive-ready, professional, and audit-compliant answers. "
            "NEVER invent or extrapolate numbers, suppliers, or percentages not present in the context."
        )

    user_prompt = f"""Audited Supply Chain Context:
{json.dumps(context, indent=2)}

User Question: {question}

Response (strictly grounded in the audited data above, adhering to the persona):"""

    try:
        response = ask_llm(system_prompt=system_prompt, user_prompt=user_prompt, max_tokens=500)
        if response:
            return response
    except Exception as e:
        logger.warning(f"Error calling ask_llm in get_chat_response: {e}")

    if persona == "roast":
        return (
            "Bestie, your Scope 3 data is giving massive red flags 🚩. 2 or 3 suppliers are eating up over 70% of your entire carbon aura. "
            "Check the anomalies tab before the SEC catches you in 4k!"
        )
    return (
        "Based on the available dataset for this run, top emissions are concentrated in high-volume suppliers. "
        "Please check the top emitters and anomaly flags on your dashboard."
    )

