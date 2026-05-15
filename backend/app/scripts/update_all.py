from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[2]))

from app.database import PROCESSED_DIR
from app.services.lq_service import compute_lq
from app.services.rankings_service import compute_rankings
from app.services.seed_service import seed_database
from app.scripts.build_static_json import build_static_json


def main() -> None:
    parser = argparse.ArgumentParser(description="Update LocalEconomyData seed or source data.")
    parser.add_argument("--force", action="store_true", help="Force re-seeding and replace local SQLite rows.")
    parser.add_argument("--source", choices=["qcew", "laus", "census", "bea", "all"], default="all")
    parser.add_argument("--year", type=int, default=2024)
    args = parser.parse_args()

    log = {"source": args.source, "year": args.year, "steps": []}
    try:
        seed_database(force=args.force)
        log["steps"].append({"name": "seed_database", "status": "ok"})
    except Exception as exc:
        log["steps"].append({"name": "seed_database", "status": "failed", "error": str(exc)})

    for name, fn in (("compute_lq", compute_lq), ("compute_rankings", compute_rankings), ("build_static_json", build_static_json)):
        try:
            count = fn() if name != "compute_lq" else fn(year=args.year)
            log["steps"].append({"name": name, "status": "ok", "rows": count})
        except Exception as exc:
            log["steps"].append({"name": name, "status": "failed", "error": str(exc)})

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    (PROCESSED_DIR / "update_log.json").write_text(json.dumps(log, indent=2), encoding="utf-8")
    print(json.dumps(log, indent=2))


if __name__ == "__main__":
    main()
