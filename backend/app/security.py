"""Password hashing, cookie sessions and CSRF protection (standard library only).

- Passwords: scrypt with a per-user salt.
- Sessions: random token in an HttpOnly, SameSite=Lax cookie; only its SHA-256
  hash is stored, so a database leak doesn't expose live sessions.
- CSRF: double-submit token. State-changing requests must echo the readable
  `csrf_token` cookie in an X-CSRF-Token header.
"""
from __future__ import annotations

import hashlib
import hmac
import secrets
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request, Response
from sqlmodel import Session as DBSession
from sqlmodel import select

from app.config import COOKIE_SECURE, SESSION_DAYS
from app.db import get_session
from app.models import Session, User

SESSION_COOKIE = "session"
CSRF_COOKIE = "csrf_token"
_SCRYPT = dict(n=2**14, r=8, p=1, dklen=32)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, **_SCRYPT)
    return f"scrypt${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, salt_hex, digest_hex = stored.split("$")
    except ValueError:
        return False
    digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), **_SCRYPT)
    return hmac.compare_digest(digest.hex(), digest_hex)


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def start_session(db: DBSession, user: User, response: Response) -> None:
    token = secrets.token_urlsafe(32)
    csrf = secrets.token_urlsafe(24)
    expires = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
    db.add(Session(token_hash=token_hash(token), user_id=user.id, csrf_token=csrf, expires_at=expires))
    db.commit()
    max_age = SESSION_DAYS * 86400
    response.set_cookie(SESSION_COOKIE, token, max_age=max_age, httponly=True, samesite="lax",
                        secure=COOKIE_SECURE, path="/")
    response.set_cookie(CSRF_COOKIE, csrf, max_age=max_age, httponly=False, samesite="lax",
                        secure=COOKIE_SECURE, path="/")


def end_session(db: DBSession, request: Request, response: Response) -> None:
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        row = db.get(Session, token_hash(token))
        if row:
            db.delete(row)
            db.commit()
    response.delete_cookie(SESSION_COOKIE, path="/")
    response.delete_cookie(CSRF_COOKIE, path="/")


def revoke_all_sessions(db: DBSession, user_id: str) -> None:
    for row in db.exec(select(Session).where(Session.user_id == user_id)).all():
        db.delete(row)
    db.commit()


def current_user(request: Request, db: DBSession = Depends(get_session)) -> User:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(401, "Please sign in.")
    row = db.get(Session, token_hash(token))
    if not row or _aware(row.expires_at) < datetime.now(timezone.utc):
        raise HTTPException(401, "Your session has ended. Please sign in again.")
    if request.method not in ("GET", "HEAD", "OPTIONS"):
        header = request.headers.get("X-CSRF-Token", "")
        if not hmac.compare_digest(header, row.csrf_token):
            raise HTTPException(403, "This request couldn't be verified. Refresh the page and try again.")
    user = db.get(User, row.user_id)
    if not user:
        raise HTTPException(401, "Please sign in.")
    return user


class RateLimiter:
    """In-memory sliding window, enough for a single-process deployment."""

    def __init__(self, limit: int, window_seconds: int):
        self.limit, self.window = limit, window_seconds
        self.hits: dict[str, list[float]] = defaultdict(list)

    def check(self, key: str) -> None:
        now = time.monotonic()
        hits = [t for t in self.hits[key] if now - t < self.window]
        self.hits[key] = hits
        if len(hits) >= self.limit:
            raise HTTPException(429, "Too many attempts. Please wait a few minutes and try again.")

    def hit(self, key: str) -> None:
        self.hits[key].append(time.monotonic())

    def reset(self, key: str) -> None:
        self.hits.pop(key, None)


login_limiter = RateLimiter(limit=5, window_seconds=15 * 60)
reset_limiter = RateLimiter(limit=5, window_seconds=60 * 60)
