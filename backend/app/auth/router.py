import os
import secrets

from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel, Field
from pwdlib import PasswordHash

from ..cache.redis import redis_client


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)

password_hash = PasswordHash.recommended()

SESSION_COOKIE = "poc_session"
SESSION_TTL = 60 * 60 * 8  # 8 hours


# =========================================================
# MODELS
# =========================================================

class RegisterRequest(BaseModel):
    invite_code: str = Field(min_length=1)
    name: str = Field(min_length=2, max_length=100)
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


# =========================================================
# HELPERS
# =========================================================

def get_invite_codes() -> set[str]:
    raw_codes = os.getenv("AUTH_INVITE_CODES", "")

    return {
        code.strip()
        for code in raw_codes.split(",")
        if code.strip()
    }


def normalize_username(username: str) -> str:
    return username.strip().lower()


async def get_current_user(request: Request):
    session_token = request.cookies.get(
        SESSION_COOKIE
    )

    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    session_key = (
        f"auth:session:{session_token}"
    )

    username = await redis_client.get(
        session_key
    )

    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired.",
        )

    user_key = (
        f"auth:user:{username}"
    )

    user = await redis_client.hgetall(
        user_key
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
        )

    # Refresh session expiry on activity.
    await redis_client.expire(
        session_key,
        SESSION_TTL,
    )

    return user


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
async def register(
    request: RegisterRequest,
):
    invite_code = request.invite_code.strip()

    valid_codes = get_invite_codes()

    if (
        not valid_codes
        or invite_code not in valid_codes
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid authorization code.",
        )

    username = normalize_username(
        request.username
    )

    user_key = (
        f"auth:user:{username}"
    )

    if await redis_client.exists(
        user_key
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists.",
        )

    await redis_client.hset(
        user_key,
        mapping={
            "name": request.name.strip(),
            "username": username,
            "password_hash": password_hash.hash(
                request.password
            ),
        },
    )

    return {
        "message": "Account created successfully.",
        "username": username,
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
async def login(
    request: LoginRequest,
    response: Response,
):
    username = normalize_username(
        request.username
    )

    user_key = (
        f"auth:user:{username}"
    )

    user = await redis_client.hgetall(
        user_key
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    stored_hash = user.get(
        "password_hash"
    )

    if (
        not stored_hash
        or not password_hash.verify(
            request.password,
            stored_hash,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    session_token = secrets.token_urlsafe(
        48
    )

    session_key = (
        f"auth:session:{session_token}"
    )

    await redis_client.set(
        session_key,
        username,
        ex=SESSION_TTL,
    )

    # COOKIE_SECURE=false is useful for local HTTP development.
    # Set it to true behind HTTPS in production.
    secure_cookie = (
        os.getenv(
            "COOKIE_SECURE",
            "false",
        ).lower()
        == "true"
    )

    response.set_cookie(
        key=SESSION_COOKIE,
        value=session_token,
        httponly=True,
        secure=secure_cookie,
        samesite="lax",
        max_age=SESSION_TTL,
    )

    return {
        "message": "Login successful.",
        "username": username,
        "name": user.get(
            "name",
            "",
        ),
    }


# =========================================================
# LOGOUT
# =========================================================

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
):
    session_token = request.cookies.get(
        SESSION_COOKIE
    )

    if session_token:
        await redis_client.delete(
            f"auth:session:{session_token}"
        )

    response.delete_cookie(
        key=SESSION_COOKIE
    )

    return {
        "message": "Logged out successfully.",
    }


# =========================================================
# CURRENT USER
# =========================================================

@router.get("/me")
async def me(
    request: Request,
):
    user = await get_current_user(
        request
    )

    return {
        "authenticated": True,
        "username": user.get(
            "username",
            "",
        ),
        "name": user.get(
            "name",
            "",
        ),
    }