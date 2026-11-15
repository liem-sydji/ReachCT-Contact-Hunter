"""
ReachCT — auth.py
Google OAuth ID-token verification + JWT issuance + API key helpers.

Required env vars:
    GOOGLE_CLIENT_ID  — from Google Cloud Console OAuth 2.0 credentials
    JWT_SECRET        — any long random string (e.g. openssl rand -hex 32)
"""

import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from jose import JWTError, jwt

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
JWT_SECRET       = os.environ.get("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM    = "HS256"
JWT_EXPIRE_DAYS  = 7

API_KEY_PREFIX = "rct_"


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


def hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def generate_api_key() -> Tuple[str, str, str]:
    """Return (plaintext_key, hash, display_prefix)."""
    raw = API_KEY_PREFIX + secrets.token_urlsafe(32)
    return raw, hash_api_key(raw), raw[:12]


def looks_like_api_key(token: str) -> bool:
    return bool(token) and token.startswith(API_KEY_PREFIX)


def constant_time_hash_eq(a: str, b: str) -> bool:
    if not a or not b:
        return False
    return hmac.compare_digest(a, b)
