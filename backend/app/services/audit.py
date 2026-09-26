from sqlmodel import Session

from app.models import AuditEvent


def record(db: Session, user_id: str, entity: str, action: str, fields: list[str] | None = None) -> None:
    """Log that something changed. Field names only; values are never stored."""
    db.add(AuditEvent(user_id=user_id, entity=entity, action=action, fields=sorted(fields or [])))
