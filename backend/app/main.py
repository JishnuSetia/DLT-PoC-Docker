from contextlib import asynccontextmanager

from fastapi import FastAPI

from .auth.router import router as auth_router
from .cache.redis import redis_client
from .cache.router import router as cache_router
from .deliverables.router import (
    get_deliverables,
    router as deliverables_router,
)


# =========================================================
# LIFESPAN
# =========================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    # -----------------------------------------------------
    # REDIS
    # -----------------------------------------------------

    await redis_client.ping()

    print("Connected to Redis")

    # -----------------------------------------------------
    # ENSURE REDIS DATA EXISTS
    # -----------------------------------------------------

    try:
        await get_deliverables()

        print(
            "Deliverables cache initialized."
        )

    except Exception as exc:
        print(
            "WARNING: Could not initialize "
            f"deliverables cache: {exc}"
        )

    # -----------------------------------------------------
    # APPLICATION RUNNING
    # -----------------------------------------------------

    yield

    # -----------------------------------------------------
    # SHUTDOWN
    # -----------------------------------------------------

    await redis_client.close()

    print("Disconnected from Redis")


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="DDL PoC API",
    version="0.1.0",
    lifespan=lifespan,
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    auth_router
)

app.include_router(
    deliverables_router
)

app.include_router(
    cache_router
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
async def root():
    return {
        "name": "DDL PoC API",
        "status": "running",
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
async def health():

    redis_status = "connected"

    try:
        await redis_client.ping()

    except Exception:
        redis_status = "disconnected"

    return {
        "status": "healthy",
        "redis": redis_status,
    }