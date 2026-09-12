import uuid
import pandas as pd
from io import StringIO
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))
from emission_factors import calculate_emissions
from app.ml.regression import predict_missing
from app.ml.anomaly import detect_anomalies
from app.ml.clustering import cluster_suppliers
from app.ml.recommendations import generate_recommendations

router = APIRouter()


REQUIRED_COLS = {"supplier_name", "tier", "region", "energy_kwh", "transport_km",
                 "transport_mode", "material_type", "material_qty"}
VALID_TIERS = {"Tier 1", "Tier 2", "Tier 3"}
VALID_MODES = {"Road", "Rail", "Sea", "Air"}
VALID_MATERIALS = {"Steel", "Plastic", "Aluminum", "Textile", "Electronics"}


@router.post("/api/upload")
def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
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

    # Create run record
    run_id = str(uuid.uuid4())
    db.execute(text(
        "INSERT INTO runs (id, filename, total_suppliers, status) VALUES (:id, :fn, :cnt, 'processing')"
    ), {"id": run_id, "fn": file.filename, "cnt": len(df)})
    db.commit()

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

        e_em, t_em, m_em, total = calculate_emissions(
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
            "id": sup_id, "run_id": run_id,
            "supplier_name": row["supplier_name"], "tier": row["tier"],
            "region": row.get("region"), "energy_kwh": energy,
            "energy_kwh_estimated": energy_est,
            "transport_km": transport, "transport_km_estimated": transport_est,
            "transport_mode": row["transport_mode"],
            "material_type": row["material_type"],
            "material_qty": float(row["material_qty"]),
            "energy_emissions": round(e_em, 4),
            "transport_emissions": round(t_em, 4),
            "material_emissions": round(m_em, 4),
            "total_emissions": round(total, 4),
        })

    # Bulk insert suppliers
    if suppliers:

        anomalies = detect_anomalies(suppliers)
        clusters = cluster_suppliers(suppliers)
        for i, sup in enumerate(suppliers):
            sup["is_anomaly"] = anomalies[i]
            sup["cluster_label"] = clusters[i]

        db.execute(text("""
            INSERT INTO suppliers (id, run_id, supplier_name, tier, region,
                energy_kwh, energy_kwh_estimated, transport_km, transport_km_estimated,
                transport_mode, material_type, material_qty,
                energy_emissions, transport_emissions, material_emissions, total_emissions,
                is_anomaly, cluster_label)
            VALUES (:id, :run_id, :supplier_name, :tier, :region,
                :energy_kwh, :energy_kwh_estimated, :transport_km, :transport_km_estimated,
                :transport_mode, :material_type, :material_qty,
                :energy_emissions, :transport_emissions, :material_emissions, :total_emissions,
                :is_anomaly, :cluster_label)
        """), suppliers)

        # Generate recommendations
        recs = generate_recommendations(suppliers)
        if recs:

            db.execute(text("""
                INSERT INTO recommendations (supplier_id, recommended_supplier_id,
                    similarity_score, emissions_reduction_pct)
                VALUES (:supplier_id, :recommended_supplier_id,
                    :similarity_score, :emissions_reduction_pct)
            """), recs)

    # Update run
    db.execute(text(
        "UPDATE runs SET total_emissions = :te, status = 'done' WHERE id = :id"
    ), {"te": round(total_emissions_sum, 4), "id": run_id})
    db.commit()

    return {
        "run_id": run_id,
        "filename": file.filename,
        "total_suppliers": len(suppliers),
        "total_emissions": round(total_emissions_sum, 4),
        "status": "done",
    }
