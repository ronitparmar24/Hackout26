import os
import time
import logging
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError, APIError

# Ensure environment variables are loaded
load_dotenv()

logger = logging.getLogger(__name__)

# Tracks which provider served the most recent LLM request ("groq" | "gemini" | "openrouter" | "fallback")
_last_served_provider: str = "fallback"

# Groq configurations
GROQ_DEFAULT_MODEL = os.getenv("GROQ_DEFAULT_MODEL", "llama-3.3-70b-versatile")
GROQ_FALLBACK_MODEL = os.getenv("GROQ_FALLBACK_MODEL", "llama-3.1-8b-instant")
ACTIVE_GROQ_MODELS = ["qwen/qwen3.8-27b", "groq/compound-mini", "openai/gpt-oss-120b"]

_groq_api_key = os.environ.get("GROQ_API_KEY", "")
groq_client = OpenAI(
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
    api_key=_groq_api_key,
) if _groq_api_key else None

# Gemini configurations
GEMINI_DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-flash-latest"]

_gemini_api_key = os.environ.get("GEMINI_API_KEY", "")
gemini_client = None
if _gemini_api_key:
    try:
        from google import genai
        gemini_client = genai.Client(api_key=_gemini_api_key)
    except Exception as e:
        logger.warning(f"Could not initialize Google GenAI client: {e}")

# OpenRouter configurations
OPENROUTER_DEFAULT_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
OPENROUTER_FALLBACK_MODELS = [
    "nvidia/nemotron-3.5-lightning:free",
    "google/gemma-4-26b-a4b-it:free",
    "google/gemma-4-31b-it:free",
]

_openrouter_api_key = os.environ.get("OPENROUTER_API_KEY", "")
openrouter_client = OpenAI(
    base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
    api_key=_openrouter_api_key,
) if _openrouter_api_key else None


def get_last_provider() -> str:
    """Returns the provider that served the most recent LLM request."""
    return _last_served_provider


def _call_groq_model(model: str, messages: list, max_tokens: int) -> str:
    if not groq_client:
        raise ValueError("GROQ_API_KEY not configured")
    response = groq_client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=max_tokens,
        temperature=0.2,
    )
    content = response.choices[0].message.content
    return content.strip() if content else ""


def _try_groq(messages: list, max_tokens: int) -> str:
    """Attempts to serve request via Groq (Primary Provider)."""
    if not groq_client or not os.environ.get("GROQ_API_KEY"):
        raise ValueError("GROQ_API_KEY is not configured")

    models_to_try = [GROQ_DEFAULT_MODEL, GROQ_FALLBACK_MODEL]
    for backup in ACTIVE_GROQ_MODELS:
        if backup not in models_to_try:
            models_to_try.append(backup)

    last_error = None
    for model in models_to_try:
        try:
            result = _call_groq_model(model, messages, max_tokens)
            if result:
                logger.info(f"[LLM Provider] Served by Groq (model={model})")
                return result
        except RateLimitError as e:
            logger.warning(f"Groq 429 on model '{model}': {e}. Retrying after 1-second backoff...")
            time.sleep(1)
            try:
                result = _call_groq_model(model, messages, max_tokens)
                if result:
                    logger.info(f"[LLM Provider] Served by Groq (model={model})")
                    return result
            except Exception as retry_err:
                logger.warning(f"Groq retry failed on model '{model}': {retry_err}")
                last_error = retry_err
        except APIError as e:
            status_code = getattr(e, "status_code", None)
            if status_code == 429:
                logger.warning(f"Groq 429 status code on model '{model}': {e}. Retrying after 1s...")
                time.sleep(1)
                try:
                    result = _call_groq_model(model, messages, max_tokens)
                    if result:
                        logger.info(f"[LLM Provider] Served by Groq (model={model})")
                        return result
                except Exception as retry_err:
                    logger.warning(f"Groq retry failed on model '{model}': {retry_err}")
                    last_error = retry_err
                    continue
            logger.warning(f"Groq APIError on model '{model}': {e}")
            last_error = e
        except Exception as e:
            logger.warning(f"Groq call failed on model '{model}': {e}")
            last_error = e

    raise RuntimeError(f"All Groq models failed. Last error: {last_error}")


