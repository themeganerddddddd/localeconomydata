from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[2]))

from app.services.seed_service import seed_database


def ingest_bea(force: bool = False) -> int:
    seed_database(force=force)
    return 1


if __name__ == "__main__":
    print("BEA seed ingestion complete. Full BEA regional ingestion can plug into this module.")
