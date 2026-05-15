from __future__ import annotations

import sqlite3
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape

import sys

sys.path.append(str(Path(__file__).resolve().parents[2]))

from app.database import DB_PATH

SITE_URL = "https://localeconomydata.com"
FRONTEND_PUBLIC = Path(__file__).resolve().parents[3] / "frontend" / "public"


def slug(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part)


def url_entry(path: str, priority: str, changefreq: str = "weekly") -> str:
    today = date.today().isoformat()
    return (
        "  <url>\n"
        f"    <loc>{escape(SITE_URL + path)}</loc>\n"
        f"    <lastmod>{today}</lastmod>\n"
        f"    <changefreq>{changefreq}</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        "  </url>"
    )


def main() -> None:
    FRONTEND_PUBLIC.mkdir(parents=True, exist_ok=True)
    static_paths = [
        ("/", "1.0", "daily"),
        ("/rankings/fastest-growing-counties", "0.8", "weekly"),
        ("/rankings/highest-wage-counties", "0.8", "weekly"),
        ("/rankings/lowest-unemployment-counties", "0.8", "weekly"),
        ("/rankings/top-biotech-counties", "0.7", "weekly"),
        ("/rankings/top-manufacturing-counties", "0.7", "weekly"),
        ("/rankings/top-construction-counties", "0.7", "weekly"),
        ("/methodology", "0.6", "monthly"),
        ("/data-sources", "0.6", "monthly"),
        ("/privacy", "0.4", "yearly"),
        ("/terms", "0.4", "yearly"),
        ("/contact", "0.5", "monthly"),
    ]
    entries = [url_entry(path, priority, changefreq) for path, priority, changefreq in static_paths]

    with sqlite3.connect(DB_PATH) as conn:
        rows = conn.execute("SELECT fips, county_name, state_abbr FROM counties ORDER BY state_abbr, county_name").fetchall()
        industries = conn.execute(
            """
            SELECT industry_code, MIN(industry_title) AS industry_title
            FROM county_qcew
            WHERE industry_code <> '10'
            GROUP BY industry_code
            ORDER BY industry_code
            """
        ).fetchall()

    for fips, county_name, state_abbr in rows:
        entries.append(url_entry(f"/county/{state_abbr.lower()}/{slug(county_name)}-{fips}", "0.7", "weekly"))

    for industry_code, industry_title in industries:
        entries.append(url_entry(f"/industry/{industry_code}/{slug(industry_title)}", "0.5", "monthly"))

    sitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
    sitemap += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
    sitemap += "\n".join(entries)
    sitemap += "\n</urlset>\n"
    (FRONTEND_PUBLIC / "sitemap.xml").write_text(sitemap, encoding="utf-8")
    (FRONTEND_PUBLIC / "robots.txt").write_text(
        "User-agent: *\n"
        "Allow: /\n"
        f"Sitemap: {SITE_URL}/sitemap.xml\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(entries)} sitemap URLs to {FRONTEND_PUBLIC / 'sitemap.xml'}")


if __name__ == "__main__":
    main()
