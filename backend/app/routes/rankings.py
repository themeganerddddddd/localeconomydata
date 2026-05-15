from __future__ import annotations

from fastapi import APIRouter, Query

from app.database import get_connection

router = APIRouter(prefix="/api/rankings", tags=["rankings"])


@router.get("")
def rankings(
    metric: str = "employment_growth",
    geography_level: str = "county",
    state: str | None = None,
    industry_code: str | None = None,
    limit: int = Query(25, ge=1, le=500),
):
    params: list = [metric]
    state_filter = ""
    if state:
        state_filter = " AND c.state_abbr = ?"
        params.append(state.upper())
    params.append(limit)
    with get_connection() as conn:
        rows = conn.execute(
            f"""
            SELECT r.*, c.county_name, c.state_name, c.state_abbr
            FROM county_rankings r
            JOIN counties c ON c.fips = r.fips
            WHERE r.metric = ? {state_filter}
            ORDER BY r.national_rank
            LIMIT ?
            """,
            params,
        ).fetchall()
    return {
        "metric": metric,
        "geography_level": geography_level,
        "industry_code": industry_code,
        "rows": [dict(row) for row in rows],
    }
