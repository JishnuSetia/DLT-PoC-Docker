from fastapi import Request
from fastapi.exceptions import HTTPException

from .router import get_current_user


async def require_auth(
    request: Request,
):
    return await get_current_user(
        request
    )