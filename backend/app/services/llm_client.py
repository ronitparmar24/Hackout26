import os
import time
import logging
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError, APIError

# Ensure environment variables are loaded
load_dotenv()

logger = logging.getLogger(__name__)

# Primary and fallback model configurations
DEFAULT_MODEL = os.getenv("GROQ_DEFAULT_MODEL", "llama-3.3-70b-versatile")
FALLBACK_MODEL = os.getenv("GROQ_FALLBACK_MODEL", "llama-3.1-8b-instant")
# Additional active fallback models supported by Groq API
ACTIVE_GROQ_MODELS = ["qwen/qwen3.8-27b", "groq/compound-mini", "openai/gpt-oss-120b"]

# Initialize OpenAI client pointed to Groq's OpenAI-compatible endpoint
_groq_api_key = os.environ.get("GROQ_API_KEY", "")
client = OpenAI(
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
    api_key=_groq_api_key,
)


def _call_model_completion(model: str, messages: list, max_tokens: int) -> str:
    """Helper to execute chat completion with a specific model."""
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=max_tokens,
        temperature=0.2,
    )
    content = response.choices[0].message.content
    return content.strip() if content else ""


def ask_llm(system_prompt: str, user_prompt: str, max_tokens: int = 500) -> str:
    """
    Exported LLM helper function for chat, summary, risk score reasoning, and anomaly explanation.
    
    - Attempts call using primary model ('llama-3.3-70b-versatile').
    - Falls back to 'llama-3.1-8b-instant' (and active backup models) if unavailable or rate-limited.
    - Employs a 1-second backoff retry on transient/rate-limit errors.
    - Catches 429 rate-limit errors and returns a friendly fallback message instead of crashing.
    """
    if not os.environ.get("GROQ_API_KEY"):
        logger.warning("GROQ_API_KEY is not configured. Falling back to default message.")
        return "AI insight temporarily unavailable — please try again in a moment"

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_prompt})

    # Order of models to try
    models_to_try = [DEFAULT_MODEL, FALLBACK_MODEL]
    for backup in ACTIVE_GROQ_MODELS:
        if backup not in models_to_try:
            models_to_try.append(backup)

    last_error = None
    rate_limited = False

    for model in models_to_try:
        # Attempt 1 with current model
        try:
            return _call_model_completion(model, messages, max_tokens)
        except RateLimitError as e:
            logger.warning(f"Groq RateLimitError (429) on model '{model}': {e}. Retrying after 1-second backoff...")
            rate_limited = True
            last_error = e
            time.sleep(1)
            # Retry once with 1-second backoff
            try:
                return _call_model_completion(model, messages, max_tokens)
            except Exception as retry_err:
                logger.warning(f"Retry on model '{model}' failed: {retry_err}. Falling back to next model.")
                last_error = retry_err
                continue
        except APIError as e:
            # Check for 429 status code inside APIError
            status_code = getattr(e, "status_code", None)
            if status_code == 429:
                logger.warning(f"Groq 429 status code on model '{model}': {e}. Retrying after 1-second backoff...")
                rate_limited = True
                last_error = e
                time.sleep(1)
                try:
                    return _call_model_completion(model, messages, max_tokens)
                except Exception as retry_err:
                    logger.warning(f"Retry on model '{model}' failed: {retry_err}. Falling back to next model.")
                    last_error = retry_err
                    continue
            logger.warning(f"Groq APIError on model '{model}': {e}. Falling back to next model.")
            last_error = e
            continue
        except Exception as e:
            logger.warning(f"Groq invocation failed on model '{model}': {e}. Falling back to next model.")
            last_error = e
            continue

    # All models failed; log error server-side for debugging
    logger.error(f"All Groq LLM model attempts failed. Last error: {last_error}", exc_info=True)

    if rate_limited:
        return "AI insight temporarily unavailable — please try again in a moment"

    return "AI insight temporarily unavailable — please try again in a moment"
