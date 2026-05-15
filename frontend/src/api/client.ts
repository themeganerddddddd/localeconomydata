export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export type County = {
  fips: string;
  county_name: string;
  state_name: string;
  state_abbr: string;
  population: number;
  lat: number;
  lon: number;
  unemployment_rate?: number | null;
  total_employment?: number | null;
  employment_growth?: number | null;
  avg_weekly_wage?: number | null;
  wage_growth?: number | null;
  gdp?: number | null;
  unemployment_national_rank?: number | null;
  unemployment_state_rank?: number | null;
  employment_growth_national_rank?: number | null;
  employment_growth_state_rank?: number | null;
  wage_national_rank?: number | null;
  wage_state_rank?: number | null;
};

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

export const countyUrl = (county: Pick<County, "county_name" | "state_abbr" | "fips">) => {
  const slug = county.county_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `/county/${county.state_abbr.toLowerCase()}/${slug}-${county.fips}`;
};
