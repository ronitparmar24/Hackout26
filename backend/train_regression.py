import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.ml.regression import train_models

csv_path = backend_dir.parent / "demo_suppliers.csv"
if not csv_path.exists():
    csv_path = backend_dir / "demo_suppliers.csv"

print(f"Training Random Forest regression models using {csv_path}...")
mae_e, mae_t = train_models(str(csv_path))
print(f"Models trained successfully! MAE Energy: {mae_e:.2f}, MAE Transport: {mae_t:.2f}")
