from fastapi import APIRouter

from app.config import APP_VERSION, DEMO_MODE

router = APIRouter(prefix="/api/v1", tags=["system"])


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/meta")
def meta():
    """Facts the UI needs to label data honestly."""
    return {
        "version": APP_VERSION,
        "demoMode": DEMO_MODE,
        "disclaimer": (
            "Information to support a conversation with a healthcare professional. "
            "Not a diagnosis or prescription."
        ),
    }
