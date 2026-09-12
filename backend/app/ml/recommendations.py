import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def generate_recommendations(suppliers: list[dict]) -> list[dict]:
    """
    For each high-impact supplier, find a similar lower-emission supplier
    (same tier/material) and return recommendation dicts.
    """
    if len(suppliers) < 2:
        return []

    # Build feature vectors for cosine similarity
    # Use: tier, material_type (one-hot), energy_kwh, transport_km, material_qty (scaled)
    tiers = [[s["tier"]] for s in suppliers]
    materials = [[s["material_type"]] for s in suppliers]

    enc = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
    cat_features = enc.fit_transform([t + m for t, m in zip(tiers, materials)])

    num_features = np.array([
        [float(s.get("energy_kwh") or 0),
         float(s.get("transport_km") or 0),
         float(s.get("material_qty") or 0)]
        for s in suppliers
    ])
    scaler = StandardScaler()
    num_scaled = scaler.fit_transform(num_features)

    feature_matrix = np.hstack([cat_features, num_scaled])

    # Compute pairwise cosine similarity
    sim_matrix = cosine_similarity(feature_matrix)

    # Get total emissions for ranking
    emissions = [float(s.get("total_emissions") or 0) for s in suppliers]
    median_emissions = float(np.median(emissions))

    recommendations = []

    for i, sup in enumerate(suppliers):
        # Only recommend for high-impact suppliers (above median)
        if emissions[i] <= median_emissions:
            continue

        best_j = None
        best_score = -1

        for j, candidate in enumerate(suppliers):
            if i == j:
                continue
            # Must be same tier and material
            if candidate["tier"] != sup["tier"]:
                continue
            if candidate["material_type"] != sup["material_type"]:
                continue
            # Candidate must have lower emissions
            if emissions[j] >= emissions[i]:
                continue

            score = float(sim_matrix[i][j])
            if score > best_score:
                best_score = score
                best_j = j

        if best_j is not None and best_score > 0:
            reduction_pct = round(
                (emissions[i] - emissions[best_j]) / emissions[i] * 100, 2
            )
            recommendations.append({
                "supplier_id": sup["id"],
                "recommended_supplier_id": suppliers[best_j]["id"],
                "similarity_score": round(best_score, 4),
                "emissions_reduction_pct": reduction_pct,
            })

    return recommendations
