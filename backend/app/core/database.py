import os
import sqlite3
from pathlib import Path
from pymongo import MongoClient, ASCENDING, DESCENDING
from app.core.config import MONGODB_URL, MONGODB_DB_NAME

# Initialize MongoDB client & database
client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
db = client[MONGODB_DB_NAME]


def init_db():
    """Ensure indexes and seed initial/migrated data in MongoDB."""
    try:
        # Test connection
        client.admin.command("ping")
        print(f"[MongoDB] Connected successfully to database '{MONGODB_DB_NAME}'.")
    except Exception as e:
        print(f"[MongoDB] Warning: Could not connect to MongoDB: {e}")

    # Create indexes for high performance
    try:
        db.runs.create_index([("id", ASCENDING)], unique=True)
        db.runs.create_index([("created_at", DESCENDING)])
        db.suppliers.create_index([("id", ASCENDING)], unique=True)
        db.suppliers.create_index([("run_id", ASCENDING)])
        db.suppliers.create_index([("total_emissions", DESCENDING)])
        db.recommendations.create_index([("run_id", ASCENDING)])
        db.company_settings.create_index([("id", ASCENDING)], unique=True)
        db.applied_recommendations.create_index([("id", ASCENDING)], unique=True)
    except Exception as e:
        print(f"[MongoDB] Index creation note: {e}")

    # Ensure default company settings exist
    if db.company_settings.find_one({"id": "default"}) is None:
        db.company_settings.insert_one({
            "id": "default",
            "company_name": "Acme Corp",
            "industry": "Manufacturing",
            "target_reduction_pct": 0.0,
            "baseline_year": 2023,
            "currency": "USD",
            "default_region": "Global"
        })

    # Auto-migrate SQLite data if MongoDB is empty
    migrate_from_sqlite_if_needed()

    # Backfill risk_score and risk_reason on suppliers
    migrate_supplier_risk_fields()


def migrate_supplier_risk_fields():
    """Ensure all existing suppliers have risk_score and risk_reason populated."""
    from app.ai.risk import calculate_risk_score
    suppliers_needing_risk = list(db.suppliers.find({"risk_reason": {"$exists": False}}))
    if not suppliers_needing_risk:
        return
    print(f"[MongoDB Migration] Backfilling risk_score and risk_reason for {len(suppliers_needing_risk)} suppliers...")
    for s in suppliers_needing_risk:
        try:
            risk = calculate_risk_score(s, skip_llm=True)
            db.suppliers.update_one(
                {"id": s["id"]},
                {"$set": {
                    "risk_score": risk["risk_score"],
                    "risk_reason": risk["risk_reason"],
                    "risk_justification": risk["risk_justification"]
                }}
            )
        except Exception:
            pass
    print("[MongoDB Migration] Supplier risk fields migration complete!")


def migrate_from_sqlite_if_needed():
    """Migrate legacy SQLite data if MongoDB runs collection is currently empty."""
    if db.runs.count_documents({}) > 0:
        return

    sqlite_path = Path(__file__).resolve().parent.parent.parent / "carbonsense.db"
    if not sqlite_path.exists():
        return

    print(f"[MongoDB Migration] Migrating existing SQLite data from {sqlite_path}...")
    try:
        conn = sqlite3.connect(str(sqlite_path))
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # Migrate runs
        cur.execute("SELECT * FROM runs")
        runs = [dict(r) for r in cur.fetchall()]
        if runs:
            db.runs.insert_many(runs)
            print(f"[MongoDB Migration] Migrated {len(runs)} runs.")

        # Migrate suppliers
        cur.execute("SELECT * FROM suppliers")
        suppliers = [dict(s) for s in cur.fetchall()]
        if suppliers:
            # Convert integer booleans
            for s in suppliers:
                s["energy_kwh_estimated"] = bool(s.get("energy_kwh_estimated"))
                s["transport_km_estimated"] = bool(s.get("transport_km_estimated"))
                s["is_anomaly"] = bool(s.get("is_anomaly"))
            db.suppliers.insert_many(suppliers)
            print(f"[MongoDB Migration] Migrated {len(suppliers)} suppliers.")

        # Migrate recommendations with supplier names attached
        cur.execute("""
            SELECT r.*, s1.supplier_name as from_supplier, s2.supplier_name as to_supplier, s1.run_id
            FROM recommendations r
            JOIN suppliers s1 ON r.supplier_id = s1.id
            JOIN suppliers s2 ON r.recommended_supplier_id = s2.id
        """)
        recs = [dict(r) for r in cur.fetchall()]
        if recs:
            db.recommendations.insert_many(recs)
            print(f"[MongoDB Migration] Migrated {len(recs)} recommendations.")

        # Migrate company settings
        cur.execute("SELECT * FROM company_settings WHERE id = 'default'")
        row = cur.fetchone()
        if row:
            db.company_settings.update_one({"id": "default"}, {"$set": dict(row)}, upsert=True)

        # Migrate applied recommendations
        cur.execute("SELECT * FROM applied_recommendations")
        applied = [dict(a) for a in cur.fetchall()]
        if applied:
            db.applied_recommendations.insert_many(applied)

        conn.close()
        print("[MongoDB Migration] Migration complete!")
    except Exception as e:
        print(f"[MongoDB Migration] Warning during migration: {e}")


def get_db():
    """Dependency that returns the MongoDB database instance."""
    yield db
