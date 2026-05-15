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
uvicorn app.main:app --reload --host 127.0.0.1 --port 8010
```

The API runs at `http://127.0.0.1:8010`.

## Run Frontend

Create a local frontend env file:

```bash
cd local-economy/frontend
copy .env.local.example .env.local
```

Vite only exposes client-side environment variables prefixed with `VITE_`, so the variable must be named exactly `VITE_API_BASE_URL`.

```bash
cd local-economy/frontend
npm run dev
```

The app runs at `http://127.0.0.1:5173`.

## Deploy Frontend To Vercel With Render Backend

The FastAPI backend can run on Render while the Vite frontend runs on Vercel.

Render backend settings:

```text
Root Directory: backend
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

After Render deploys, verify:

```text
https://YOUR-RENDER-BACKEND.onrender.com/health
https://YOUR-RENDER-BACKEND.onrender.com/docs
https://YOUR-RENDER-BACKEND.onrender.com/api/counties
```

In Vercel, go to:

`Project -> Settings -> Environment Variables`

Add:

```text
Name: VITE_API_BASE_URL
Value: https://YOUR-RENDER-BACKEND.onrender.com
```

For this deployment, use:

```text
VITE_API_BASE_URL=https://localeconomydata.onrender.com
```

Then redeploy the Vercel frontend. Locally, keep `VITE_API_BASE_URL=http://127.0.0.1:8010` in `frontend/.env.local`. The frontend trims trailing slashes, so both `https://localeconomydata.onrender.com` and `https://localeconomydata.onrender.com/` are accepted.

Vercel environment variables only apply to deployments created after the variable is added or changed. If the browser console logs `API_BASE: http://127.0.0.1:8010` on the live site, redeploy the Vercel frontend and confirm the variable name is exactly `VITE_API_BASE_URL`.

If the frontend uses a custom domain, add it to the backend CORS allowlist through the `FRONTEND_ORIGINS` environment variable on Render as a comma-separated list, for example:

```text
FRONTEND_ORIGINS=https://your-vercel-project.vercel.app,https://yourdomain.com,https://www.yourdomain.com
```

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
