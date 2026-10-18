"""One-shot worker for scheduled patient vaccine-update alerts.

Run from the backend directory with ``python -m app.notification_worker``.
Schedule this command every 15 minutes on the production host.
"""
import logging
import sys
from pathlib import Path

from sqlmodel import Session, select

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.db import engine, init_db
from app.models import NotificationPreference, User
from app.services.notifications import sync_user_notifications

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("vaccine_alert_worker")


def run_once() -> tuple[int, int]:
    """Check enabled patient accounts. Return (checked, failed)."""
    init_db()
    checked = 0
    failed = 0
    with Session(engine) as db:
        preferences = db.exec(
            select(NotificationPreference).where(
                (NotificationPreference.in_app_updates == True)  # noqa: E712
                | (NotificationPreference.email_updates == True)  # noqa: E712
            )
        ).all()
        for pref in preferences:
            user = db.get(User, pref.user_id)
            if not user:
                continue
            try:
                sync_user_notifications(db, user, pref)
                checked += 1
            except Exception:
                db.rollback()
                failed += 1
                # Never log the patient email or profile data.
                logger.exception("Failed to check one patient alert account")
    return checked, failed


if __name__ == "__main__":
    total, errors = run_once()
    logger.info("Alert check finished: %d accounts checked, %d failed", total, errors)
    raise SystemExit(1 if errors else 0)
