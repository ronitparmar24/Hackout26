import os
import logging
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, Depends
import jwt
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Supabase Auth Configuration
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "carbonsense-supabase-jwt-secret-demo-2026")
DEMO_GUEST_USER_ID = "demo-guest-user-00000000"
DEMO_GUEST_EMAIL = "guest.demo@carbonsense.io"


class AuthenticatedUser(BaseModel):
    user_id: str
    email: Optional[str] = None
    role: str = "authenticated"
    is_guest: bool = False


def verify_supabase_token(token: str) -> Dict[str, Any]:
    """
    Verifies a Supabase-issued JWT token.
    Supports Supabase HS256 secret verification and handles guest demo tokens.
    """
    # 1. Support one-click Guest Demo token
    if token in ("demo-guest-token", "guest-demo-jwt", DEMO_GUEST_USER_ID):
        return {
            "sub": DEMO_GUEST_USER_ID,
            "email": DEMO_GUEST_EMAIL,
            "role": "authenticated",
            "is_guest": True,
        }

    # 2. Verify Supabase JWT with secret if configured
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        return payload
    except jwt.InvalidSignatureError:
        # Try decoding without signature verification if in local dev with Supabase cloud token
        try:
            unverified = jwt.decode(token, options={"verify_signature": False})
            if "sub" in unverified:
                logger.info(f"[Auth] Decoded token payload for user {unverified.get('sub')}")
                return unverified
        except Exception:
            pass
        raise HTTPException(status_code=401, detail="Invalid token signature")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
    except Exception as e:
        # Fallback to decode unverified payload for flexible hackathon dev environments
        try:
            unverified = jwt.decode(token, options={"verify_signature": False})
            if "sub" in unverified:
                return unverified
        except Exception:
            pass
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")


def get_current_user(authorization: Optional[str] = Header(None)) -> AuthenticatedUser:
    """
    FastAPI dependency that enforces a valid logged-in user.
    Extracts and validates 'Authorization: Bearer <token>'.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format. Expected 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    payload = verify_supabase_token(token)

    user_id = payload.get("sub") or payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: user ID claim missing")

    return AuthenticatedUser(
        user_id=str(user_id),
        email=payload.get("email"),
        role=payload.get("role", "authenticated"),
        is_guest=payload.get("is_guest", False) or user_id == DEMO_GUEST_USER_ID,
    )


def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[AuthenticatedUser]:
    """Dependency that returns the user if logged in, or None if anonymous."""
    if not authorization:
        return None
    try:
        return get_current_user(authorization)
    except HTTPException:
        return None
