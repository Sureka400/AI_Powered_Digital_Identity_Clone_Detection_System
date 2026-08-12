"""SMTP email delivery used by password-reset and alert flows."""

import logging
import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

from dotenv import load_dotenv


# Use an explicit path so this works whether Uvicorn is started from backend/
# (``uvicorn app:app --reload``) or another working directory.
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

logger = logging.getLogger(__name__)


class EmailDeliveryError(RuntimeError):
    """Raised when SMTP cannot deliver an email safely."""


def _smtp_settings() -> tuple[str, str, str, int]:
    """Read SMTP settings without ever logging credential values."""
    smtp_email = os.getenv("SMTP_EMAIL", "").strip()
    # Gmail displays app passwords in groups of four. Remove copied spaces.
    smtp_password = "".join(os.getenv("SMTP_PASSWORD", "").split())
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com").strip()
    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError as error:
        raise EmailDeliveryError("SMTP_PORT must be a valid number.") from error

    if not smtp_email or not smtp_password:
        raise EmailDeliveryError("SMTP_EMAIL or SMTP_PASSWORD is missing in .env.")

    logger.info("SMTP configuration loaded")
    return smtp_email, smtp_password, smtp_server, smtp_port


def send_email(to_email, subject, body):
    """Send a plain-text email through the configured Gmail SMTP account."""
    smtp_email, smtp_password, smtp_server, smtp_port = _smtp_settings()

    message = EmailMessage()
    message["From"] = smtp_email
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        logger.info("Connecting to SMTP server...")
        with smtplib.SMTP(smtp_server, smtp_port, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            logger.info("SMTP connection established")

            try:
                server.login(smtp_email, smtp_password)
            except smtplib.SMTPAuthenticationError as error:
                logger.error("SMTP authentication failed. Check the Google App Password.")
                raise EmailDeliveryError(
                    "SMTP authentication failed. Check the Google App Password."
                ) from error

            logger.info("SMTP authentication successful")
            logger.info("Sending email message...")
            server.send_message(message)
    except EmailDeliveryError:
        raise
    except (OSError, smtplib.SMTPConnectError, smtplib.SMTPServerDisconnected) as error:
        logger.error("Could not connect to Gmail SMTP server.")
        raise EmailDeliveryError("Could not connect to Gmail SMTP server.") from error
    except smtplib.SMTPException as error:
        logger.error("SMTP email delivery failed: %s", type(error).__name__)
        raise EmailDeliveryError("SMTP email delivery failed.") from error

    logger.info("Email sent successfully")
    return True
