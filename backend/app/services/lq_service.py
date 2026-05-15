from __future__ import annotations

from app.database import get_connection


def calculate_lq(local_industry: int, local_total: int, national_industry: int, national_total: int) -> float | None:
    if not all([local_industry, local_total, national_industry, national_total]):
        return None
    return (local_industry / local_total) / (national_industry / national_total)


def compute_lq(year: int = 2024, quarter: str = "Annual") -> int:
    with get_connection() as conn:
        conn.execute("DELETE FROM industry_lq WHERE year = ? AND quarter = ?", (year, quarter))
        totals = conn.execute(
            """
            SELECT fips, employment
            FROM county_qcew
            WHERE year = ? AND quarter = ? AND industry_code = '10'
            """,
            (year, quarter),
        ).fetchall()
        county_totals = {row["fips"]: row["employment"] for row in totals}
        national_total = sum(county_totals.values())

        industries = conn.execute(
            """
            SELECT fips, industry_code, industry_title, employment
            FROM county_qcew
            WHERE year = ? AND quarter = ? AND industry_code <> '10'
            """,
            (year, quarter),
        ).fetchall()
        national_by_industry: dict[str, int] = {}
        for row in industries:
            national_by_industry[row["industry_code"]] = national_by_industry.get(row["industry_code"], 0) + row["employment"]

        rows = []
        for row in industries:
            local_total = county_totals.get(row["fips"], 0)
            national_industry = national_by_industry.get(row["industry_code"], 0)
            lq = calculate_lq(row["employment"], local_total, national_industry, national_total)
            rows.append(
                (
                    row["fips"],
                    year,
                    quarter,
                    row["industry_code"],
                    row["industry_title"],
                    row["employment"],
                    national_industry,
                    local_total,
                    national_total,
                    round(lq, 3) if lq is not None else None,
                )
            )

        conn.executemany(
            """
            INSERT INTO industry_lq
            (fips, year, quarter, industry_code, industry_title, local_employment,
             national_employment, local_total_employment, national_total_employment, lq)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            rows,
        )
        conn.commit()
        return len(rows)
