"""Create patient alerts from reviewed update-feed entries."""
import json
import smtplib
from datetime import date, datetime, timezone
from pathlib import Path

from sqlmodel import Session, select

from app.config import FRONTEND_URL
from app.models import NotificationPreference, User, VaccineUpdateNotification
from app.services import intake
from app.services.email import email_ready, send_vaccine_update
from engine import assess, set_for_jurisdiction

RELEVANT_STATUSES = {"RECOMMENDED", "MAY_BE_APPROPRIATE", "REVIEW_WITH_PROFESSIONAL"}


def update_feed() -> list[dict]:
    path = Path(__file__).resolve().parents[3] / "frontend" / "src" / "data" / "updates.json"
    try:
        with path.open(encoding="utf-8") as file:
            data = json.load(file)
        return data if isinstance(data, list) else []
    except (OSError, json.JSONDecodeError):
        return []


def _current_result(db: Session, user: User) -> dict | None:
    data = intake.load(db, user)
    location = data.get("location")
    guideline = set_for_jurisdiction(location.country_code if location else None)
    if not guideline:
        return None
    return assess(intake.to_facts(data), guideline)


def _matches(update: dict, result: dict | None) -> bool:
    engine_id = update.get("engineVaccineId")
    if not engine_id or not result:
        return False
    if update.get("jurisdiction") != (result.get("guidelineSet") or {}).get("jurisdiction"):
        return False
    matched = next((item for item in result.get("results", []) if item.get("vaccineId") == engine_id), None)
    return bool(matched and matched.get("status") in RELEVANT_STATUSES)


def _reviewed_update(update: dict) -> bool:
    """Fail closed on incomplete or undated editorial entries."""
    required = ("id", "date", "reviewedAt", "sourceUrl", "jurisdiction", "engineVaccineId", "title", "summary")
    if not all(update.get(field) for field in required) or update.get("type") not in {"new", "updated"}:
        return False
    if not str(update["sourceUrl"]).startswith("https://"):
        return False
    try:
        date.fromisoformat(update["date"])
        date.fromisoformat(update["reviewedAt"])
    except (TypeError, ValueError):
        return False
    return True


def sync_user_notifications(db: Session, user: User, pref: NotificationPreference) -> dict:
    """Create unseen alerts and send consented email alerts for one patient."""
    result = _current_result(db, user)
    existing = {
        row.update_id: row
        for row in db.exec(select(VaccineUpdateNotification).where(VaccineUpdateNotification.user_id == user.id)).all()
    }
    delivery = "disabled" if not pref.email_updates else ("ready" if email_ready() else "not_configured")

    for update in update_feed():
        if not _reviewed_update(update) or not _matches(update, result):
            continue
        try:
            published = date.fromisoformat(update["date"])
        except (KeyError, TypeError, ValueError):
            continue

        in_app_new = pref.in_app_updates and published >= pref.in_app_since.date()
        email_new = bool(pref.email_updates and pref.email_since and published >= pref.email_since.date())
        if not in_app_new and not email_new:
            continue

        row = existing.get(update.get("id"))
        if row is None:
            row = VaccineUpdateNotification(
                user_id=user.id,
                update_id=update["id"],
                vaccine_id=update["engineVaccineId"],
                title=update["title"],
                summary=update["summary"],
                kind=update.get("type", "updated"),
                source_url=update["sourceUrl"],
            )
            db.add(row)
            db.flush()
            existing[row.update_id] = row

        if email_new and not row.email_sent_at and email_ready():
            vaccine_id = update.get("vaccineId")
            page_path = f"/vaccine-library/{vaccine_id}" if vaccine_id else "/reminders"
            try:
                sent = send_vaccine_update(
                    user.email,
                    row.title,
                    row.summary,
                    f"{FRONTEND_URL.rstrip('/')}{page_path}",
                    row.source_url,
                )
                if sent:
                    row.email_sent_at = datetime.now(timezone.utc)
                    db.add(row)
            except (smtplib.SMTPException, OSError, TimeoutError, ValueError):
                delivery = "retry_later"

    db.commit()
    rows = db.exec(
        select(VaccineUpdateNotification)
        .where(VaccineUpdateNotification.user_id == user.id)
        .order_by(VaccineUpdateNotification.created_at.desc())
    ).all()
    visible = []
    if pref.in_app_updates:
        for row in rows:
            matched = next((item for item in (result or {}).get("results", []) if item.get("vaccineId") == row.vaccine_id), None)
            visible.append({
                "id": row.id,
                "updateId": row.update_id,
                "vaccineId": row.vaccine_id,
                "title": row.title,
                "summary": row.summary,
                "kind": row.kind,
                "sourceUrl": row.source_url,
                "createdAt": row.created_at.isoformat(),
                "read": row.read_at is not None,
                "relevantToAssessment": bool(matched and matched.get("status") in RELEVANT_STATUSES),
            })
    return {
        "items": visible,
        "unreadCount": sum(row.read_at is None for row in rows) if pref.in_app_updates else 0,
        "emailDelivery": delivery,
    }
