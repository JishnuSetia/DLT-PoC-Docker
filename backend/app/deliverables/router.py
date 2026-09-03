import json
import os
import time

import httpx

from dotenv import load_dotenv
from fastapi import (
    APIRouter,
    HTTPException,
    BackgroundTasks,
    Depends,
)
from fastapi.responses import StreamingResponse

from ..cache.redis import redis_client
from ..auth.dependencies import require_auth


load_dotenv()


router = APIRouter(
    prefix="/api/deliverables",
    tags=["Deliverables"],
)


# =========================================================
# LABPORTAL CONFIGURATION
# =========================================================

LABPORTAL_BASE_URL = (
    "https://backend.labportal.yesdigitallab.com/api"
)

LABPORTAL_API_KEY = os.getenv(
    "LABPORTAL_API_KEY"
)


# =========================================================
# REDIS CACHE CONFIGURATION
# =========================================================

# Safety TTL.
# Cache will remain available for ~23.5 hours even if
# background refreshes fail.
CACHE_TTL = 84600


# Refresh cache every 5 minutes.
# You can change this to 600 for 10 minutes.
CACHE_REFRESH_INTERVAL = 300


DELIVERABLES_CACHE_KEY = "deliverables:all"

CACHE_TIMESTAMP_KEY = "deliverables:cache_timestamp"

REFRESH_LOCK_KEY = "deliverables:refresh_lock"

REFRESH_LOCK_TTL = 120


def deliverable_cache_key(
    deliverable_id: int
) -> str:

    return f"deliverables:{deliverable_id}"


# =========================================================
# CACHE TIMESTAMP HELPERS
# =========================================================

async def get_cache_age():

    timestamp = await redis_client.get(
        CACHE_TIMESTAMP_KEY
    )

    if not timestamp:
        return None

    try:

        timestamp = float(timestamp)

    except (
        TypeError,
        ValueError
    ):

        return None

    return time.time() - timestamp


async def update_cache_timestamp():

    await redis_client.set(
        CACHE_TIMESTAMP_KEY,
        str(time.time()),
        ex=CACHE_TTL
    )


# =========================================================
# SHARED HTTP HELPERS
# =========================================================

async def fetch_labportal_deliverable(
    client: httpx.AsyncClient,
    deliverable_id: int,
):

    response = await client.get(

        f"{LABPORTAL_BASE_URL}"
        f"/Deliverables/GetDeliverableDetails/{deliverable_id}",

        headers={
            "X-Api-Key": LABPORTAL_API_KEY,
        },

    )

    if response.status_code == 404:

        return None


    if response.status_code != 200:

        raise HTTPException(

            status_code=response.status_code,

            detail=(
                "Failed to fetch deliverable "
                "from LabPortal"
            ),

        )


    return response.json()


# =========================================================
# FETCH + BUILD COMPLETE DELIVERABLE DATA
# =========================================================

async def fetch_all_deliverables():

    async with httpx.AsyncClient() as client:

        response = await client.get(

            f"{LABPORTAL_BASE_URL}"
            "/Deliverables/GetDeliverablesPage"
            "?deliverableType=0&pageNumber=1&pageSize=100",

            headers={
                "X-Api-Key": LABPORTAL_API_KEY,
            },

        )


        if response.status_code != 200:

            raise HTTPException(

                status_code=response.status_code,

                detail=(
                    "Failed to fetch deliverables "
                    "from LabPortal"
                ),

            )


        data = response.json()


        # =================================================
        # ENRICH LIST ITEMS WITH FULL DETAILS
        # =================================================

        items = data.get(
            "items",
            []
        )

        enriched_items = []


        for item in items:

            deliverable_id = item.get(
                "id"
            )


            if deliverable_id is None:

                enriched_items.append(
                    item
                )

                continue


            try:

                details = (
                    await fetch_labportal_deliverable(
                        client,
                        deliverable_id,
                    )
                )

            except httpx.RequestError:

                details = None


            # Details take precedence
            if details:

                merged = {
                    **item,
                    **details,
                }

            else:

                merged = item


            enriched_items.append(
                merged
            )


        # Preserve pagination metadata
        data["items"] = enriched_items


        return data


