import json
import os

import httpx

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from ..cache.redis import redis_client


load_dotenv()


router = APIRouter(
    prefix="/api/deliverables",
    tags=["Deliverables"],
)


LABPORTAL_BASE_URL = (
    "https://backend.labportal.yesdigitallab.com/api"
)

LABPORTAL_API_KEY = os.getenv("LABPORTAL_API_KEY")


# =========================================================
# REDIS CACHE
# =========================================================

CACHE_TTL = 84600

DELIVERABLES_CACHE_KEY = "deliverables:all"


def deliverable_cache_key(deliverable_id: int) -> str:
    return f"deliverables:{deliverable_id}"


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
            detail="Failed to fetch deliverable from LabPortal",
        )

    return response.json()


# =========================================================
# GET ALL DELIVERABLES
# =========================================================

@router.get("")
async def get_deliverables():

    if not LABPORTAL_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="LABPORTAL_API_KEY is not configured",
        )

    # -----------------------------------------------------
    # CHECK REDIS CACHE
    # -----------------------------------------------------

    cached_data = await redis_client.get(
        DELIVERABLES_CACHE_KEY
    )

    if cached_data:
        return json.loads(cached_data)

    # -----------------------------------------------------
    # FETCH FROM LABPORTAL
    # -----------------------------------------------------

    try:

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

            # -------------------------------------------------
            # ENRICH LIST ITEMS WITH FULL DETAILS
            # -------------------------------------------------

            items = data.get("items", [])
            enriched_items = []

            for item in items:

                deliverable_id = item.get("id")

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

                enriched_items.append(merged)

            # Preserve pagination metadata
            data["items"] = enriched_items

            # -------------------------------------------------
            # SAVE FULL RESPONSE TO REDIS
            # -------------------------------------------------

            await redis_client.setex(
                DELIVERABLES_CACHE_KEY,
                CACHE_TTL,
                json.dumps(data),
            )

            # -------------------------------------------------
            # CACHE INDIVIDUAL DELIVERABLES TOO
            # -------------------------------------------------

            for deliverable in enriched_items:

                deliverable_id = deliverable.get("id")

                if deliverable_id is not None:

                    await redis_client.setex(
                        deliverable_cache_key(deliverable_id),
                        CACHE_TTL,
                        json.dumps(deliverable),
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
async def get_demo_video(id: int):

    if not LABPORTAL_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="LABPORTAL_API_KEY is not configured",
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
                    "X-Api-Key": LABPORTAL_API_KEY,
                    "Accept": "*/*",
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
                iter([response.content]),
                media_type=content_type,
                headers={
                    "Content-Length": str(
                        len(response.content)
                    ),
                    "Content-Disposition": (
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
async def get_deliverable_by_id(id: int):

    if not LABPORTAL_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="LABPORTAL_API_KEY is not configured",
        )

    cache_key = deliverable_cache_key(id)

    # -----------------------------------------------------
    # CHECK REDIS CACHE
    # -----------------------------------------------------

    cached_data = await redis_client.get(
        cache_key
    )

    if cached_data:
        return json.loads(cached_data)

    # -----------------------------------------------------
    # FETCH FROM LABPORTAL
    # -----------------------------------------------------

    try:

        async with httpx.AsyncClient() as client:

            data = await fetch_labportal_deliverable(
                client,
                id,
            )

            if data is None:
                raise HTTPException(
                    status_code=404,
                    detail="Deliverable not found",
                )

            # -------------------------------------------------
            # SAVE TO REDIS
            # -------------------------------------------------

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