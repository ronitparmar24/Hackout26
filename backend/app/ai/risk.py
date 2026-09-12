from app.ai.llm import generate_ai_response


def calculate_risk_score(
    supplier_data: dict, max_emissions: float = 1000000.0
) -> dict:
    """
    Computes 0-100 Supply Chain Risk Score and generates a 1-sentence LLM justification.
    Formula based on:
    - Anomaly flag (+35)
    - Cluster label (+0 to +20)
    - Normalized emissions magnitude (up to +30)
    - Estimated data flags (+15)
    """
    score = 10.0  # Baseline

    # 1. Anomaly Flag (+35)
    is_anomaly = bool(supplier_data.get("is_anomaly"))
    if is_anomaly:
        score += 35.0

    # 2. Cluster Label (+0 to +20)
    cluster = int(supplier_data.get("cluster_label", 0))
    if cluster == 1:
        score += 10.0
    elif cluster >= 2:
        score += 20.0

    # 3. Estimated Data Flags (+15)
    energy_est = bool(supplier_data.get("energy_kwh_estimated"))
    trans_est = bool(supplier_data.get("transport_km_estimated"))
    if energy_est or trans_est:
        score += 15.0

    # 4. Normalized Emissions Magnitude (up to +30)
    tot_em = float(supplier_data.get("total_emissions") or 0)
    if max_emissions > 0:
        ratio = min(1.0, tot_em / max_emissions)
        score += ratio * 30.0

    final_score = round(min(100.0, max(0.0, score)), 1)

    # Generate 1-sentence LLM justification
    prompt = (
        f"Generate exactly ONE concise sentence explaining the risk reason for this supplier:\n"
        f"Supplier: {supplier_data.get('supplier_name')}\n"
        f"Risk Score: {final_score}/100\n"
        f"Anomaly Outlier: {is_anomaly}\n"
        f"Cluster Cohort: {cluster}\n"
        f"Emissions: {tot_em:,.1f} kg CO2e\n"
        f"Estimated Data: energy={energy_est}, transit={trans_est}\n"
        f"Material: {supplier_data.get('material_type')}, Mode: {supplier_data.get('transport_mode')}\n\n"
        f"Sentence:"
    )

    try:
        justification = generate_ai_response(prompt=prompt)
        # Ensure it is a clean single sentence
        justification = justification.strip().split("\n")[0].strip('"\'. ') + "."
    except Exception:
        if is_anomaly:
            justification = f"Flagged as high risk (Score {final_score}) due to statistical carbon divergence and high emissions in {supplier_data.get('material_type', 'materials')}."
        elif energy_est or trans_est:
            justification = f"Moderate risk profile (Score {final_score}) driven by imputed energy/transit metrics requiring primary supplier verification."
        else:
            justification = f"Standard risk profile (Score {final_score}) operating within normal cluster baselines."

    return {
        "risk_score": final_score,
        "risk_reason": justification,
        # Keep alias for backwards compatibility
        "risk_justification": justification,
        "anomaly_reason": "High variance relative to cluster peers" if is_anomaly else None,
    }
