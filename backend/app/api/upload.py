import uuid
from datetime import datetime
import pandas as pd
from io import StringIO
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.core.database import get_db

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))
from app.services.climatiq_client import calculate_climatiq_emissions
from app.ml.regression import predict_missing
from app.ml.anomaly import detect_anomalies
from app.ml.clustering import cluster_suppliers
from app.ml.recommendations import generate_recommendations
from app.ai.risk import calculate_risk_score

router = APIRouter()


REQUIRED_COLS = {"supplier_name", "tier", "region", "energy_kwh", "transport_km",
                 "transport_mode", "material_type", "material_qty"}
VALID_TIERS = {"Tier 1", "Tier 2", "Tier 3"}
VALID_MODES = {"Road", "Rail", "Sea", "Air"}
VALID_MATERIALS = {"Steel", "Plastic", "Aluminum", "Textile", "Electronics"}


from app.core.auth import get_current_user, AuthenticatedUser


@router.post("/api/upload")
def upload_csv(
    file: UploadFile = File(...),
    db=Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files accepted")

    content = file.file.read().decode("utf-8")
    df = pd.read_csv(StringIO(content))

    # Validate columns
    missing = REQUIRED_COLS - set(df.columns)
    if missing:
        raise HTTPException(400, f"Missing columns: {missing}")

    # Validate categorical values
    bad_tiers = set(df["tier"].dropna()) - VALID_TIERS
    if bad_tiers:
        raise HTTPException(400, f"Invalid tiers: {bad_tiers}")
    bad_modes = set(df["transport_mode"].dropna()) - VALID_MODES
    if bad_modes:
        raise HTTPException(400, f"Invalid transport modes: {bad_modes}")
    bad_mats = set(df["material_type"].dropna()) - VALID_MATERIALS
    if bad_mats:
        raise HTTPException(400, f"Invalid material types: {bad_mats}")

    # Coerce numeric columns cleanly (handling spaces/empty strings gracefully)
    df["energy_kwh"] = pd.to_numeric(df["energy_kwh"], errors="coerce")
    df["transport_km"] = pd.to_numeric(df["transport_km"], errors="coerce")
    df["material_qty"] = pd.to_numeric(df["material_qty"], errors="coerce").fillna(1.0)

    # Create run record with authenticated user ownership
    run_id = str(uuid.uuid4())
    db.runs.insert_one({
        "id": run_id,
        "run_id": run_id,
        "user_id": current_user.user_id,
        "filename": file.filename,
        "total_suppliers": len(df),
        "total_emissions": 0.0,
        "status": "processing",
        "created_at": datetime.utcnow().isoformat(),
        "executive_summary": None,
        "recommended_actions": None,
    })

    # Process each row
    total_emissions_sum = 0
    suppliers = []

    for _, row in df.iterrows():
        energy = row["energy_kwh"] if pd.notna(row["energy_kwh"]) else None
        transport = row["transport_km"] if pd.notna(row["transport_km"]) else None
        
        energy_est = False
        transport_est = False

        if energy is None or transport is None:
            # Predict missing
            preds = predict_missing(row.to_dict())
            if energy is None:
                energy = float(preds.get("energy_kwh"))
                energy_est = True
            if transport is None:
                transport = float(preds.get("transport_km"))
                transport_est = True
        
        if energy is not None:
            energy = float(energy)
        if transport is not None:
            transport = float(transport)

        e_em, t_em, m_em, total, factor_source = calculate_climatiq_emissions(
            energy_kwh=energy,
            transport_km=transport,
            transport_mode=row["transport_mode"],
            material_type=row["material_type"],
            material_qty=row["material_qty"],
            region=row.get("region", "India"),
        )
        total_emissions_sum += total

        sup_id = str(uuid.uuid4())
        suppliers.append({
            "id": sup_id,
            "run_id": run_id,
            "supplier_name": str(row["supplier_name"]),
            "tier": str(row["tier"]),
            "region": str(row.get("region")) if pd.notna(row.get("region")) else None,
            "energy_kwh": energy,
            "energy_kwh_estimated": energy_est,
            "transport_km": transport,
            "transport_km_estimated": transport_est,
            "transport_mode": str(row["transport_mode"]),
            "material_type": str(row["material_type"]),
            "material_qty": float(row["material_qty"]),
            "energy_emissions": round(e_em, 4),
            "transport_emissions": round(t_em, 4),
            "material_emissions": round(m_em, 4),
            "total_emissions": round(total, 4),
            "emission_factor_source": factor_source,
            "risk_score": None,
            "risk_justification": None,
            "anomaly_reason": None,
        })

    # Bulk insert suppliers with ML anomaly & cluster tags
    if suppliers:
        anomalies = detect_anomalies(suppliers)
        clusters = cluster_suppliers(suppliers)
        max_em = max([float(s.get("total_emissions", 0)) for s in suppliers]) if suppliers else 1.0

        for i, sup in enumerate(suppliers):
            sup["is_anomaly"] = bool(anomalies[i])
            sup["cluster_label"] = int(clusters[i])

            # Populate risk_score and risk_reason right after clustering (fast batch analytical scoring)
            try:
                risk_info = calculate_risk_score(sup, max_emissions=max_em, skip_llm=True)
                sup["risk_score"] = risk_info["risk_score"]
                sup["risk_reason"] = risk_info["risk_reason"]
                sup["risk_justification"] = risk_info["risk_justification"]
                sup["anomaly_reason"] = risk_info["anomaly_reason"]
            except Exception:
                sup["risk_score"] = 50.0 if sup["is_anomaly"] else 20.0
                sup["risk_reason"] = "Standard risk profile."
                sup["risk_justification"] = "Standard risk profile."
                sup["anomaly_reason"] = None

        db.suppliers.insert_many(suppliers)

        # Generate recommendations
        recs = generate_recommendations(suppliers)
        if recs:
            sup_map = {s["id"]: s["supplier_name"] for s in suppliers}
            for r in recs:
                r["id"] = str(uuid.uuid4())
                r["run_id"] = run_id
                r["from_supplier"] = sup_map.get(r["supplier_id"], "Unknown")
                r["to_supplier"] = sup_map.get(r["recommended_supplier_id"], "Unknown")
            db.recommendations.insert_many(recs)

    # Update run record
    db.runs.update_one(
        {"id": run_id},
        {"$set": {"total_emissions": round(total_emissions_sum, 4), "status": "done"}}
    )

    return {
        "id": run_id,
        "run_id": run_id,
        "filename": file.filename,
        "total_suppliers": len(suppliers),
        "total_emissions": round(total_emissions_sum, 4),
        "status": "done",
    }
