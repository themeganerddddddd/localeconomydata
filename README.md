# LocalEconomyData

LocalEconomyData is a static Next.js App Router site for county-level business expansion, workforce, industry-fit, cost, and market-access intelligence.

## Run Locally

```bash
npm install
npm run dev
```

The site runs at `http://localhost:3000`.

## Build And Validate

```bash
npm run build
npm run lint
```

## Environment Variables

Server-side/update scripts can use:

```text
CENSUS_API_KEY=optional_census_api_key
BLS_API_KEY=your_bls_api_key
BEA_API_KEY=your_bea_api_key
NEXT_PUBLIC_SITE_URL=https://localeconomydata.com
DATA_CACHE_DIR=./data/cache
```

Do not expose BLS, BEA, or Census keys to the client.

## Refresh County Data

```bash
npm run update:data
```

This reads `data/countyRegistry.ts`, fetches public data where keys are available, and writes:

- `data/publicMetrics.generated.ts`

Current public-data support:

- BLS LAUS: labor force, employed, unemployed, unemployment rate.
- BEA Regional: county GDP, personal income, per-capita personal income.
- Census ACS 5-Year: population, median household income, education, poverty when `CENSUS_API_KEY` is present.

QCEW/NAICS industry employment and wage parsing is planned. Until QCEW is wired, industry-fit indicators are clearly treated as screening inputs rather than fully sourced NAICS facts.

## Refresh County Shapes

```bash
npm run fetch:county-shapes
npm run fetch:state-shapes
```

This writes:

- `data/generated/county-shapes.generated.ts`
- `data/generated/state-shapes.generated.ts`

County shape visuals are keyed by FIPS and rendered in `components/CountyShape.tsx`. If exact Census cartographic boundaries are preferred, replace the public GeoJSON source with Census cartographic boundary GeoJSON or simplified TIGER/Line-derived paths.

`components/CountyInStateMap.tsx` renders the state outline first and highlights the selected county on top. Add or refresh state geometry whenever a new state appears in `data/countyRegistry.ts`.

## Add A New County

1. Add the county to `data/countyRegistry.ts` with FIPS, slug, state, region, and metro.
2. Add a completed county narrative record to `data/counties.ts`.
3. Run `npm run update:data`.
4. Run `npm run fetch:county-shapes`.
5. Run `npm run fetch:state-shapes` if the county is in a new state.
6. Run `npm run build`.

Only include counties in the sitemap when the page has substantial content, source status, metrics, strengths/watch-outs, industry exploration, nearby comparisons, and FAQ.

## Add A New Industry

1. Add the industry to `data/industries.ts`.
2. Add the industry key to `IndustryKey` in `data/counties.ts`.
3. Update the scoring defaults or county-specific scores.
4. Confirm industry pages build.

Industry-specific score factors live in `lib/scoring.ts` through `getIndustryScoreBreakdown`. Update labels, weights, or explanations there when adding a sector with different site-selection logic.

## Deploy On Vercel

Deploy the repository root as a standard Next.js project. Set:

```text
NEXT_PUBLIC_SITE_URL=https://localeconomydata.com
```

Then redeploy. The app renders static pages from generated data and does not need a live visitor-facing backend.

## Confirm Sitemap URLs

After build/deploy:

- `https://localeconomydata.com/sitemap.xml` should return XML.
- `https://localeconomydata.com/robots.txt` should link to the sitemap.
- Sitemap should include core pages, completed county pages, region pages, industry pages, and substantial guides only.

## AdSense Readiness Checklist

- About, Contact, Privacy, Terms, and Methodology pages exist.
- County and industry pages include substantial original analysis.
- Data status is visible.
- Public source caveats are clear.
- Sitemap excludes unfinished routes.
- No intrusive ads or popups.
- No fake data is presented as real.
