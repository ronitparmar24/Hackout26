from app.ai.llm import generate_ai_response
import json

def extract_nlp_filters(query: str) -> dict:
    """
    Translates natural language queries into structured filters.
    e.g. "Show me Tier 2 textile suppliers with above average emissions" -> {"tier": "Tier 2", "material_type": "textile"}
    """
    prompt = f"Extract search filters (tier, material_type, min_emissions, is_anomaly) from this query: '{query}'. Return only JSON."
    response = generate_ai_response(prompt=prompt)
    try:
        filters = json.loads(response)
        return filters
    except:
        return {}
