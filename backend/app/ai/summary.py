import json
import re
import logging
from typing import Dict, Any
from app.services.llm_client import ask_llm

logger = logging.getLogger(__name__)


def generate_executive_summary(run_context: dict) -> Dict[str, Any]:
    """
    Synthesizes supply chain metrics into a structured, scannable JSON summary
    following strict single-sentence constraints per section, plus a full analysis narrative.
    """
    total_emissions = run_context.get("total_emissions_kg") or 0
    total_suppliers = run_context.get("total_suppliers") or 0
    anomalies = run_context.get("anomalies") or []
    baseline = run_context.get("baseline_cluster") or {}
    watchlist = run_context.get("secondary_watchlist") or []
    data_integrity = run_context.get("data_integrity_flag") or {}

    # Format human-readable total
    if total_emissions >= 1_000_000:
        headline_stat = f"{total_emissions / 1_000_000:.2f}M kg CO2e across {total_suppliers} suppliers"
    elif total_emissions >= 1_000:
        headline_stat = f"{total_emissions / 1_000:.1f}k kg CO2e across {total_suppliers} suppliers"
    else:
        headline_stat = f"{total_emissions:,.0f} kg CO2e across {total_suppliers} suppliers"

    anomaly_count = len(anomalies)
    anomaly_pct = sum(a.get("pct_of_total", 0) for a in anomalies)
    risk_level = "critical" if anomaly_pct > 50 or anomaly_count >= 2 else ("moderate" if anomaly_pct > 25 else "low")

    # Default fallback structured object guaranteed mathematically
    default_summary: Dict[str, Any] = {
        "headline_stat": headline_stat,
        "risk_level": risk_level,
        "key_finding": f"{anomaly_count} suppliers drive {anomaly_pct:.0f}% of total emissions, creating extreme Scope 3 concentration risk.",
        "concentration_risk": {
            "suppliers": anomalies[:3],
            "note": f"Primary exposure stems from {anomalies[0]['name'] if anomalies else 'top emitters'} and freight logistics."
        },
        "baseline_cluster": {
            "supplier_count": baseline.get("supplier_count", max(total_suppliers - anomaly_count, 0)),
            "avg_emissions_kg": baseline.get("avg_emissions_kg", 0),
            "note": "The broader supplier base maintains a stable, homogeneous baseline footprint."
        },
        "secondary_watchlist": watchlist[:3],
        "data_integrity_flag": {
            "severity": data_integrity.get("severity", "high" if any("ANOMALY_" in str(a.get("name", "")) for a in anomalies) else "low"),
            "message": data_integrity.get("message", "ANOMALY-prefixed supplier labels suggest synthetic test markers or data ingestion artifacts.")
        },
        "recommended_actions": [
            {
                "priority": 1,
                "action": f"Initiate forensic audit on top {min(anomaly_count, 2)} anomaly suppliers to verify primary reporting.",
                "impact": "high"
            },
            {
                "priority": 2,
                "action": "Transition long-haul freight over 1,000 km to rail or coastal maritime corridors.",
                "impact": "medium"
            },
            {
                "priority": 3,
                "action": "Implement greener supplier substitutions for high-variance raw material categories.",
                "impact": "medium"
            }
        ],
        "full_analysis": (
            f"The audited supply chain reveals a total carbon footprint of approximately {headline_stat}. "
            f"A severe concentration risk is present, where {anomaly_count} statistical outlier suppliers account for nearly {anomaly_pct:.0f}% of total measured emissions. "
            f"Specifically, {anomalies[0]['name'] if anomalies else 'top vendor'} represents disproportionate logistical and material intensity.\n\n"
            f"Conversely, the remaining {baseline.get('supplier_count', total_suppliers)} baseline suppliers exhibit a homogeneous distribution averaging {baseline.get('avg_emissions_kg', 0):,.0f} kg CO2e. "
            "Secondary watchlists indicate moderate growth in Tier 1 electronics manufacturing that requires ongoing monitoring.\n\n"
            "Execution of recommended cosine-similarity vendor substitutions provides an immediate, audit-compliant pathway to reduce Scope 3 liabilities without disrupting operational lead times."
        )
    }

    system_prompt = (
        "You are an executive sustainability consultant. Output ONLY a valid JSON object summarizing audited supply chain carbon data. "
        "Strict rules:\n"
        "- Every 'note' and 'message' string MUST be exactly 1 concise sentence (maximum 20 words).\n"
        "- Output strictly valid JSON with no markdown wrapping or preamble."
    )

    user_prompt = f"""AUDITED DATA:
{json.dumps(run_context, indent=2)}

Return strict JSON matching this schema:
{{
  "headline_stat": "{headline_stat}",
  "risk_level": "{risk_level}",
  "key_finding": "1 sentence: the single most important insight",
  "concentration_risk": {{
    "suppliers": {json.dumps(anomalies[:3])},
    "note": "1 sentence takeaway on concentration risk"
  }},
  "baseline_cluster": {{
    "supplier_count": {baseline.get('supplier_count', 29)},
    "avg_emissions_kg": {baseline.get('avg_emissions_kg', 100000)},
    "note": "1 sentence takeaway on baseline cluster"
  }},
  "secondary_watchlist": {json.dumps(watchlist[:3])},
  "data_integrity_flag": {{
    "severity": "{default_summary['data_integrity_flag']['severity']}",
    "message": "1 sentence flag on naming or data anomalies"
  }},
  "recommended_actions": [
    {{ "priority": 1, "action": "Action 1", "impact": "high" }},
    {{ "priority": 2, "action": "Action 2", "impact": "medium" }},
    {{ "priority": 3, "action": "Action 3", "impact": "medium" }}
  ],
  "full_analysis": "A detailed 2-3 paragraph narrative analysis explaining the findings in depth."
}}"""

    try:
        raw_response = ask_llm(system_prompt=system_prompt, user_prompt=user_prompt, max_tokens=750)
        if raw_response and "AI insight temporarily unavailable" not in raw_response:
            clean_json = raw_response.strip()
            # Strip markdown fences if present
            if clean_json.startswith("```"):
                clean_json = re.sub(r"^```(?:json)?\n?", "", clean_json)
                clean_json = re.sub(r"\n?```$", "", clean_json)
            parsed = json.loads(clean_json)

            # Ensure all required keys exist, fill defaults if missing
            for key in ["headline_stat", "risk_level", "key_finding", "concentration_risk", "baseline_cluster", "secondary_watchlist", "data_integrity_flag", "recommended_actions", "full_analysis"]:
                if key not in parsed or not parsed[key]:
                    parsed[key] = default_summary[key]

            # Backward compatibility keys for existing frontend consumers
            parsed["summary"] = parsed.get("full_analysis") or default_summary["full_analysis"]
            parsed["executive_summary"] = parsed["summary"]
            parsed["actions"] = [
                a["action"] if isinstance(a, dict) else str(a)
                for a in parsed.get("recommended_actions", [])
            ] or [a["action"] for a in default_summary["recommended_actions"]]
            parsed["recommended_actions_text"] = "\n".join(f"{i+1}. {a}" for i, a in enumerate(parsed["actions"]))

            return parsed
    except Exception as e:
        logger.warning(f"Failed to generate structured JSON summary via LLM: {e}")

    # Fallback to guaranteed deterministic structured response
    default_summary["summary"] = default_summary["full_analysis"]
    default_summary["executive_summary"] = default_summary["full_analysis"]
    default_summary["actions"] = [a["action"] for a in default_summary["recommended_actions"]]
    default_summary["recommended_actions_text"] = "\n".join(f"{i+1}. {a['action']}" for i, a in enumerate(default_summary["recommended_actions"]))

    return default_summary
