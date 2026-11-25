import sys
from pathlib import Path

# Ensure the backend directory is in python search path
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Import the existing production FastAPI app
from app.main import app
