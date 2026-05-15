from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, Response

from app.services.export_service import counties_industries_csv, county_summary_csv

router = APIRouter(prefix="/api/export", tags=["exports"])


@router.get("/county/{fips}")
def export_county(
    fips: str,
    format: str = Query("csv", pattern="^(csv|xlsx)$"),
    industry_code: str | None = None,
    start_year: int | None = None,
    end_year: int | None = None,
):
    if format == "xlsx" or industry_code or start_year or end_year:
        raise HTTPException(status_code=402, detail="Premium downloads are not enabled yet.")
    content = county_summary_csv(fips)
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="county-{fips}-summary.csv"'},
    )


@router.get("/csv")
def export_csv(
    county_fips: str | None = None,
    state: str | None = None,
    naics_level: str = Query("all", pattern="^(all|2|3|4|5|6|sector_range)$"),
    naics_code: str | None = None,
    year: int | None = None,
):
    content = counties_industries_csv(
        county_fips=county_fips,
        state=state,
        naics_level=naics_level,
        naics_code=naics_code,
        year=year,
    )
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="localeconomy_county_industries.csv"'},
    )
