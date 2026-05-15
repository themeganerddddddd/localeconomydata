from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.database import get_connection
from app.services.naics import get_naics_digit_level

router = APIRouter(prefix="/api/counties", tags=["counties"])


def row_to_dict(row):
    return dict(row) if row else None


def pct_change(latest: float | int | None, previous: float | int | None) -> float | None:
    if latest is None or previous in (None, 0):
        return None
    return round(100 * (latest - previous) / previous, 2)


@router.get("")
def list_counties():
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT c.*,
                   laus.unemployment_rate,
                   q.employment AS total_employment,
                   q.avg_weekly_wage,
                   bea.gdp,
                   eg.value AS employment_growth,
                   wg.value AS wage_growth,
                   ur.national_rank AS unemployment_national_rank,
                   ur.state_rank AS unemployment_state_rank,
                   eg.national_rank AS employment_growth_national_rank,
                   eg.state_rank AS employment_growth_state_rank,
                   aw.national_rank AS wage_national_rank,
                   aw.state_rank AS wage_state_rank
            FROM counties c
            LEFT JOIN county_laus laus ON laus.id = (
                SELECT id FROM county_laus WHERE fips = c.fips ORDER BY year DESC, month DESC LIMIT 1
            )
            LEFT JOIN county_qcew q ON q.id = (
                SELECT id FROM county_qcew WHERE fips = c.fips AND industry_code = '10' ORDER BY year DESC LIMIT 1
            )
            LEFT JOIN county_bea bea ON bea.id = (
                SELECT id FROM county_bea WHERE fips = c.fips ORDER BY year DESC LIMIT 1
            )
            LEFT JOIN county_rankings eg ON eg.fips = c.fips AND eg.metric = 'employment_growth'
            LEFT JOIN county_rankings wg ON wg.fips = c.fips AND wg.metric = 'wage_growth'
            LEFT JOIN county_rankings ur ON ur.fips = c.fips AND ur.metric = 'unemployment_rate'
            LEFT JOIN county_rankings aw ON aw.fips = c.fips AND aw.metric = 'avg_weekly_wage'
            ORDER BY c.state_abbr, c.county_name
            """
        ).fetchall()
    return [row_to_dict(row) for row in rows]


@router.get("/{fips}")
def county_profile(fips: str):
    with get_connection() as conn:
        county = conn.execute("SELECT * FROM counties WHERE fips = ?", (fips,)).fetchone()
        if not county:
            raise HTTPException(status_code=404, detail="County not found")
        laus = conn.execute("SELECT * FROM county_laus WHERE fips = ? ORDER BY year DESC, month DESC LIMIT 1", (fips,)).fetchone()
        acs = conn.execute("SELECT * FROM county_acs WHERE fips = ? ORDER BY year DESC LIMIT 1", (fips,)).fetchone()
        previous_acs = conn.execute("SELECT * FROM county_acs WHERE fips = ? AND year < ? ORDER BY year DESC LIMIT 1", (fips, acs["year"] if acs else 9999)).fetchone()
        bea = conn.execute("SELECT * FROM county_bea WHERE fips = ? ORDER BY year DESC LIMIT 1", (fips,)).fetchone()
        previous_bea = conn.execute("SELECT * FROM county_bea WHERE fips = ? AND year < ? ORDER BY year DESC LIMIT 1", (fips, bea["year"] if bea else 9999)).fetchone()
        qcew = conn.execute("SELECT * FROM county_qcew WHERE fips = ? AND industry_code = '10' ORDER BY year DESC, quarter DESC LIMIT 1", (fips,)).fetchone()
        previous_qcew = conn.execute("SELECT * FROM county_qcew WHERE fips = ? AND industry_code = '10' AND year < ? ORDER BY year DESC LIMIT 1", (fips, qcew["year"] if qcew else 9999)).fetchone()
        rankings = conn.execute("SELECT * FROM county_rankings WHERE fips = ? ORDER BY metric", (fips,)).fetchall()
        industries = _industry_rows(conn, fips, "employment", 25)
        lq_rankings = _industry_rows(conn, fips, "lq", 100)
        top_industry = industries[0] if industries else None
        highest_lq = sorted(industries, key=lambda row: row["lq"] or 0, reverse=True)[0] if industries else None
        counts = _ranking_counts(conn, county["state_abbr"])
        same_state = conn.execute(
            "SELECT fips, county_name, state_name, state_abbr, population, lat, lon FROM counties WHERE state_abbr = ? ORDER BY county_name",
            (county["state_abbr"],),
        ).fetchall()
        trends = {
            "unemployment_rate": _trend(conn, fips, "unemployment_rate"),
            "employment": _qcew_trend(conn, fips, "employment"),
            "avg_weekly_wage": _qcew_trend(conn, fips, "avg_weekly_wage"),
            "establishments": _qcew_trend(conn, fips, "establishments"),
            "gdp": _bea_trend(conn, fips, "gdp"),
            "population": _acs_trend(conn, fips, "population"),
        }
    top_names = ", ".join([f"“{row['industry_title']}”" for row in industries[:3]])
    summary = (
        f"{county['county_name']}, {county['state_abbr']}'s latest economic data shows an unemployment rate of "
        f"{laus['unemployment_rate'] if laus else 'N/A'}%, total employment of {qcew['employment']:,} workers, "
        f"average weekly wages of ${qcew['avg_weekly_wage']:,}, and GDP of ${bea['gdp']:,.0f}. "
        f"Its largest industries include {top_names}."
    )
    return {
        "county": row_to_dict(county),
        "latest": {
            "laus": row_to_dict(laus),
            "acs": row_to_dict(acs),
            "bea": row_to_dict(bea),
            "qcew_total": row_to_dict(qcew),
        },
        "data_vintage": {
            "laus": f"{laus['year']}-{laus['month']:02d}" if laus else None,
            "qcew": f"{qcew['year']} {qcew['quarter']}" if qcew else None,
            "acs": str(acs["year"]) if acs else None,
            "bea": str(bea["year"]) if bea else None,
        },
        "derived": {
            "employment_growth": pct_change(qcew["employment"] if qcew else None, previous_qcew["employment"] if previous_qcew else None),
            "wage_growth": pct_change(qcew["avg_weekly_wage"] if qcew else None, previous_qcew["avg_weekly_wage"] if previous_qcew else None),
            "establishment_growth": pct_change(qcew["establishments"] if qcew else None, previous_qcew["establishments"] if previous_qcew else None),
            "gdp_growth": pct_change(bea["gdp"] if bea else None, previous_bea["gdp"] if previous_bea else None),
            "population_growth": pct_change(acs["population"] if acs else None, previous_acs["population"] if previous_acs else None),
            "top_industry": row_to_dict(top_industry),
            "highest_lq_industry": row_to_dict(highest_lq),
        },
        "rankings": [row_to_dict(row) for row in rankings],
        "ranking_counts": counts,
        "same_state_counties": [row_to_dict(row) for row in same_state],
        "top_industries": [row_to_dict(row) for row in industries],
        "lq_rankings": [row_to_dict(row) for row in lq_rankings],
        "trends": trends,
        "summary": summary,
    }


@router.get("/{fips}/industries")
def county_industries(
    fips: str,
    year: int | None = None,
    quarter: str | None = None,
    sort_by: str = "employment",
    level: str = "all",
    limit: int = 25,
):
    if sort_by not in {"employment", "wage", "growth", "lq"}:
        raise HTTPException(status_code=400, detail="Invalid sort_by")
    if level not in {"all", "2", "3", "4", "5", "6", "sector_range"}:
        raise HTTPException(status_code=400, detail="Invalid NAICS level")
    with get_connection() as conn:
        return [row_to_dict(row) for row in _industry_rows(conn, fips, sort_by, limit, year, quarter, level)]


@router.get("/{fips}/trends")
def county_trends(fips: str, metric: str = "employment", industry_code: str | None = None):
    with get_connection() as conn:
        if metric == "unemployment_rate":
            return _trend(conn, fips, metric)
        return _qcew_trend(conn, fips, metric, industry_code or "10")


def _industry_rows(conn, fips: str, sort_by: str, limit: int, year: int | None = None, quarter: str | None = None, level: str = "all"):
    sort_column = {
        "employment": "q.employment",
        "wage": "q.avg_weekly_wage",
        "lq": "q.lq",
        "growth": "growth",
    }[sort_by]
    if year is None or quarter is None:
        latest = conn.execute(
            "SELECT year, quarter FROM county_qcew WHERE fips = ? AND industry_code = '10' ORDER BY year DESC LIMIT 1",
            (fips,),
        ).fetchone()
        year = year or (latest["year"] if latest else 2024)
        quarter = quarter or (latest["quarter"] if latest else "Annual")
    params: list = [year, quarter, fips]
    date_filter = ""
    if level != "all":
        if level == "sector_range":
            date_filter += " AND INSTR(q.industry_code, '-') > 0"
        else:
            date_filter += " AND LENGTH(q.industry_code) = ? AND INSTR(q.industry_code, '-') = 0"
            params.append(int(level))
    params.append(limit)
    return conn.execute(
        f"""
        WITH latest AS (
            SELECT q.*, c.state_abbr, total.employment AS total_employment, l.lq
            FROM county_qcew q
            JOIN counties c ON c.fips = q.fips
            JOIN county_qcew total ON total.fips = q.fips AND total.year = q.year AND total.quarter = q.quarter AND total.industry_code = '10'
            LEFT JOIN industry_lq l ON l.fips = q.fips AND l.industry_code = q.industry_code AND l.year = q.year AND l.quarter = q.quarter
            WHERE q.year = ? AND q.quarter = ? AND q.industry_code <> '10'
        ),
        ranked AS (
            SELECT latest.*,
                   DENSE_RANK() OVER (PARTITION BY industry_code ORDER BY employment DESC) AS employment_national_rank,
                   DENSE_RANK() OVER (PARTITION BY industry_code, state_abbr ORDER BY employment DESC) AS employment_state_rank,
                   DENSE_RANK() OVER (PARTITION BY industry_code ORDER BY lq DESC) AS lq_national_rank,
                   DENSE_RANK() OVER (PARTITION BY industry_code, state_abbr ORDER BY lq DESC) AS lq_state_rank,
                   COUNT(lq) OVER (PARTITION BY industry_code) AS lq_national_denominator,
                   COUNT(lq) OVER (PARTITION BY industry_code, state_abbr) AS lq_state_denominator
            FROM latest
            WHERE lq IS NOT NULL
        )
        SELECT q.fips, q.year, q.quarter, q.industry_code, q.industry_title, q.establishments,
               q.employment, q.avg_weekly_wage, q.lq,
               CASE WHEN INSTR(q.industry_code, '-') > 0 THEN 'sector_range' ELSE CAST(LENGTH(q.industry_code) AS TEXT) END AS naics_digit_level,
               q.employment_national_rank, q.employment_state_rank,
               q.lq_national_rank, q.lq_state_rank,
               q.lq_national_denominator, q.lq_state_denominator,
               ROUND(100.0 * q.employment / NULLIF(q.total_employment, 0), 2) AS employment_share,
               ROUND(100.0 * (q.employment - prev.employment) / NULLIF(prev.employment, 0), 2) AS growth,
               ROUND(100.0 * (q.avg_weekly_wage - prev.avg_weekly_wage) / NULLIF(prev.avg_weekly_wage, 0), 2) AS wage_growth,
               q.year || ' ' || q.quarter AS latest_period
        FROM ranked q
        LEFT JOIN county_qcew prev ON prev.fips = q.fips AND prev.industry_code = q.industry_code AND prev.year = q.year - 1
        WHERE q.fips = ? {date_filter}
        ORDER BY {sort_column} DESC NULLS LAST
        LIMIT ?
        """,
        params,
    ).fetchall()


def _trend(conn, fips: str, metric: str):
    rows = conn.execute(
        f"SELECT year, month, {metric} AS value FROM county_laus WHERE fips = ? ORDER BY year, month",
        (fips,),
    ).fetchall()
    return [row_to_dict(row) for row in rows]


def _qcew_trend(conn, fips: str, metric: str, industry_code: str = "10"):
    rows = conn.execute(
        f"SELECT year, quarter, {metric} AS value FROM county_qcew WHERE fips = ? AND industry_code = ? ORDER BY year, quarter",
        (fips, industry_code),
    ).fetchall()
    return [row_to_dict(row) for row in rows]


def _bea_trend(conn, fips: str, metric: str):
    rows = conn.execute(
        f"SELECT year, {metric} AS value FROM county_bea WHERE fips = ? ORDER BY year",
        (fips,),
    ).fetchall()
    return [row_to_dict(row) for row in rows]


def _acs_trend(conn, fips: str, metric: str):
    rows = conn.execute(
        f"SELECT year, {metric} AS value FROM county_acs WHERE fips = ? ORDER BY year",
        (fips,),
    ).fetchall()
    return [row_to_dict(row) for row in rows]


def _ranking_counts(conn, state_abbr: str):
    national = conn.execute("SELECT COUNT(*) AS count FROM counties").fetchone()["count"]
    state = conn.execute("SELECT COUNT(*) AS count FROM counties WHERE state_abbr = ?", (state_abbr,)).fetchone()["count"]
    return {"national": national, "state": state}
