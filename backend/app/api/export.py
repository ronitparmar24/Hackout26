import io
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.core.database import get_db
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

router = APIRouter()


@router.get("/api/export/csv/{run_id}")
def export_csv(run_id: str, db=Depends(get_db)):
    # Verify run exists
    run = db.runs.find_one({"id": run_id})
    if not run:
        raise HTTPException(404, "Run not found")

    rows = list(db.suppliers.find({"run_id": run_id}, {"_id": 0}).sort("total_emissions", -1))

    cols = [
        "supplier_name", "tier", "region", "energy_kwh", "energy_kwh_estimated",
        "transport_km", "transport_km_estimated", "transport_mode", "material_type",
        "material_qty", "energy_emissions", "transport_emissions", "material_emissions",
        "total_emissions", "is_anomaly", "cluster_label"
    ]

    df = pd.DataFrame(rows)
    # Ensure all expected columns are present
    for col in cols:
        if col not in df.columns:
            df[col] = None
    df = df[cols]

    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=suppliers_{run_id}.csv"}
    )


@router.get("/api/export/pdf/{run_id}")
def export_pdf(run_id: str, db=Depends(get_db)):
    run = db.runs.find_one({"id": run_id})
    if not run:
        raise HTTPException(404, "Run not found")

    suppliers = list(db.suppliers.find({"run_id": run_id}, {"_id": 0}).sort("total_emissions", -1))
    anomalies = [s for s in suppliers if s.get("is_anomaly")]

    recs = list(db.recommendations.find({"run_id": run_id}, {"_id": 0}).sort("emissions_reduction_pct", -1))
    sup_map = {s["id"]: s["supplier_name"] for s in suppliers}
    for r in recs:
        if "from_supplier" not in r:
            r["from_supplier"] = sup_map.get(r.get("supplier_id"), "Unknown")
        if "to_supplier" not in r:
            r["to_supplier"] = sup_map.get(r.get("recommended_supplier_id"), "Unknown")

    # Cluster summary using MongoDB aggregation
    pipeline = [
        {"$match": {"run_id": run_id}},
        {"$group": {
            "_id": "$cluster_label",
            "count": {"$sum": 1},
            "avg_emissions": {"$avg": "$total_emissions"}
        }},
        {"$sort": {"_id": 1}}
    ]
    cluster_data = [(doc["_id"], doc["count"], doc["avg_emissions"] or 0) for doc in db.suppliers.aggregate(pipeline)]

    # Build PDF
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph("Carbon-Aware Supply Chain Report", styles["Title"]))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"Run ID: {run_id}", styles["Normal"]))
    elements.append(Paragraph(f"File: {run.get('filename')}", styles["Normal"]))
    elements.append(Paragraph(f"Total Suppliers: {run.get('total_suppliers')}", styles["Normal"]))
    total_emissions_val = float(run.get("total_emissions") or 0)
    elements.append(Paragraph(f"Total Emissions: {total_emissions_val:,.2f} kg CO2e", styles["Normal"]))
    elements.append(Spacer(1, 15))

    # Top 10 Emitters
    elements.append(Paragraph("Top 10 Emitters", styles["Heading2"]))
    top_data = [["Supplier", "Tier", "Emissions (kg CO2e)"]]
    for s in suppliers[:10]:
        top_data.append([s.get("supplier_name", ""), s.get("tier", ""), f"{float(s.get('total_emissions', 0)):,.2f}"])
    t = Table(top_data, colWidths=[200, 60, 120])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2d3748")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7fafc")]),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 15))

    # Anomalies
    elements.append(Paragraph(f"Anomalies Detected: {len(anomalies)}", styles["Heading2"]))
    if anomalies:
        anom_data = [["Supplier", "Tier", "Emissions"]]
        for a in anomalies:
            anom_data.append([a.get("supplier_name", ""), a.get("tier", ""), f"{float(a.get('total_emissions', 0)):,.2f}"])
        t2 = Table(anom_data, colWidths=[200, 60, 120])
        t2.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e53e3e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(t2)
    elements.append(Spacer(1, 15))

    # Clusters
    elements.append(Paragraph("Cluster Summary", styles["Heading2"]))
    cl_data = [["Cluster", "Suppliers", "Avg Emissions"]]
    for c in cluster_data:
        cl_data.append([str(c[0]), str(c[1]), f"{float(c[2]):,.2f}"])
    t3 = Table(cl_data, colWidths=[80, 80, 120])
    t3.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2b6cb0")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(t3)
    elements.append(Spacer(1, 15))

    # Recommendations
    if recs:
        elements.append(Paragraph("Recommendations", styles["Heading2"]))
        rec_data = [["From", "To", "Similarity", "Reduction %"]]
        for r in recs:
            rec_data.append([
                r.get("from_supplier", ""),
                r.get("to_supplier", ""),
                f"{float(r.get('similarity_score', 0)):.4f}",
                f"{float(r.get('emissions_reduction_pct', 0)):.1f}%"
            ])
        t4 = Table(rec_data, colWidths=[130, 130, 70, 70])
        t4.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#38a169")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 7),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(t4)

    doc.build(elements)
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{run_id}.pdf"}
    )
