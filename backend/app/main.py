from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .deliverables.router import router as deliverables_router


app = FastAPI(
    title="DDL PoC API",
    version="0.1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(deliverables_router)


@app.get("/")
async def root():
    return {
        "name": "DDL PoC API",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }