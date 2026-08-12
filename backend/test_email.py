"""Manual SMTP smoke test. Run from the backend directory."""

import os

from services.email_service import EmailDeliveryError, send_email


def main() -> None:
    # TEST_EMAIL is optional; without it, the configured SMTP inbox receives
    # the test message. No passwords or SMTP settings are printed.
    recipient = os.getenv("TEST_EMAIL") or os.getenv("SMTP_EMAIL")
    if not recipient:
        raise RuntimeError("Set SMTP_EMAIL (and optionally TEST_EMAIL) in backend/.env.")

    try:
        send_email(
            to_email=recipient,
            subject="SMTP Test - Digital Identity Clone Detection System",
            body="Hello,\n\nThis is a test email from the Digital Identity Clone Detection System.",
        )
    except EmailDeliveryError as error:
        # The service has already logged the non-secret cause. Keep this
        # command-line test concise and never expose SMTP credentials.
        print(f"Test email failed: {error}")
        raise SystemExit(1)

    print("SMTP connection successful")
    print("SMTP authentication successful")
    print("Test email sent successfully")


if __name__ == "__main__":
    main()
