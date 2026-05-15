// Local development: run FastAPI at http://127.0.0.1:8010.
// Vercel production: set VITE_API_BASE_URL to the Render backend URL.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8010").replace(/\/+$/, "");

export { API_BASE };
console.log("API_BASE:", API_BASE);

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

export class ApiError extends Error {
  url: string;
  status?: number;
  statusText?: string;
  responseText?: string;

  constructor(message: string, details: { url: string; status?: number; statusText?: string; responseText?: string }) {
    super(message);
    this.name = "ApiError";
    this.url = details.url;
    this.status = details.status;
    this.statusText = details.statusText;
    this.responseText = details.responseText;
  }
}

export const apiUrl = (path: string) => `${API_BASE}${path}`;

const formatApiError = (error: unknown) => (error instanceof Error ? error.message : String(error));

export async function apiGet<T>(path: string): Promise<T> {
  const url = apiUrl(path);
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new ApiError(`Network error requesting ${url}: ${formatApiError(error)}`, { url });
  }

  const responseText = await response.text();
  if (!response.ok) {
    throw new ApiError(`API request failed: ${response.status} ${response.statusText} at ${url}${responseText ? ` - ${responseText.slice(0, 500)}` : ""}`, {
      url,
      status: response.status,
      statusText: response.statusText,
      responseText
    });
  }

  try {
    return (responseText ? JSON.parse(responseText) : null) as T;
  } catch (error) {
    throw new ApiError(`Invalid JSON from ${url}: ${formatApiError(error)}`, {
      url,
      status: response.status,
      statusText: response.statusText,
      responseText
    });
  }
}

export const countyUrl = (county: Pick<County, "county_name" | "state_abbr" | "fips">) => {
  const slug = county.county_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `/county/${county.state_abbr.toLowerCase()}/${slug}-${county.fips}`;
};

export const industryUrl = (industry: { industry_code: string; industry_title: string }) => {
  const slug = industry.industry_title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `/industry/${industry.industry_code}/${slug}`;
};
