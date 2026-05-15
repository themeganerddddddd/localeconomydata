from __future__ import annotations

import csv
from datetime import datetime, timezone
from io import StringIO

from app.database import get_connection
from app.services.naics import get_naics_digit_level


FIELDS = [
    "county_fips",
    "county_name",
    "state_abbr",
    "state_name",
    "naics_code",
    "naics_digit_level",
    "industry_name",
    "year",
    "period",
    "source_name",
    "source_period",
    "employment",
    "employment_share",
    "employment_growth",
    "establishments",
    "establishment_growth",
    "average_weekly_wage",
    "wage_growth",
    "lq",
    "national_lq_rank",
    "national_lq_rank_denominator",
    "state_lq_rank",
    "state_lq_rank_denominator",
    "national_employment_rank",
    "national_employment_rank_denominator",
    "state_employment_rank",
    "state_employment_rank_denominator",
    "generated_at",
]


def _source_filters(level: str | None, naics_code: str | None, year: int | None) -> tuple[str, list]:
    clauses = ["q.industry_code <> '10'"]
    params: list = []
    if naics_code:
        clauses.append("(q.industry_code LIKE ? OR q.industry_title LIKE ?)")
        params.extend([f"{naics_code}%", f"%{naics_code}%"])
    if year:
        clauses.append("q.year = ?")
        params.append(year)
    else:
        clauses.append(
            """
            q.year = (
                SELECT MAX(q2.year)
                FROM county_qcew q2
                WHERE q2.fips = q.fips AND q2.industry_code = q.industry_code
            )
            """
        )
    if level and level != "all":
        if level == "sector_range":
            clauses.append("INSTR(q.industry_code, '-') > 0")
        else:
            clauses.append("LENGTH(q.industry_code) = ? AND INSTR(q.industry_code, '-') = 0")
            params.append(int(level))
    return " AND ".join(clauses), params


def _display_filters(county_fips: str | None, state: str | None) -> tuple[str, list]:
    clauses: list[str] = []
    params: list = []
    if county_fips:
        clauses.append("ranked.fips = ?")
        params.append(county_fips.zfill(5))
    if state:
        clauses.append("ranked.state_abbr = ?")
        params.append(state.upper())
    return ("WHERE " + " AND ".join(clauses), params) if clauses else ("", params)


def counties_industries_csv(
    county_fips: str | None = None,
    state: str | None = None,
    naics_level: str | None = None,
    naics_code: str | None = None,
    year: int | None = None,
) -> str:
    generated_at = datetime.now(timezone.utc).isoformat()
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=FIELDS)
    writer.writeheader()
    source_where_sql, source_params = _source_filters(naics_level, naics_code, year)
    display_where_sql, display_params = _display_filters(county_fips, state)

    with get_connection() as conn:
        rows = conn.execute(
            f"""
            WITH base AS (
                SELECT q.*, c.county_name, c.state_abbr, c.state_name,
                       total.employment AS total_employment,
                       total.establishments AS total_establishments,
                       l.lq
                FROM county_qcew q
                JOIN counties c ON c.fips = q.fips
                JOIN county_qcew total
                  ON total.fips = q.fips
                 AND total.year = q.year
                 AND total.quarter = q.quarter
                 AND total.industry_code = '10'
                LEFT JOIN industry_lq l
                  ON l.fips = q.fips
                 AND l.industry_code = q.industry_code
                 AND l.year = q.year
                 AND l.quarter = q.quarter
                WHERE {source_where_sql}
            ),
            ranked AS (
                SELECT base.*,
                       DENSE_RANK() OVER (PARTITION BY industry_code, year, quarter ORDER BY employment DESC) AS national_employment_rank,
                       DENSE_RANK() OVER (PARTITION BY industry_code, year, quarter, state_abbr ORDER BY employment DESC) AS state_employment_rank,
                       COUNT(employment) OVER (PARTITION BY industry_code, year, quarter) AS national_employment_denominator,
                       COUNT(employment) OVER (PARTITION BY industry_code, year, quarter, state_abbr) AS state_employment_denominator,
                       DENSE_RANK() OVER (PARTITION BY industry_code, year, quarter ORDER BY lq DESC) AS national_lq_rank,
                       DENSE_RANK() OVER (PARTITION BY industry_code, year, quarter, state_abbr ORDER BY lq DESC) AS state_lq_rank,
                       COUNT(lq) OVER (PARTITION BY industry_code, year, quarter) AS national_lq_denominator,
                       COUNT(lq) OVER (PARTITION BY industry_code, year, quarter, state_abbr) AS state_lq_denominator
                FROM base
            )
            SELECT ranked.*,
                   prev.employment AS prev_employment,
                   prev.establishments AS prev_establishments,
                   prev.avg_weekly_wage AS prev_avg_weekly_wage
            FROM ranked
            LEFT JOIN county_qcew prev
              ON prev.fips = ranked.fips
             AND prev.industry_code = ranked.industry_code
             AND prev.year = ranked.year - 1
            {display_where_sql}
            ORDER BY ranked.state_abbr, ranked.county_name, ranked.industry_code
            """,
            source_params + display_params,
        ).fetchall()

    for row in rows:
        employment_growth = None
        establishment_growth = None
        wage_growth = None
        if row["prev_employment"]:
            employment_growth = round(100 * (row["employment"] - row["prev_employment"]) / row["prev_employment"], 2)
        if row["prev_establishments"]:
            establishment_growth = round(100 * (row["establishments"] - row["prev_establishments"]) / row["prev_establishments"], 2)
        if row["prev_avg_weekly_wage"]:
            wage_growth = round(100 * (row["avg_weekly_wage"] - row["prev_avg_weekly_wage"]) / row["prev_avg_weekly_wage"], 2)
        writer.writerow(
            {
                "county_fips": row["fips"],
                "county_name": row["county_name"],
                "state_abbr": row["state_abbr"],
                "state_name": row["state_name"],
                "naics_code": row["industry_code"],
                "naics_digit_level": get_naics_digit_level(row["industry_code"]),
                "industry_name": row["industry_title"],
                "year": row["year"],
                "period": row["quarter"],
                "source_name": "BLS QCEW",
                "source_period": f"{row['year']} {row['quarter']}",
                "employment": row["employment"],
                "employment_share": round(100 * row["employment"] / row["total_employment"], 2) if row["total_employment"] else "",
                "employment_growth": employment_growth if employment_growth is not None else "",
                "establishments": row["establishments"],
                "establishment_growth": establishment_growth if establishment_growth is not None else "",
                "average_weekly_wage": row["avg_weekly_wage"],
                "wage_growth": wage_growth if wage_growth is not None else "",
                "lq": row["lq"] if row["lq"] is not None else "",
                "national_lq_rank": row["national_lq_rank"] if row["lq"] is not None else "",
                "national_lq_rank_denominator": row["national_lq_denominator"] if row["lq"] is not None else "",
                "state_lq_rank": row["state_lq_rank"] if row["lq"] is not None else "",
                "state_lq_rank_denominator": row["state_lq_denominator"] if row["lq"] is not None else "",
                "national_employment_rank": row["national_employment_rank"],
                "national_employment_rank_denominator": row["national_employment_denominator"],
                "state_employment_rank": row["state_employment_rank"],
                "state_employment_rank_denominator": row["state_employment_denominator"],
                "generated_at": generated_at,
            }
        )
    return output.getvalue()


def county_summary_csv(fips: str) -> str:
    return counties_industries_csv(county_fips=fips)
