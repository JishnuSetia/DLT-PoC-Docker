from contextlib import asynccontextmanager

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from .deliverables.router import (
    router as deliverables_router,
    get_deliverables,
)

from .cache.redis import redis_client

from .cache.router import (
    router as cache_router,
)

from .chatbot.router import (
    router as chatbot_router,
)

from .chatbot.vector_store import (
    vector_store,
)


# =========================================================
# LIFESPAN
# =========================================================

@asynccontextmanager
async def lifespan(
    app: FastAPI,
):

    # -----------------------------------------------------
    # REDIS
    # -----------------------------------------------------

    await redis_client.ping()

    print(
        "Connected to Redis"
    )

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
    # BUILD VECTOR INDEX
    # -----------------------------------------------------

    try:

        await vector_store.initialize()

    except Exception as exc:

        print(
            "WARNING: Could not initialize "
            f"vector store: {exc}"
        )

    yield

    # -----------------------------------------------------
    # SHUTDOWN
    # -----------------------------------------------------

    await redis_client.close()

    print(
        "Disconnected from Redis"
    )


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="DDL PoC API",
    version="0.1.0",
    lifespan=lifespan,
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    deliverables_router
)

app.include_router(
    cache_router
)

app.include_router(
    chatbot_router
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

        "vector_store": (
            "ready"
            if vector_store.ready
            else "not ready"
        ),

    }