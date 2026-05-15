from __future__ import annotations

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(counties.router)
app.include_router(rankings.router)
app.include_router(industries.router)
app.include_router(exports.router)
app.include_router(forecasts.router)
