from __future__ import annotations

from app.database import get_connection, init_db
from app.services.lq_service import compute_lq
from app.services.rankings_service import compute_rankings


def seed_database(force: bool = False) -> None:
    init_db()
    with get_connection() as conn:
        existing = conn.execute("SELECT COUNT(*) AS count FROM counties").fetchone()["count"]
        if existing and not force:
            return

        from app.sample_data import ACS, BEA, COUNTIES, LAUS, QCEW

        for table in (
            "counties",
            "county_laus",
            "county_qcew",
            "county_acs",
            "county_bea",
            "county_rankings",
            "industry_lq",
        ):
            conn.execute(f"DELETE FROM {table}")

        conn.executemany("INSERT INTO counties VALUES (?, ?, ?, ?, ?, ?, ?)", COUNTIES)
        conn.executemany(
            """
            INSERT INTO county_laus
            (fips, year, month, unemployment_rate, labor_force, employed, unemployed)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            LAUS,
        )
        conn.executemany(
            """
            INSERT INTO county_acs
            (fips, year, population, median_household_income, poverty_rate, bachelors_plus_rate,
             median_gross_rent, median_home_value, commute_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            ACS,
        )
        conn.executemany(
            """
            INSERT INTO county_bea
            (fips, year, gdp, personal_income, per_capita_income)
            VALUES (?, ?, ?, ?, ?)
            """,
            BEA,
        )
        conn.executemany(
            """
            INSERT INTO county_qcew
            (fips, year, quarter, ownership_code, industry_code, industry_title, establishments,
             employment, total_wages, avg_weekly_wage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            QCEW,
        )
        conn.commit()

    compute_lq()
    compute_rankings()
