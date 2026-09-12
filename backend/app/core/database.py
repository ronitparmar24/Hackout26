from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import DATABASE_URL

db_url = DATABASE_URL or "sqlite:///./carbonsense.db"
connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def init_db():
    """Create tables if they don't exist"""
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS runs (
                id TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                filename TEXT NOT NULL,
                total_suppliers INTEGER,
                total_emissions REAL,
                status TEXT NOT NULL DEFAULT 'processing'
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS suppliers (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
                supplier_name TEXT NOT NULL,
                tier TEXT NOT NULL,
                region TEXT,
                energy_kwh REAL,
                energy_kwh_estimated BOOLEAN NOT NULL DEFAULT 0,
                transport_km REAL,
                transport_km_estimated BOOLEAN NOT NULL DEFAULT 0,
                transport_mode TEXT,
                material_type TEXT NOT NULL,
                material_qty REAL,
                energy_emissions REAL,
                transport_emissions REAL,
                material_emissions REAL,
                total_emissions REAL,
                is_anomaly BOOLEAN NOT NULL DEFAULT 0,
                cluster_label INTEGER
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS recommendations (
                id TEXT PRIMARY KEY,
                supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
                recommended_supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
                similarity_score REAL NOT NULL,
                emissions_reduction_pct REAL
            )
        """))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

