from __future__ import annotations

from app.database import get_connection


def load_training_data():
    with get_connection() as conn:
        return conn.execute(
            "SELECT fips, year, industry_code, employment, avg_weekly_wage FROM county_qcew ORDER BY fips, industry_code, year"
        ).fetchall()


def train_model():
    return {"status": "disabled", "message": "GBDT training will be enabled when full historical data is available."}


def predict_county_growth(fips: str, industry_code: str | None = None) -> dict:
    query = "SELECT * FROM county_qcew WHERE fips = ?"
    params: list[str] = [fips]
    if industry_code:
        query += " AND industry_code = ?"
        params.append(industry_code)
    else:
        query += " AND industry_code = '10'"
    query += " ORDER BY year DESC LIMIT 2"
    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()

    baseline = None
    wage_growth = None
    if len(rows) == 2 and rows[1]["employment"]:
        baseline = 100 * (rows[0]["employment"] - rows[1]["employment"]) / rows[1]["employment"]
    if len(rows) == 2 and rows[1]["avg_weekly_wage"]:
        wage_growth = 100 * (rows[0]["avg_weekly_wage"] - rows[1]["avg_weekly_wage"]) / rows[1]["avg_weekly_wage"]

    return {
        "fips": fips,
        "industry_code": industry_code,
        "predicted_employment_growth": round(baseline, 2) if baseline is not None else None,
        "predicted_wage_growth": round(wage_growth, 2) if wage_growth is not None else None,
        "confidence_score": 0.32 if baseline is not None else None,
        "model_version": "baseline-v0",
        "status": "placeholder",
    }
