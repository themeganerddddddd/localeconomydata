# Housing-market signals and genuinely new employer firms (2026)
**Author research branch — not a blinded IEDC submission repository.** Do not include this GitHub URL in the manuscript supplied for double-blind review.

## Objective
Test whether housing-market conditions improve 3-year out-of-time forecasts of *employer firms age zero*, not business registrations, nonemployers, or newly opened branches of existing companies. Use U.S. Census BDS county `firm age 0 / total employer firms × 100` as the headline rate, and separately identify BDS entrant *establishments* belonging to new firms as a different outcome.

## Headline direct-firm replication (not causal)
| Model | Mean absolute error, pp | Relative error reduction |
|---|---:|---:|
| Economic baseline | 0.6890 | — |
| Baseline + Zillow/BEA home-price level and 3-year appreciation | 0.6445 | **+6.47%** |
| Baseline + educational attainment and IPEDS degree output | 0.7105 | -3.12% |
| Baseline + education + housing | 0.6636 | +3.69% |
| Baseline + education×housing interactions | 0.6606 | +4.13% |
| Baseline + all additional groups | 0.6640 | +3.63% |

6,843 county-year held-out predictions, forecast origins 2017–2020, training year origin <= test origin minus 4, N=50 states. One-year housing improvement **+1.57%** over 10,375 held-out observations. Separate pre-pandemic forecast origin 2016: **+5.15%**, 1,670 tests. Ridge alpha 10 -> +5.78%; alpha 200 -> +6.72%. Conditional 4,000 state-error resamples: +5.20% to +7.60% 95% interval; not uncertainty for a retrained model. Original secondary new-firm *establishment* rate prediction improvement **+7.65%** with 6,891 observations; not interchangeable with firm-count rate.

## Source provenance
- Census BDS employer firms, establishments and firm age 0: https://www.census.gov/programs-surveys/bds/documentation/methodology.html
- Census county EIN Business Formation Statistics: https://www.census.gov/econ/bfs/data/county.html
- USDA ERS county educational attainment: https://www.ers.usda.gov/data-products/county-level-data-sets/
- NCES IPEDS degrees awarded at institutional campus: https://nces.ed.gov/ipeds/
- BEA CAINC1 population / personal income per capita: https://apps.bea.gov/regional/zip/
- Zillow Research county ZHVI and shorter ZORI: https://www.zillow.com/research/data/
- Census County Business Patterns employer employment, establishments and industry mix: https://www.census.gov/programs-surveys/cbp.html

## Data and reproducibility
The full **public-source data and model-output ZIP** and the **blind review Word manuscript** are delivered separately as files in the conversation. Large datasets are **not** added as Git blobs to the production application repository; place `business_births/` and `graduate_housing_study/` as sibling folders. Run `python business_births/firm_count_replication.py`, then the other scripts from the file-based replication supplement. All data are November 2026 retrospective-vintage snapshots. Re-fetching inputs may yield revised data. Check third-party redistribution terms before reposting copied Zillow files publicly.

The manuscript's core inference is **incremental predictive information**, not that cheaper housing causes employer startups. Home value / BEA per-capita income is not founder rent burden; business survival and profitability are not measured. Overlapping prediction windows, small time-origin count, selective complete cases, and a weaker one-year/rent result require caution.

## IEDC 2027
IEDC EDJ call welcomes Track B empirically grounded outside-data research, requires double-blind review, deadline Dec 1, 2026. Official call: https://www.iedconline.org/pages/economic-development-journal/. **Do not submit this author-identified development repository to blind reviewers.** Use anonymized Word document and review data supplement instead.
