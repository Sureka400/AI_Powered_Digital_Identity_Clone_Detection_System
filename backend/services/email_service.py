"""Email delivery using SMTP locally and SendGrid on Render."""

import logging
import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail


# Load local .env file.
# Render uses its own environment variables.
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

logger = logging.getLogger(__name__)


class EmailDeliveryError(RuntimeError):
    """Raised when email cannot be delivered."""


def _send_email_smtp(to_email, subject, body):
    """Send email using Gmail SMTP."""

    smtp_email = os.getenv("SMTP_EMAIL", "").strip()
    smtp_password = "".join(os.getenv("SMTP_PASSWORD", "").split())
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com").strip()

    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError as error:
        raise EmailDeliveryError(
            "SMTP_PORT must be a valid number."
        ) from error

    if not smtp_email or not smtp_password:
        raise EmailDeliveryError(
            "SMTP_EMAIL or SMTP_PASSWORD is missing."
        )

    message = EmailMessage()
    message["From"] = smtp_email
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        logger.info("Connecting to Gmail SMTP...")

        with smtplib.SMTP(
            smtp_server,
            smtp_port,
            timeout=20
        ) as server:

            server.ehlo()
            server.starttls()
            server.ehlo()

            server.login(
                smtp_email,
                smtp_password
            )

            server.send_message(message)

        logger.info("SMTP email sent successfully")
        return True

    except smtplib.SMTPAuthenticationError as error:
        logger.error("SMTP authentication failed.")
        raise EmailDeliveryError(
            "SMTP authentication failed. Check your Google App Password."
        ) from error

    except (OSError, smtplib.SMTPException) as error:
        logger.error(
            "SMTP email delivery failed: %s",
            type(error).__name__
        )
        raise EmailDeliveryError(
            "SMTP email delivery failed."
        ) from error


def _send_email_sendgrid(to_email, subject, body):
    """Send email using SendGrid API."""

    api_key = os.getenv("SENDGRID_API_KEY", "").strip()
    from_email = os.getenv("SENDGRID_FROM_EMAIL", "").strip()

    if not api_key:
        raise EmailDeliveryError(
            "SENDGRID_API_KEY is missing."
        )

    if not from_email:
        raise EmailDeliveryError(
            "SENDGRID_FROM_EMAIL is missing."
        )

    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        plain_text_content=body
    )

    try:
        logger.info("Sending email through SendGrid...")

        client = SendGridAPIClient(api_key)
        response = client.send(message)

        if response.status_code not in (200, 201, 202):
            logger.error(
                "SendGrid returned status code: %s",
                response.status_code
            )
            raise EmailDeliveryError(
                "SendGrid email delivery failed."
            )

        logger.info("SendGrid email sent successfully")
        return True

    except EmailDeliveryError:
        raise

    except Exception as error:
        logger.error(
            "SendGrid email delivery failed: %s",
            type(error).__name__
        )
        raise EmailDeliveryError(
            "SendGrid email delivery failed."
        ) from error


def send_email(to_email, subject, body):
    """
    Send email using the selected provider.

    Local:
        EMAIL_PROVIDER=smtp

    Render:
        EMAIL_PROVIDER=sendgrid
    """

    provider = os.getenv(
        "EMAIL_PROVIDER",
        "smtp"
    ).strip().lower()

    if provider == "smtp":
        return _send_email_smtp(
            to_email,
            subject,
            body
        )

    elif provider == "sendgrid":
        return _send_email_sendgrid(
            to_email,
            subject,
            body
        )

    else:
        raise EmailDeliveryError(
            f"Unsupported EMAIL_PROVIDER: {provider}"
        )