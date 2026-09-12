import os
from pathlib import Path
from dotenv import load_dotenv

# Walk up from this file to find .env at project root
_this_dir = Path(__file__).resolve().parent  # app/core/
_project_root = _this_dir.parent.parent.parent  # Hackout26_Muggles/
load_dotenv(_project_root / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