# =========================================================
# SAVE COMPLETE CACHE
# =========================================================

async def save_deliverables_cache(
    data
):

    # -----------------------------------------------------
    # SAVE FULL RESPONSE
    # -----------------------------------------------------

    await redis_client.setex(

        DELIVERABLES_CACHE_KEY,

        CACHE_TTL,

        json.dumps(data),

    )


    # -----------------------------------------------------
    # SAVE INDIVIDUAL DELIVERABLES
    # -----------------------------------------------------

    items = data.get(
        "items",
        []
    )


    for deliverable in items:

        deliverable_id = deliverable.get(
            "id"
        )


        if deliverable_id is None:

            continue


        await redis_client.setex(

            deliverable_cache_key(
                deliverable_id
            ),

            CACHE_TTL,

            json.dumps(
                deliverable
            ),

        )


    # -----------------------------------------------------
    # UPDATE CACHE TIMESTAMP
    # -----------------------------------------------------

    await update_cache_timestamp()


# =========================================================
# REFRESH CACHE
# =========================================================

async def refresh_deliverables_cache():

    if not LABPORTAL_API_KEY:

        print(
            "[CACHE] LABPORTAL_API_KEY is not configured."
        )

        return


    # -----------------------------------------------------
    # PREVENT MULTIPLE SIMULTANEOUS REFRESHES
    # -----------------------------------------------------

    lock_acquired = await redis_client.set(

        REFRESH_LOCK_KEY,

        "1",

        nx=True,

        ex=REFRESH_LOCK_TTL,

    )


    if not lock_acquired:

        print(
            "[CACHE] Refresh already running. Skipping."
        )

        return


    try:

        print(
            "[CACHE] Starting background refresh..."
        )


        data = await fetch_all_deliverables()


        await save_deliverables_cache(
            data
        )


        item_count = len(
            data.get(
                "items",
                []
            )
        )


        print(
            f"[CACHE] Refresh complete. "
            f"Cached {item_count} deliverables."
        )


    except Exception as exc:

        # IMPORTANT:
        # Never destroy the existing cache because
        # LabPortal temporarily failed.

        print(
            f"[CACHE] Background refresh failed: {exc}"
        )


    finally:

        await redis_client.delete(
            REFRESH_LOCK_KEY
        )


# =========================================================
# GET ALL DELIVERABLES
# =========================================================

@router.get("")
async def get_deliverables(
    background_tasks: BackgroundTasks = None,
    _user=Depends(require_auth),
):

    if not LABPORTAL_API_KEY:

        raise HTTPException(

            status_code=500,

            detail=(
                "LABPORTAL_API_KEY is not configured"
            ),

        )


    # =====================================================
    # CHECK REDIS CACHE
    # =====================================================

    cached_data = await redis_client.get(

        DELIVERABLES_CACHE_KEY
    )


    if cached_data:

        # -------------------------------------------------
        # CACHE EXISTS
        # -------------------------------------------------

        try:

            data = json.loads(
                cached_data
            )

        except json.JSONDecodeError:

            data = None


        if data is not None:

            # ---------------------------------------------
            # CHECK CACHE AGE
            # ---------------------------------------------

            cache_age = await get_cache_age()


            if (
                cache_age is None
                or cache_age >= CACHE_REFRESH_INTERVAL
            ):

                print(
                    "[CACHE] Cache is stale. "
                    "Scheduling background refresh."
                )


                if background_tasks is not None:
                    background_tasks.add_task(
                        refresh_deliverables_cache
                    )


            else:

                print(
                    f"[CACHE] Serving cached data. "
                    f"Age: {cache_age:.0f}s"
                )


            # ---------------------------------------------
            # IMPORTANT:
            # RETURN EXISTING CACHE IMMEDIATELY
            # ---------------------------------------------

            return data


    # =====================================================
    # NO CACHE AVAILABLE
    # =====================================================

    print(
        "[CACHE] No cache available. "
        "Fetching from LabPortal..."
    )


    try:

        data = await fetch_all_deliverables()


        await save_deliverables_cache(
            data
        )


        return data


    except httpx.RequestError as exc:

        raise HTTPException(

            status_code=502,

            detail=(
                f"Unable to connect to LabPortal: {exc}"
            ),

        )


