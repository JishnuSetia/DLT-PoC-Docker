from fastapi import APIRouter, HTTPException

from .redis import redis_client


router = APIRouter(
    prefix="/api/cache",
    tags=["Cache"],
)


# =========================================================
# CACHE STATUS
# =========================================================

@router.get("/status")
async def cache_status():

    try:
        await redis_client.ping()

        keys = await redis_client.keys(
            "deliverables:*"
        )

        return {
            "status": "connected",
            "cache": "redis",
            "deliverable_cache_keys": len(keys),
        }

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Redis unavailable: {exc}",
        )


# =========================================================
# CLEAR ALL DELIVERABLE CACHE
# =========================================================

@router.delete("/deliverables")
async def clear_deliverables_cache():

    try:

        keys = await redis_client.keys(
            "deliverables:*"
        )

        if keys:
            deleted = await redis_client.delete(
                *keys
            )
        else:
            deleted = 0

        return {
            "message": "Deliverables cache cleared",
            "deleted_keys": deleted,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Redis unavailable: {exc}",
        )


# =========================================================
# CLEAR SINGLE DELIVERABLE CACHE
# =========================================================

@router.delete("/deliverables/{id}")
async def clear_deliverable_cache(id: int):

    try:

        deleted = await redis_client.delete(
            f"deliverables:{id}"
        )

        # Also invalidate the complete list.
        # Otherwise the list could still contain
        # outdated data.
        await redis_client.delete(
            "deliverables:all"
        )

        return {
            "message": (
                f"Deliverable {id} cache cleared"
            ),
            "deleted": bool(deleted),
        }

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Redis unavailable: {exc}",
        )