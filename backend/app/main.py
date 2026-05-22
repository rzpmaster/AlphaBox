from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import SessionLocal
from app.services.bootstrap import ensure_initial_admin


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    if settings.create_initial_admin:
        with SessionLocal() as db:
            ensure_initial_admin(db)
    yield

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Invitation-only investment signal subscription platform. No brokerage or trade execution.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router, prefix="/api/v1")
