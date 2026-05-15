from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request

from app.routes import counties, exports, forecasts, industries, rankings
from app.services.seed_service import seed_database

app = FastAPI(
    title="LocalEconomyData API",
    description="County-level economic indicators, rankings, industries, exports, and forecast placeholders.",
    version="0.1.0",
)


def _allowed_origins() -> list[str]:
    defaults = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://localeconomydata.com",
        "https://www.localeconomydata.com",
        "https://localeconomydata.vercel.app",
    ]
    extra = os.getenv("FRONTEND_ORIGINS", "")
    origins = defaults + [origin.strip() for origin in extra.split(",") if origin.strip()]
    return sorted({origin.rstrip("/") for origin in origins})


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def strip_vercel_backend_prefix(request: Request, call_next):
    """Allow Vercel Services to mount the API at /_/backend while keeping /api routes."""
    prefix = "/_/backend"
    path = request.scope.get("path", "")
    if path.startswith(f"{prefix}/api"):
        request.scope["path"] = path[len(prefix):]
    return await call_next(request)


@app.on_event("startup")
def startup() -> None:
    seed_database()


@app.get("/health")
def root_health():
    return {"status": "ok"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(counties.router)
app.include_router(rankings.router)
app.include_router(industries.router)
app.include_router(exports.router)
app.include_router(forecasts.router)
