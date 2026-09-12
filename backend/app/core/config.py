import os
from pathlib import Path
from dotenv import load_dotenv

_this_dir = Path(__file__).resolve().parent  # app/core/
_backend_dir = _this_dir.parent.parent       # backend/
_project_root = _backend_dir.parent          # Hackout26/

load_dotenv(_backend_dir / ".env")
load_dotenv(_project_root / ".env")

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "carbonsense")
