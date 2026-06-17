"""Root WSGI entrypoint for platforms that import app:app from repo root."""

from importlib import util
from pathlib import Path
import sys

BACKEND_DIR = Path(__file__).resolve().parent / "backend"
BACKEND_APP = BACKEND_DIR / "app.py"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

spec = util.spec_from_file_location("docnova_backend_app", BACKEND_APP)
if spec is None or spec.loader is None:
    raise RuntimeError("Unable to load backend app")

module = util.module_from_spec(spec)
spec.loader.exec_module(module)

app = module.app
