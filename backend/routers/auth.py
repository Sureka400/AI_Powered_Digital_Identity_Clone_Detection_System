"""Persistent analyst account registration and sign-in endpoints.

SQLite is intentionally used here so accounts survive backend/VS restarts
without requiring a separately configured MongoDB instance.
"""

import hashlib
import hmac
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from services.email_service import EmailDeliveryError, send_email


router = APIRouter(prefix="/auth", tags=["Authentication"])
DB_PATH = Path(__file__).resolve().parents[1] / "data" / "accounts.db"


class AccountRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=256)


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=256)


class PasswordResetRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)


class PasswordResetConfirm(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    token: str = Field(min_length=6, max_length=128)
    password: str = Field(min_length=8, max_length=256)


def _connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute(
        """CREATE TABLE IF NOT EXISTS accounts (
            email TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )"""
    )
    connection.execute(
        """CREATE TABLE IF NOT EXISTS password_reset_tokens (
            token_hash TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )"""
    )
    connection.commit()
    return connection


def _hash_password(password: str, salt: bytes) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 200_000).hex()


def _account(row: sqlite3.Row) -> dict[str, str]:
    return {"name": row["name"], "email": row["email"]}


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


@router.post("/register")
def register(data: AccountRequest):
    email = data.email.strip().lower()
    name = data.name.strip()
    if not name or "@" not in email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Enter a valid name and email.")

    connection = _connection()
    try:
        if connection.execute("SELECT 1 FROM accounts WHERE email = ?", (email,)).fetchone():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
        salt = secrets.token_bytes(16)
        connection.execute(
            "INSERT INTO accounts(email, name, password_hash, password_salt) VALUES (?, ?, ?, ?)",
            (email, name, _hash_password(data.password, salt), salt.hex()),
        )
        connection.commit()
        row = connection.execute("SELECT name, email FROM accounts WHERE email = ?", (email,)).fetchone()
        return _account(row)
    finally:
        connection.close()


@router.post("/login")
def login(data: LoginRequest):
    email = data.email.strip().lower()
    connection = _connection()
    try:
        row = connection.execute("SELECT * FROM accounts WHERE email = ?", (email,)).fetchone()
        valid = row is not None and hmac.compare_digest(
            _hash_password(data.password, bytes.fromhex(row["password_salt"])), row["password_hash"]
        )
        if not valid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password.")
        return _account(row)
    finally:
        connection.close()


@router.post("/password-reset/request")
def request_password_reset(data: PasswordResetRequest):
    """Create a short-lived reset token and send it to the account email."""
    email = data.email.strip().lower()
    connection = _connection()
    try:
        account = connection.execute("SELECT 1 FROM accounts WHERE email = ?", (email,)).fetchone()
        # Always return the same result so this endpoint cannot reveal which
        # email addresses have accounts.
        if not account:
            return {"message": "If an account exists for this email, a reset code has been sent."}

        connection.execute("DELETE FROM password_reset_tokens WHERE email = ?", (email,))
        token = secrets.token_urlsafe(9)
        expires_at = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
        connection.execute(
            "INSERT INTO password_reset_tokens(token_hash, email, expires_at) VALUES (?, ?, ?)",
            (_token_hash(token), email, expires_at),
        )
        connection.commit()
        try:
            send_email(
                to_email=data.email,
                subject="Password Reset Code - Digital Identity Clone Detection System",
                body=(
                    "Hello,\n\n"
                    f"Your password reset OTP is: {token}\n\n"
                    "This OTP expires in 15 minutes.\n\n"
                    "If you did not request a password reset, please ignore this email "
                    "and secure your account."
                ),
            )
        except EmailDeliveryError as error:
            connection.execute("DELETE FROM password_reset_tokens WHERE email = ?", (email,))
            connection.commit()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(error),
            ) from error
        except Exception as error:
            connection.execute("DELETE FROM password_reset_tokens WHERE email = ?", (email,))
            connection.commit()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Password reset email could not be sent. Please try again later.",
            ) from error
        return {"message": "If an account exists for this email, a reset code has been sent."}
    finally:
        connection.close()


@router.post("/password-reset/confirm")
def confirm_password_reset(data: PasswordResetConfirm):
    email = data.email.strip().lower()
    connection = _connection()
    try:
        reset = connection.execute(
            "SELECT * FROM password_reset_tokens WHERE token_hash = ? AND email = ?",
            (_token_hash(data.token.strip()), email),
        ).fetchone()
        if not reset or datetime.fromisoformat(reset["expires_at"]) < datetime.now(timezone.utc):
            if reset:
                connection.execute("DELETE FROM password_reset_tokens WHERE token_hash = ?", (reset["token_hash"],))
                connection.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This reset code is invalid or has expired.")

        salt = secrets.token_bytes(16)
        connection.execute(
            "UPDATE accounts SET password_hash = ?, password_salt = ? WHERE email = ?",
            (_hash_password(data.password, salt), salt.hex(), email),
        )
        connection.execute("DELETE FROM password_reset_tokens WHERE email = ?", (email,))
        connection.commit()
        return {"message": "Your password has been reset. You can now sign in."}
    finally:
        connection.close()