# =========================================================
# GET DEMO VIDEO
# =========================================================

@router.get("/{id}/demo-video")
async def get_demo_video(
    id: int,
    _user=Depends(require_auth),
):

    if not LABPORTAL_API_KEY:

        raise HTTPException(

            status_code=500,

            detail=(
                "LABPORTAL_API_KEY is not configured"
            ),

        )


    video_url = (

        f"{LABPORTAL_BASE_URL}"
        f"/Deliverables/{id}/demo-video"

    )


    try:

        async with httpx.AsyncClient(
            timeout=None
        ) as client:

            response = await client.get(

                video_url,

                headers={

                    "X-Api-Key":
                        LABPORTAL_API_KEY,

                    "Accept":
                        "*/*",

                },

            )


            if response.status_code == 404:

                raise HTTPException(

                    status_code=404,

                    detail="Demo video not found",

                )


            if response.status_code != 200:

                raise HTTPException(

                    status_code=response.status_code,

                    detail=(
                        "Failed to fetch demo video "
                        "from LabPortal"
                    ),

                )


            content_type = response.headers.get(

                "content-type",

                "video/mp4",

            )


            return StreamingResponse(

                iter([
                    response.content
                ]),

                media_type=content_type,

                headers={

                    "Content-Length":
                        str(
                            len(
                                response.content
                            )
                        ),

                    "Content-Disposition":
                        (
                            f'inline; '
                            f'filename="deliverable-{id}.mp4"'
                        ),

                },

            )


    except httpx.RequestError as exc:

        raise HTTPException(

            status_code=502,

            detail=(
                f"Unable to connect to LabPortal: {exc}"
            ),

        )


# =========================================================
# GET DELIVERABLE BY ID
# =========================================================

@router.get("/{id}")
async def get_deliverable_by_id(
    id: int,
    background_tasks: BackgroundTasks,
    _user=Depends(require_auth),
):

    if not LABPORTAL_API_KEY:

        raise HTTPException(

            status_code=500,

            detail=(
                "LABPORTAL_API_KEY is not configured"
            ),

        )


    cache_key = deliverable_cache_key(
        id
    )


    # =====================================================
    # CHECK INDIVIDUAL CACHE
    # =====================================================

    cached_data = await redis_client.get(
        cache_key
    )


    if cached_data:

        try:

            data = json.loads(
                cached_data
            )

        except json.JSONDecodeError:

            data = None


        if data is not None:

            # ---------------------------------------------
            # Check global cache age
            # ---------------------------------------------

            cache_age = await get_cache_age()


            if (
                cache_age is None
                or cache_age >= CACHE_REFRESH_INTERVAL
            ):

                background_tasks.add_task(
                    refresh_deliverables_cache
                )


            # ---------------------------------------------
            # RETURN CURRENT CACHE IMMEDIATELY
            # ---------------------------------------------

            return data


    # =====================================================
    # CACHE MISS
    # =====================================================

    try:

        async with httpx.AsyncClient() as client:

            data = (
                await fetch_labportal_deliverable(
                    client,
                    id,
                )
            )


            if data is None:

                raise HTTPException(

                    status_code=404,

                    detail="Deliverable not found",

                )


            # ---------------------------------------------
            # SAVE INDIVIDUAL CACHE
            # ---------------------------------------------

            await redis_client.setex(

                cache_key,

                CACHE_TTL,

                json.dumps(data),

            )


            return data


    except httpx.RequestError as exc:

        raise HTTPException(

            status_code=502,

            detail=(
                f"Unable to connect to LabPortal: {exc}"
            ),

        )