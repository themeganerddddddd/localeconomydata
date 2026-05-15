from __future__ import annotations

from collections import defaultdict

from app.database import get_connection


HIGHER_IS_BETTER = {
    "employment_growth": True,
    "avg_weekly_wage": True,
    "population": True,
    "median_household_income": True,
    "industry_concentration": True,
    "unemployment_rate": False,
    "wage_growth": True,
    "establishment_growth": True,
    "gdp_growth": True,
    "population_growth": True,
}


def _rank(values: list[dict], metric: str) -> list[dict]:
    reverse = HIGHER_IS_BETTER.get(metric, True)
    ranked = sorted([dict(v) for v in values if v["value"] is not None], key=lambda x: x["value"], reverse=reverse)
    total = len(ranked)
    previous_value = object()
    current_rank = 0
    for index, item in enumerate(ranked, start=1):
        if item["value"] != previous_value:
            current_rank = index
            previous_value = item["value"]
        item["rank"] = current_rank
        item["percentile"] = round(100 * (total - index) / max(total - 1, 1), 1)
    return ranked


def compute_rankings() -> int:
    metrics: dict[str, list[dict]] = defaultdict(list)
    with get_connection() as conn:
        counties = conn.execute("SELECT fips, state_abbr, population FROM counties").fetchall()
        for county in counties:
            fips = county["fips"]
            latest_total = conn.execute(
                "SELECT * FROM county_qcew WHERE fips = ? AND industry_code = '10' ORDER BY year DESC, quarter DESC LIMIT 1",
                (fips,),
            ).fetchone()
            previous_total = conn.execute(
                "SELECT * FROM county_qcew WHERE fips = ? AND industry_code = '10' AND year < ? ORDER BY year DESC LIMIT 1",
                (fips, latest_total["year"] if latest_total else 9999),
            ).fetchone()
            laus = conn.execute("SELECT * FROM county_laus WHERE fips = ? ORDER BY year DESC, month DESC LIMIT 1", (fips,)).fetchone()
            acs = conn.execute("SELECT * FROM county_acs WHERE fips = ? ORDER BY year DESC LIMIT 1", (fips,)).fetchone()
            lq = conn.execute("SELECT MAX(lq) AS value FROM industry_lq WHERE fips = ?", (fips,)).fetchone()
            bea = conn.execute("SELECT * FROM county_bea WHERE fips = ? ORDER BY year DESC LIMIT 1", (fips,)).fetchone()
            previous_bea = conn.execute(
                "SELECT * FROM county_bea WHERE fips = ? AND year < ? ORDER BY year DESC LIMIT 1",
                (fips, bea["year"] if bea else 9999),
            ).fetchone()
            acs_previous = conn.execute(
                "SELECT * FROM county_acs WHERE fips = ? AND year < ? ORDER BY year DESC LIMIT 1",
                (fips, acs["year"] if acs else 9999),
            ).fetchone()

            growth = None
            if latest_total and previous_total and previous_total["employment"]:
                growth = 100 * (latest_total["employment"] - previous_total["employment"]) / previous_total["employment"]
            wage_growth = None
            establishment_growth = None
            if latest_total and previous_total and previous_total["avg_weekly_wage"]:
                wage_growth = 100 * (latest_total["avg_weekly_wage"] - previous_total["avg_weekly_wage"]) / previous_total["avg_weekly_wage"]
            if latest_total and previous_total and previous_total["establishments"]:
                establishment_growth = 100 * (latest_total["establishments"] - previous_total["establishments"]) / previous_total["establishments"]
            gdp_growth = None
            if bea and previous_bea and previous_bea["gdp"]:
                gdp_growth = 100 * (bea["gdp"] - previous_bea["gdp"]) / previous_bea["gdp"]
            population_growth = None
            if acs and acs_previous and acs_previous["population"]:
                population_growth = 100 * (acs["population"] - acs_previous["population"]) / acs_previous["population"]
            payload = {"fips": fips, "state_abbr": county["state_abbr"]}
            metrics["employment_growth"].append({**payload, "value": round(growth, 2) if growth is not None else None})
            metrics["wage_growth"].append({**payload, "value": round(wage_growth, 2) if wage_growth is not None else None})
            metrics["establishment_growth"].append({**payload, "value": round(establishment_growth, 2) if establishment_growth is not None else None})
            metrics["gdp_growth"].append({**payload, "value": round(gdp_growth, 2) if gdp_growth is not None else None})
            metrics["population_growth"].append({**payload, "value": round(population_growth, 2) if population_growth is not None else None})
            metrics["avg_weekly_wage"].append({**payload, "value": latest_total["avg_weekly_wage"] if latest_total else None})
            metrics["unemployment_rate"].append({**payload, "value": laus["unemployment_rate"] if laus else None})
            metrics["population"].append({**payload, "value": county["population"]})
            metrics["median_household_income"].append({**payload, "value": acs["median_household_income"] if acs else None})
            metrics["industry_concentration"].append({**payload, "value": lq["value"] if lq else None})

        conn.execute("DELETE FROM county_rankings")
        rows = []
        for metric, values in metrics.items():
            national = _rank(values, metric)
            state_values: dict[str, list[dict]] = defaultdict(list)
            for item in values:
                state_values[item["state_abbr"]].append(item)
            state_rank_lookup = {}
            for state, items in state_values.items():
                for item in _rank(items, metric):
                    state_rank_lookup[(state, item["fips"])] = (item["rank"], item["percentile"])
            for item in national:
                state_rank, state_percentile = state_rank_lookup.get((item["state_abbr"], item["fips"]), (None, None))
                rows.append((item["fips"], metric, item["value"], item["rank"], state_rank, item["percentile"], state_percentile, 2024, "latest"))

        conn.executemany(
            """
            INSERT INTO county_rankings
            (fips, metric, value, national_rank, state_rank, national_percentile, state_percentile, year, period)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            rows,
        )
        conn.commit()
        return len(rows)
