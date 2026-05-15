CREATE TABLE IF NOT EXISTS counties (
  fips TEXT PRIMARY KEY,
  county_name TEXT NOT NULL,
  state_name TEXT NOT NULL,
  state_abbr TEXT NOT NULL,
  population INTEGER,
  lat REAL,
  lon REAL
);

CREATE TABLE IF NOT EXISTS county_laus (
  id INTEGER PRIMARY KEY,
  fips TEXT,
  year INTEGER,
  month INTEGER,
  unemployment_rate REAL,
  labor_force INTEGER,
  employed INTEGER,
  unemployed INTEGER
);

CREATE TABLE IF NOT EXISTS county_qcew (
  id INTEGER PRIMARY KEY,
  fips TEXT,
  year INTEGER,
  quarter TEXT,
  ownership_code TEXT,
  industry_code TEXT,
  industry_title TEXT,
  establishments INTEGER,
  employment INTEGER,
  total_wages REAL,
  avg_weekly_wage REAL
);

CREATE TABLE IF NOT EXISTS county_acs (
  id INTEGER PRIMARY KEY,
  fips TEXT,
  year INTEGER,
  population INTEGER,
  median_household_income REAL,
  poverty_rate REAL,
  bachelors_plus_rate REAL,
  median_gross_rent REAL,
  median_home_value REAL,
  commute_time REAL
);

CREATE TABLE IF NOT EXISTS county_bea (
  id INTEGER PRIMARY KEY,
  fips TEXT,
  year INTEGER,
  gdp REAL,
  personal_income REAL,
  per_capita_income REAL
);

CREATE TABLE IF NOT EXISTS county_rankings (
  id INTEGER PRIMARY KEY,
  fips TEXT,
  metric TEXT,
  value REAL,
  national_rank INTEGER,
  state_rank INTEGER,
  national_percentile REAL,
  state_percentile REAL,
  year INTEGER,
  period TEXT
);

CREATE TABLE IF NOT EXISTS industry_lq (
  id INTEGER PRIMARY KEY,
  fips TEXT,
  year INTEGER,
  quarter TEXT,
  industry_code TEXT,
  industry_title TEXT,
  local_employment INTEGER,
  national_employment INTEGER,
  local_total_employment INTEGER,
  national_total_employment INTEGER,
  lq REAL
);

CREATE INDEX IF NOT EXISTS idx_qcew_fips ON county_qcew(fips, year, quarter);
CREATE INDEX IF NOT EXISTS idx_laus_fips ON county_laus(fips, year, month);
CREATE INDEX IF NOT EXISTS idx_rank_metric ON county_rankings(metric, national_rank);
CREATE INDEX IF NOT EXISTS idx_lq_fips ON industry_lq(fips, year, quarter);
