from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[2]))

from app.database import PROCESSED_DIR, get_connection


def build_static_json() -> int:
    out_dir = PROCESSED_DIR / "static"
    out_dir.mkdir(parents=True, exist_ok=True)
    with get_connection() as conn:
        counties = [dict(row) for row in conn.execute("SELECT * FROM counties ORDER BY state_abbr, county_name").fetchall()]
        rankings = [dict(row) for row in conn.execute("SELECT * FROM county_rankings ORDER BY metric, national_rank").fetchall()]
    (out_dir / "counties.json").write_text(json.dumps(counties, indent=2), encoding="utf-8")
    (out_dir / "rankings.json").write_text(json.dumps(rankings, indent=2), encoding="utf-8")
    return len(counties) + len(rankings)


if __name__ == "__main__":
    print(build_static_json())
