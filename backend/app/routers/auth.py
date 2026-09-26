import logging
import re
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field, field_validator
from sqlmodel import Session, select

from app.config import DEMO_MODE, FRONTEND_URL
from app.db import get_session
from app.models import PasswordReset, User
from app.security import (
    current_user, end_session, hash_password, login_limiter, reset_limiter, revoke_all_sessions,
    start_session, token_hash, verify_password,
)
from app.services import audit, intake

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
log = logging.getLogger("auth")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class EmailModel(BaseModel):
    email: str = Field(max_length=254)

    @field_validator("email")
    @classmethod
    def normalise(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_RE.match(v):
            raise ValueError("Enter an email address like name@example.com.")
        return v


class Credentials(EmailModel):
    password: str = Field(min_length=1, max_length=200)


class Signup(EmailModel):
    password: str = Field(max_length=200)

    @field_validator("password")
    @classmethod
    def strong_enough(cls, v: str) -> str:
        if len(v) < 10:
            raise ValueError("Use at least 10 characters.")
        return v


class Reset(BaseModel):
    token: str = Field(min_length=10, max_length=200)
    password: str = Field(max_length=200)

    @field_validator("password")
    @classmethod
    def strong_enough(cls, v: str) -> str:
        if len(v) < 10:
            raise ValueError("Use at least 10 characters.")
        return v


def _me(db: Session, user: User) -> dict:
    return {"user": {"id": user.id, "email": user.email}, "progress": intake.progress(user, intake.load(db, user))}


@router.post("/signup", status_code=201)
def signup(body: Signup, response: Response, db: Session = Depends(get_session)):
    if db.exec(select(User).where(User.email == body.email)).first():
        raise HTTPException(409, "An account with this email already exists. Try signing in instead.")
    user = User(email=body.email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    audit.record(db, user.id, "account", "created")
    start_session(db, user, response)
    return _me(db, user)


@router.post("/login")
def login(body: Credentials, request: Request, response: Response, db: Session = Depends(get_session)):
    key = f"{body.email}|{request.client.host if request.client else ''}"
    login_limiter.check(key)
    user = db.exec(select(User).where(User.email == body.email)).first()
    if not user or not verify_password(body.password, user.password_hash):
        login_limiter.hit(key)
        raise HTTPException(401, "That email and password don't match an account.")
    login_limiter.reset(key)
    start_session(db, user, response)
    return _me(db, user)


@router.post("/logout", status_code=204)
def logout(request: Request, response: Response, db: Session = Depends(get_session), _: User = Depends(current_user)):
    end_session(db, request, response)


@router.get("/me")
def me(request: Request, db: Session = Depends(get_session)):
    """Who is signed in. Anonymous visitors get {"user": null} rather than an error."""
    try:
        user = current_user(request, db)
    except HTTPException:
        return {"user": None, "progress": None}
    return _me(db, user)


@router.post("/forgot")
def forgot(body: EmailModel, request: Request, db: Session = Depends(get_session)):
    reset_limiter.check(request.client.host if request.client else "unknown")
    reset_limiter.hit(request.client.host if request.client else "unknown")
    message = "If an account exists for that email, we've sent a link to reset the password."
    user = db.exec(select(User).where(User.email == body.email)).first()
    if not user:
        return {"message": message}
    token = secrets.token_urlsafe(32)
    db.add(PasswordReset(token_hash=token_hash(token), user_id=user.id,
                         expires_at=datetime.now(timezone.utc) + timedelta(hours=1)))
    db.commit()
    link = f"{FRONTEND_URL}/reset-password?token={token}"
    # No email service is connected. In demo mode the link is returned so the
    # flow can be completed; it is never logged.
    if DEMO_MODE:
        return {"message": message, "demoResetLink": link}
    return {"message": message}


@router.post("/reset")
def reset(body: Reset, response: Response, db: Session = Depends(get_session)):
    row = db.get(PasswordReset, token_hash(body.token))
    expires = row.expires_at if row and row.expires_at.tzinfo else (row.expires_at.replace(tzinfo=timezone.utc) if row else None)
    if not row or row.used or expires < datetime.now(timezone.utc):
        raise HTTPException(400, "This reset link has expired or already been used. Request a new one.")
    user = db.get(User, row.user_id)
    user.password_hash = hash_password(body.password)
    row.used = True
    db.add_all([user, row])
    db.commit()
    revoke_all_sessions(db, user.id)
    audit.record(db, user.id, "account", "password_reset")
    db.commit()
    start_session(db, user, response)
    return _me(db, user)
