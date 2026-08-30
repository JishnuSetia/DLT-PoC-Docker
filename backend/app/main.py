from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .deliverables.router import router as deliverables_router
from .cache.redis import redis_client
from .cache.router import router as cache_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await redis_client.ping()
    print("Connected to Redis")

    yield

    # Shutdown
    await redis_client.close()
    print("Disconnected from Redis")


app = FastAPI(
    title="DDL PoC API",
    version="0.1.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(deliverables_router)
app.include_router(cache_router)


@app.get("/")
async def root():
    return {
        "name": "DDL PoC API",
        "status": "running"
    }


@app.get("/health")
async def health():

    redis_status = "connected"

    try:
        await redis_client.ping()
    except Exception:
        redis_status = "disconnected"

    return {
        "status": "healthy",
        "redis": redis_status
    }