from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.database import get_connection

router = APIRouter(prefix="/api/industries", tags=["industries"])


@router.get("/{industry_code}")
def industry_profile(industry_code: str):
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT q.*, c.county_name, c.state_abbr, l.lq
            FROM county_qcew q
            JOIN counties c ON c.fips = q.fips
            LEFT JOIN industry_lq l ON l.fips = q.fips AND l.industry_code = q.industry_code AND l.year = q.year AND l.quarter = q.quarter
            WHERE q.industry_code = ?
            ORDER BY q.employment DESC
            """,
            (industry_code,),
        ).fetchall()
    if not rows:
        raise HTTPException(status_code=404, detail="Industry not found")
    latest = rows[0]
    return {
        "industry_code": industry_code,
        "industry_title": latest["industry_title"],
        "national_employment": sum(row["employment"] for row in rows),
        "avg_weekly_wage": round(sum(row["avg_weekly_wage"] for row in rows) / len(rows)),
        "top_by_employment": [dict(row) for row in sorted(rows, key=lambda r: r["employment"], reverse=True)[:10]],
        "top_by_lq": [dict(row) for row in sorted(rows, key=lambda r: r["lq"] or 0, reverse=True)[:10]],
        "fastest_growing": [dict(row) for row in rows[:10]],
    }
