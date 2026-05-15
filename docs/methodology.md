# Methodology

LocalEconomyData is designed around county-first economic indicators. The MVP ships with a small seeded dataset and the same table/API shape expected for full U.S. ingestion.

## Sources

- BLS QCEW: employment, establishments, wages, NAICS industries, and location quotient inputs.
- BLS LAUS: unemployment rate, labor force, employed, and unemployed.
- Census ACS 5-year: population, income, education, poverty, commuting, and housing indicators.
- BEA Regional Accounts: county GDP, personal income, and per-capita income.

## Release timing

QCEW, ACS, and BEA data all arrive with publication lags. County pages should show the latest period loaded into SQLite, not assume that every source has the same latest date.

## Location quotient

`LQ = (county_industry_employment / county_total_employment) / (national_industry_employment / national_total_employment)`

Values above 1.0 indicate a county has a higher employment share in that industry than the national comparison universe.

## Rankings

Rankings are calculated among counties with non-missing metric values. National ranks compare all loaded counties, and state ranks compare counties within a state. Percentiles are rank-derived and missing values are excluded.

## Missing data

Missing source rows are represented as null values and omitted from rankings where necessary. API responses should remain valid even when one source is unavailable.
