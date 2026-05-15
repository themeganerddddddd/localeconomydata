# LocalEconomyData

LocalEconomyData is a county-first local economic data platform: a simpler Bloomberg/FRED/Our World in Data style interface for U.S. county employment, wages, unemployment, industries, rankings, trends, and exports.

The MVP uses a seeded dataset for 54 counties, including all seeded Maryland counties, major DC-area counties/cities, and major counties in CA, FL, NY, IL, TX, WA, GA, PA, MA, AZ, NC, LA, and more. Examples:

- Montgomery County, MD
- Fairfax County, VA
- District of Columbia
- Orleans Parish, LA
- Travis County, TX
- Wake County, NC
- Maricopa County, AZ
- Los Angeles County, CA
- Cook County, IL
- New York County, NY
- Harris County, TX
- King County, WA
- Miami-Dade County, FL

It is structured so full U.S. county ingestion can be added next.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Recharts
- Backend: FastAPI
- Data processing: Python, pandas-ready scripts
- Database: SQLite
- Exports: CSV now, Excel placeholder

## Setup

```bash
cd local-economy/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

```bash
cd ../frontend
npm install
```

## Run Backend

```bash
cd local-economy/backend
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

## Run Frontend

```bash
cd local-economy/frontend
npm run dev
```

The app runs at `http://127.0.0.1:5173`.

## Update Data

```bash
cd local-economy
python backend/app/scripts/update_all.py
python backend/app/scripts/update_all.py --force
python backend/app/scripts/update_all.py --source qcew
python backend/app/scripts/update_all.py --source laus
python backend/app/scripts/update_all.py --source census
python backend/app/scripts/update_all.py --source bea
python backend/app/scripts/update_all.py --year 2024
```

The MVP pipeline seeds data, computes location quotients, computes rankings, exports static JSON, and writes an update log. The service modules are intentionally small so real QCEW open CSV, LAUS, ACS, and BEA ingestion can replace the seeded rows source by source.

## API

- `GET /api/counties`
- `GET /api/counties/{fips}`
- `GET /api/counties/{fips}/industries`
- `GET /api/counties/{fips}/trends`
- `GET /api/rankings`
- `GET /api/industries/{industry_code}`
- `GET /api/export/county/{fips}`
- `GET /api/forecast/county/{fips}`

## Data Sources

- BLS QCEW: county employment, wages, establishments, NAICS industries, and LQ inputs.
- BLS LAUS: unemployment rate, labor force, employed, unemployed.
- Census ACS 5-year: population, income, education, poverty, commuting, housing.
- BEA Regional Accounts: county GDP, personal income, per-capita income.

No API keys are required for the MVP.

## Add New Metrics

1. Add the raw or normalized field to SQLite.
2. Update the relevant ingest service.
3. Add ranking logic in `backend/app/services/rankings_service.py`.
4. Expose the field through the county or rankings route.
5. Add a stat card, chart, or table column in the frontend.

## Future Premium Features

- Filtered county + NAICS + year range Excel exports.
- Historical bulk downloads.
- All-rankings exports.
- GBDT employment and wage growth forecasts.
- Stripe or account-based gating.

Premium UI states already exist, but payments are intentionally not implemented.
