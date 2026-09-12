import io
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

router = APIRouter()


@router.get("/api/export/csv/{run_id}")
def export_csv(run_id: str, db: Session = Depends(get_db)):
    # Verify run exists
    run = db.execute(text("SELECT * FROM runs WHERE id = :id"), {"id": run_id}).fetchone()
    if not run:
        raise HTTPException(404, "Run not found")

    rows = db.execute(text(
        "SELECT supplier_name, tier, region, energy_kwh, energy_kwh_estimated, "
        "transport_km, transport_km_estimated, transport_mode, material_type, material_qty, "
        "energy_emissions, transport_emissions, material_emissions, total_emissions, "
        "is_anomaly, cluster_label "
        "FROM suppliers WHERE run_id = :id ORDER BY total_emissions DESC"
    ), {"id": run_id}).fetchall()

    df = pd.DataFrame(rows, columns=[
        "supplier_name", "tier", "region", "energy_kwh", "energy_kwh_estimated",
        "transport_km", "transport_km_estimated", "transport_mode", "material_type",
        "material_qty", "energy_emissions", "transport_emissions", "material_emissions",
        "total_emissions", "is_anomaly", "cluster_label"
    ])

    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=suppliers_{run_id}.csv"}
    )


@router.get("/api/export/pdf/{run_id}")
def export_pdf(run_id: str, db: Session = Depends(get_db)):
    run = db.execute(text("SELECT * FROM runs WHERE id = :id"), {"id": run_id}).fetchone()
    if not run:
        raise HTTPException(404, "Run not found")

    suppliers = db.execute(text(
        "SELECT supplier_name, tier, total_emissions, is_anomaly, cluster_label "
        "FROM suppliers WHERE run_id = :id ORDER BY total_emissions DESC"
    ), {"id": run_id}).fetchall()

    anomalies = [s for s in suppliers if s.is_anomaly]

    recs = db.execute(text("""
        SELECT s1.supplier_name as from_supplier, s2.supplier_name as to_supplier,
               r.similarity_score, r.emissions_reduction_pct
        FROM recommendations r
        JOIN suppliers s1 ON r.supplier_id = s1.id
        JOIN suppliers s2 ON r.recommended_supplier_id = s2.id
        WHERE s1.run_id = :id
        ORDER BY r.emissions_reduction_pct DESC
    """), {"id": run_id}).fetchall()

    # Cluster summary
    cluster_data = db.execute(text(
        "SELECT cluster_label, count(*), round(avg(total_emissions)::numeric, 2) "
        "FROM suppliers WHERE run_id = :id GROUP BY cluster_label ORDER BY cluster_label"
    ), {"id": run_id}).fetchall()

    # Build PDF
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph("Carbon-Aware Supply Chain Report", styles["Title"]))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"Run ID: {run_id}", styles["Normal"]))
    elements.append(Paragraph(f"File: {run.filename}", styles["Normal"]))
    elements.append(Paragraph(f"Total Suppliers: {run.total_suppliers}", styles["Normal"]))
    elements.append(Paragraph(f"Total Emissions: {run.total_emissions:,.2f} kg CO2e", styles["Normal"]))
    elements.append(Spacer(1, 15))

    # Top 10 Emitters
    elements.append(Paragraph("Top 10 Emitters", styles["Heading2"]))
    top_data = [["Supplier", "Tier", "Emissions (kg CO2e)"]]
    for s in suppliers[:10]:
        top_data.append([s.supplier_name, s.tier, f"{float(s.total_emissions):,.2f}"])
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
            anom_data.append([a.supplier_name, a.tier, f"{float(a.total_emissions):,.2f}"])
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
            rec_data.append([r.from_supplier, r.to_supplier,
                           f"{float(r.similarity_score):.4f}",
                           f"{float(r.emissions_reduction_pct):.1f}%"])
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
