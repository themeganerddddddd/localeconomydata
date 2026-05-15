from __future__ import annotations

from fastapi import APIRouter

from app.services.forecast_service import predict_county_growth

router = APIRouter(prefix="/api/forecast", tags=["forecasts"])


@router.get("/county/{fips}")
def county_forecast(fips: str, industry_code: str | None = None):
    return predict_county_growth(fips, industry_code)
