# Backend

Run the API from this directory:

```bash
python -m uvicorn app:app --reload
```

## Email setup

Password-reset codes and clone-detection alerts are sent through the SMTP
settings in `.env`. A clone alert is sent to the email address of the currently
signed-in analyst whenever an investigation result is **Clone Detected**. For Gmail,
`SMTP_PASSWORD` must be a Gmail **App Password**, not the normal Gmail account
password. Enable 2-Step Verification, create an App Password in the Google
Account security settings, then place it in `.env`:

```env
SMTP_EMAIL=your-address@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

Spaces copied from Gmail's grouped app-password display are removed
automatically. Restart the backend after changing `.env`.
