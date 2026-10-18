"""Minimal SMTP transport for opt-in vaccine update messages."""
import smtplib
from email.message import EmailMessage

from app.config import FRONTEND_URL, SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME


def email_ready() -> bool:
    return bool(SMTP_HOST and SMTP_FROM)


def send_vaccine_update(to: str, title: str, summary: str, link: str, source_url: str) -> bool:
    """Send a short, non-diagnostic alert. Returns False if transport is unset."""
    if not email_ready():
        return False
    message = EmailMessage()
    message["Subject"] = f"SmartVax India update: {title}"
    message["From"] = SMTP_FROM
    message["To"] = to
    message.set_content(
        f"{title}\n\n{summary}\n\nThis update may be relevant to your profile. "
        "It is educational information, not a recommendation to receive a vaccine. "
        "Discuss your health history with a qualified healthcare professional.\n\n"
        f"Read the update: {link}\nSource: {source_url}\n\n"
        f"Manage email alerts: {FRONTEND_URL.rstrip('/')}/login?next=%2Fnotifications"
    )
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as client:
        client.starttls()
        if SMTP_USERNAME:
            client.login(SMTP_USERNAME, SMTP_PASSWORD)
        client.send_message(message)
    return True
