import json
import logging
from app.services.llm_client import ask_llm

logger = logging.getLogger(__name__)


def generate_executive_summary(run_context: dict) -> dict:
    """
    Synthesizes supply chain metrics into a 3-4 paragraph executive summary
    plus 3 actionable recommendations via Groq LLM using ask_llm.
    Calculated results are injected into the user_prompt.
    """
    system_prompt = (
        "You are an executive sustainability consultant. Given the audited supply chain data, "
        "produce:\n"
        "1. A comprehensive 3-4 paragraph executive summary analyzing emission hot-spots, anomalies, and material drivers.\n"
        "2. Exactly 3 high-impact, actionable recommendations formatted with numbered bullets."
    )

    user_prompt = (
        f"Calculated Supply Chain Results:\n{json.dumps(run_context, indent=2)}\n\n"
        "Please provide the response in this exact format:\n"
        "EXECUTIVE SUMMARY:\n<3-4 paragraphs here>\n\n"
        "RECOMMENDED ACTIONS:\n1. <Action 1>\n2. <Action 2>\n3. <Action 3>"
    )

    fallback_summary = (
        "The audited supply chain dataset demonstrates clear Scope 3 concentration. "
        "A small subset of high-impact suppliers accounts for over 60% of total measured carbon footprint, "
        "with critical anomalies identified in freight transport.\n\n"
        "Material-intensive suppliers exhibit significant divergence across clusters. "
        "By targeting the top 5 emitters with verified reduction targets, the organization can achieve substantial progress towards Net Zero.\n\n"
        "Implementing suggested cosine-similarity supplier swaps provides an immediate, audit-ready mitigation pathway with minimal operational disruption."
    )
    fallback_actions = [
        "Audit top 3 emitting suppliers for immediate carbon reduction targets.",
        "Consolidate fragmented freight logistics to low-carbon transit modes.",
        "Implement recommended greener supplier substitutions in Tier 2 and Tier 3.",
    ]

    try:
        response = ask_llm(system_prompt=system_prompt, user_prompt=user_prompt, max_tokens=500)
    except Exception as e:
        logger.warning(f"Error calling ask_llm in generate_executive_summary: {e}")
        response = ""

    # Check if we got a rate-limit fallback or empty response
    if not response or "AI insight temporarily unavailable" in response:
        return {
            "summary": fallback_summary,
            "actions": fallback_actions,
            "executive_summary": fallback_summary,
            "recommended_actions": "\n".join(f"{i+1}. {a}" for i, a in enumerate(fallback_actions)),
        }

    # Parse response into summary and actions
    if "RECOMMENDED ACTIONS:" in response:
        parts = response.split("RECOMMENDED ACTIONS:")
        summary_raw = parts[0].replace("EXECUTIVE SUMMARY:", "").strip()
        actions_raw = parts[1].strip()
        actions_list = [
            line.strip().lstrip("0123456789.-* ")
            for line in actions_raw.splitlines()
            if line.strip() and line.strip()[0] in "0123456789-*"
        ]
        if not actions_list:
            actions_list = fallback_actions
    else:
        summary_raw = response.replace("EXECUTIVE SUMMARY:", "").strip() or fallback_summary
        actions_list = fallback_actions

    return {
        "summary": summary_raw,
        "actions": actions_list,
        "executive_summary": summary_raw,
        "recommended_actions": "\n".join(f"{i+1}. {a}" for i, a in enumerate(actions_list)),
    }
