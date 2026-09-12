import os
import json
import logging

logger = logging.getLogger(__name__)

class LLMProvider:
    def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        raise NotImplementedError

class DummyFallbackProvider(LLMProvider):
    """Deterministic analytical fallback when API keys are absent."""
    def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        logger.info("Using DummyFallbackProvider for LLM generation.")
        # Basic heuristic fallback
        lower_prompt = prompt.lower()
        if "summary" in lower_prompt:
            return "Executive Summary: The dataset has been analyzed successfully. We identified several high-emission suppliers and potential anomalies. Implementing the recommended green sourcing swaps could significantly reduce overall Scope 3 emissions.\n\nRecommended Actions:\n1. Review flagged anomalies for data entry errors.\n2. Engage with top emitters for reduction targets.\n3. Apply suggested supplier swaps where similarity scores are high."
        elif "risk" in lower_prompt:
            return "Moderate Risk. Some data was estimated and there are high-emission anomalies present."
        elif "explain" in lower_prompt or "anomaly" in lower_prompt:
            return "This supplier was flagged due to significantly higher emissions compared to peers in the same cluster, potentially driven by inefficient transport modes or excessive material quantities."
        elif "forecast" in lower_prompt:
            return json.dumps({
                "quarters": ["Q1", "Q2", "Q3", "Q4"],
                "bau": [100, 105, 110, 115],
                "optimized": [100, 95, 85, 75]
            })
        elif "filter" in lower_prompt or "nlp" in lower_prompt:
            return json.dumps({"tier": None, "material_type": None, "min_emissions": None, "is_anomaly": None})
        else:
            return "Based on the provided data, we recommend focusing on optimizing logistics and switching to lower-emission alternative materials."

# Add actual API integrations here if needed later (e.g. OpenAIProvider, GeminiProvider)
# For now, if no API keys are found, it uses the fallback.

def get_llm_provider() -> LLMProvider:
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    
    # In a full implementation, we'd return the respective provider.
    # if openai_key: return OpenAIProvider(openai_key)
    # elif gemini_key: return GeminiProvider(gemini_key)
    # elif groq_key: return GroqProvider(groq_key)
    
    return DummyFallbackProvider()

def generate_ai_response(prompt: str, system_prompt: str = "") -> str:
    provider = get_llm_provider()
    return provider.generate_text(prompt, system_prompt)
