from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Iterable

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
PROCESSED_DIR = DATA_DIR / "processed"
RAW_DIR = DATA_DIR / "raw"
GEO_DIR = DATA_DIR / "geo"
DB_PATH = PROCESSED_DIR / "local_economy.db"


def ensure_data_dirs() -> None:
    for directory in (RAW_DIR, PROCESSED_DIR, GEO_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def get_connection() -> sqlite3.Connection:
    ensure_data_dirs()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA temp_store = MEMORY")
    conn.execute("PRAGMA cache_size = -64000")
    conn.execute("PRAGMA mmap_size = 268435456")
    return conn


def execute_many(sql: str, rows: Iterable[tuple]) -> None:
    with get_connection() as conn:
        conn.executemany(sql, rows)
        conn.commit()


def init_db() -> None:
    ensure_data_dirs()
    schema_path = BASE_DIR / "schema.sql"
    with get_connection() as conn:
        conn.executescript(schema_path.read_text(encoding="utf-8"))
        conn.commit()
