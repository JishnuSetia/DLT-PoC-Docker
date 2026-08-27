import os
import time
import httpx

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

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
# CACHE
# =========================================================

CACHE_TTL = 300  # 5 minutes


# Cache for the full deliverables response
deliverables_cache = {
    "data": None,
    "timestamp": 0,
}


# Cache for individual deliverables
deliverable_cache = {}


# =========================================================
# SHARED HTTP HELPERS
# =========================================================

async def fetch_labportal_deliverable(
    client: httpx.AsyncClient,
    deliverable_id: int,
):
    response = await client.get(
        f"{LABPORTAL_BASE_URL}/Deliverables/GetDeliverableDetails/{deliverable_id}",
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
    # CHECK CACHE
    # -----------------------------------------------------

    current_time = time.time()

    if (
        deliverables_cache["data"] is not None
        and current_time - deliverables_cache["timestamp"] < CACHE_TTL
    ):
        return deliverables_cache["data"]

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
                    detail="Failed to fetch deliverables from LabPortal",
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

                    details = await fetch_labportal_deliverable(
                        client,
                        deliverable_id,
                    )

                except httpx.RequestError:

                    details = None

                # Merge list response + details response.
                # Details take precedence when available.

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
            # SAVE TO CACHE
            # -------------------------------------------------

            deliverables_cache["data"] = data
            deliverables_cache["timestamp"] = time.time()

            return data

    except httpx.RequestError as exc:

        raise HTTPException(
            status_code=502,
            detail=f"Unable to connect to LabPortal: {exc}",
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

        # -------------------------------------------------
        # Request video from LabPortal
        # -------------------------------------------------

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

            # -------------------------------------------------
            # Handle errors
            # -------------------------------------------------

            if response.status_code == 404:

                raise HTTPException(
                    status_code=404,
                    detail="Demo video not found",
                )

            if response.status_code != 200:

                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to fetch demo video from LabPortal",
                )

            # -------------------------------------------------
            # Determine content type
            # -------------------------------------------------

            content_type = response.headers.get(
                "content-type",
                "video/mp4",
            )

            # -------------------------------------------------
            # Return video to frontend
            # -------------------------------------------------

            return StreamingResponse(
                iter([response.content]),
                media_type=content_type,
                headers={
                    "Content-Length": str(
                        len(response.content)
                    ),
                    "Content-Disposition": (
                        f'inline; filename="deliverable-{id}.mp4"'
                    ),
                },
            )

    except httpx.RequestError as exc:

        raise HTTPException(
            status_code=502,
            detail=f"Unable to connect to LabPortal: {exc}",
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

    # -----------------------------------------------------
    # CHECK CACHE
    # -----------------------------------------------------

    current_time = time.time()

    cached = deliverable_cache.get(id)

    if cached:

        cached_data = cached["data"]
        cached_timestamp = cached["timestamp"]

        if current_time - cached_timestamp < CACHE_TTL:

            return cached_data

        del deliverable_cache[id]

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
            # SAVE TO CACHE
            # -------------------------------------------------

            deliverable_cache[id] = {
                "data": data,
                "timestamp": time.time(),
            }

            return data

    except httpx.RequestError as exc:

        raise HTTPException(
            status_code=502,
            detail=f"Unable to connect to LabPortal: {exc}",
        )