from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[2]))

from app.services.rankings_service import compute_rankings


if __name__ == "__main__":
    print(compute_rankings())