def _try_gemini(system_prompt: str, user_prompt: str, max_tokens: int) -> str:
    """Attempts to serve request via Google Gemini (First Fallback Layer)."""
    global gemini_client
    if not gemini_client:
        gemini_key = os.environ.get("GEMINI_API_KEY", "")
        if not gemini_key:
            raise ValueError("GEMINI_API_KEY is not configured")
        from google import genai
        gemini_client = genai.Client(api_key=gemini_key)

    from google.genai import types

    gemini_models = [GEMINI_DEFAULT_MODEL] + GEMINI_FALLBACK_MODELS
    last_error = None

    for model in gemini_models:
        try:
            config_args = {
                "max_output_tokens": max_tokens,
                "temperature": 0.2,
            }
            if system_prompt:
                config_args["system_instruction"] = system_prompt

            config = types.GenerateContentConfig(**config_args)

            response = gemini_client.models.generate_content(
                model=model,
                contents=user_prompt,
                config=config,
            )

            text = response.text
            if text:
                logger.info(f"[LLM Provider] Served by Google Gemini fallback (model={model})")
                return text.strip()
        except Exception as e:
            logger.warning(f"Gemini call failed on model '{model}': {e}")
            last_error = e

    raise RuntimeError(f"All Gemini model attempts failed: {last_error}")


def _try_openrouter(messages: list, max_tokens: int) -> str:
    """Attempts to serve request via OpenRouter (Second Fallback Layer)."""
    global openrouter_client
    if not openrouter_client:
        or_key = os.environ.get("OPENROUTER_API_KEY", "")
        if not or_key:
            raise ValueError("OPENROUTER_API_KEY is not configured")
        openrouter_client = OpenAI(
            base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
            api_key=or_key,
        )

    openrouter_models = [OPENROUTER_DEFAULT_MODEL] + OPENROUTER_FALLBACK_MODELS
    last_error = None

    for model in openrouter_models:
        try:
            response = openrouter_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.2,
            )
            content = response.choices[0].message.content
            if content:
                logger.info(f"[LLM Provider] Served by OpenRouter fallback (model={model})")
                return content.strip()
        except Exception as e:
            logger.warning(f"OpenRouter call failed on model '{model}': {e}")
            last_error = e

    raise RuntimeError(f"All OpenRouter model attempts failed: {last_error}")


def ask_llm_with_provider(system_prompt: str, user_prompt: str, max_tokens: int = 500) -> tuple[str, str]:
    """
    Executes the multi-layer LLM provider chain:
    Groq -> Gemini -> OpenRouter -> graceful fallback.
    Returns (response_text, served_by_provider).
    """
    global _last_served_provider

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_prompt})

    # Layer 1: Groq (Primary)
    try:
        res = _try_groq(messages, max_tokens)
        _last_served_provider = "groq"
        return res, "groq"
    except Exception as groq_err:
        logger.warning(f"Groq attempt failed or rate-limited: {groq_err}. Falling back to Google Gemini...")

    # Layer 2: Google Gemini (First Fallback Layer)
    try:
        res = _try_gemini(system_prompt, user_prompt, max_tokens)
        _last_served_provider = "gemini"
        return res, "gemini"
    except Exception as gemini_err:
        logger.warning(f"Google Gemini fallback failed: {gemini_err}. Falling back to OpenRouter...")

    # Layer 3: OpenRouter (Second Fallback Layer)
    try:
        res = _try_openrouter(messages, max_tokens)
        _last_served_provider = "openrouter"
        return res, "openrouter"
    except Exception as openrouter_err:
        logger.error(f"OpenRouter fallback failed: {openrouter_err}. All providers exhausted.", exc_info=True)

    # Layer 4: Deterministic fallback message
    _last_served_provider = "fallback"
    return "AI insight temporarily unavailable — please try again in a moment", "fallback"


def ask_llm(system_prompt: str, user_prompt: str, max_tokens: int = 500) -> str:
    """
    Main exported helper function called by chat, summary, risk score, and anomaly endpoints.
    Returns plain string response matching standard signature.
    """
    text, _ = ask_llm_with_provider(system_prompt, user_prompt, max_tokens)
    return text
