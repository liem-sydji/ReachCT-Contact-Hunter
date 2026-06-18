"""
ReachCT — auth.py
Google OAuth ID-token verification + JWT issuance.

Required env vars:
    GOOGLE_CLIENT_ID  — from Google Cloud Console OAuth 2.0 credentials
    JWT_SECRET        — any long random string (e.g. openssl rand -hex 32)
"""

import os
from datetime import datetime, timedelta
from typing import Optional

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from jose import JWTError, jwt

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
JWT_SECRET       = os.environ.get("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM    = "HS256"
JWT_EXPIRE_DAYS  = 7


def verify_google_token(credential: str) -> dict:
    """Verify a Google ID token and return its claims."""
    return id_token.verify_oauth2_token(
        credential,
        google_requests.Request(),
        GOOGLE_CLIENT_ID,
    )


def create_jwt(user_id: int, email: str, name: str, picture: str) -> str:
    payload = {
        "sub":     str(user_id),
        "email":   email,
        "name":    name,
        "picture": picture,
        "exp":     datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None
