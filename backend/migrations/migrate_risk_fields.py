"""
Migration Runner: migrate_risk_fields.py
Applies schema updates and backfills risk_score & risk_reason across all suppliers.
Supports MongoDB Atlas and SQLite legacy database.
"""
import sys
import os
from pathlib import Path

# Add backend root to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import db
from app.ai.risk import calculate_risk_score

def migrate_mongodb():
    print("[Migration] Checking MongoDB suppliers collection for risk fields...")
    # Find suppliers missing risk_score or risk_reason
    query = {
        "$or": [
            {"risk_score": {"$exists": False}},
            {"risk_reason": {"$exists": False}},
            {"risk_score": None},
            {"risk_reason": None}
        ]
    }
    suppliers_to_update = list(db.suppliers.find(query))
    total = len(suppliers_to_update)
    print(f"[Migration] Found {total} suppliers needing risk score / reason population.")

    updated = 0
    for s in suppliers_to_update:
        try:
            risk = calculate_risk_score(s)
            db.suppliers.update_one(
                {"id": s["id"]},
                {"$set": {
                    "risk_score": risk["risk_score"],
                    "risk_reason": risk["risk_reason"],
                    "risk_justification": risk["risk_justification"]
                }}
            )
            updated += 1
        except Exception as e:
            print(f"[Migration] Warning: Failed for supplier {s.get('id')}: {e}")

    print(f"[Migration] MongoDB migration complete: {updated}/{total} records updated.")

def migrate_sqlite():
    sqlite_file = backend_dir / "carbonsense.db"
    if not sqlite_file.exists():
        return
    print(f"[Migration] Checking SQLite database at {sqlite_file}...")
    import sqlite3
    conn = sqlite3.connect(str(sqlite_file))
    cur = conn.cursor()

    # Check columns
    cur.execute("PRAGMA table_info(suppliers)")
    cols = [col[1] for col in cur.fetchall()]

    if "risk_score" not in cols:
        print("[Migration] Adding risk_score column to SQLite suppliers table...")
        cur.execute("ALTER TABLE suppliers ADD COLUMN risk_score REAL DEFAULT NULL")
    
    if "risk_reason" not in cols:
        print("[Migration] Adding risk_reason column to SQLite suppliers table...")
        cur.execute("ALTER TABLE suppliers ADD COLUMN risk_reason TEXT DEFAULT NULL")
    
    conn.commit()
    conn.close()
    print("[Migration] SQLite columns verified/added.")

if __name__ == "__main__":
    migrate_sqlite()
    migrate_mongodb()
