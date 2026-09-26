"""Runtime configuration, read from environment variables.

No secrets live in code. Defaults are safe for local development only.
"""
import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent


def _bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _list(name: str, default: list[str]) -> list[str]:
    raw = os.getenv(name)
    if not raw:
        return default
    return [item.strip() for item in raw.split(",") if item.strip()]


DATABASE_URL = os.getenv(
    "DATABASE_URL", f"sqlite:///{(BACKEND_DIR / 'data' / 'app.db').as_posix()}"
)

# Demo mode: provider, availability and price records are simulated and must be
# labelled as such in every API response and in the UI.
DEMO_MODE = _bool("DEMO_MODE", True)

# Explicit origins only. Credentials (cookies) are never combined with "*".
CORS_ORIGINS = _list("CORS_ORIGINS", ["http://localhost:5173", "http://127.0.0.1:5173"])

APP_VERSION = "0.2.0"

# Session cookies. Set COOKIE_SECURE=true whenever the app is served over HTTPS.
SESSION_DAYS = int(os.getenv("SESSION_DAYS", "14"))
COOKIE_SECURE = _bool("COOKIE_SECURE", False)

# Where the frontend lives, used to build password-reset links.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Demo data (providers, availability, prices), never mixed with verified data.
DEMO_DATA_DIR = PROJECT_ROOT / "data" / "demo"
