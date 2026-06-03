import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const root = process.cwd();

async function loadEnv() {
  const envPath = path.join(root, ".env.local");
  if (!existsSync(envPath)) return;
  const text = await readFile(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=").trim();
  }
}

async function loadRegistry() {
  const text = await readFile(path.join(root, "data", "countyRegistry.ts"), "utf8");
  return [...text.matchAll(/\{\s*fips:\s*"(\d{5})",\s*name:\s*"([^"]+)",\s*state:\s*"([^"]+)",\s*stateAbbr:\s*"([^"]+)",\s*slug:\s*"([^"]+)"/g)]
    .map((match) => ({ fips: match[1], name: match[2], state: match[3], stateAbbr: match[4], slug: match[5] }));
}

const counties = await loadRegistry();

function latestBlsPoint(series) {
  const rows = series?.data ?? [];
  return rows.find((row) => /^M\d{2}$/.test(row.period) && Number.isFinite(Number(row.value)));
}

async function fetchBlsLaus() {
  const key = process.env.BLS_API_KEY;
  const seriesid = counties.flatMap(({ fips }) => [
    `LAUCN${fips}0000000003`,
    `LAUCN${fips}0000000004`,
    `LAUCN${fips}0000000005`,
    `LAUCN${fips}0000000006`
  ]);
  const response = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      seriesid,
      startyear: "2025",
      endyear: "2026",
      ...(key ? { registrationkey: key } : {})
    })
  });
  if (!response.ok) throw new Error(`BLS LAUS failed: ${response.status}`);
  const json = await response.json();
  const map = {};
  for (const series of json.Results?.series ?? []) {
    const match = series.seriesID.match(/^LAUCN(\d{5})000000000([3456])$/);
    if (!match) continue;
    const [, fips, code] = match;
    const slug = counties.find((county) => county.fips === fips)?.slug;
    const point = latestBlsPoint(series);
    if (!slug || !point) continue;
    map[slug] ??= {};
    if (code === "3") map[slug].unemploymentRate = Number(point.value);
    if (code === "4") map[slug].unemployed = Number(point.value);
    if (code === "5") map[slug].employed = Number(point.value);
    if (code === "6") map[slug].laborForce = Number(point.value);
    map[slug].blsLausPeriod = `${point.periodName} ${point.year}`;
  }
  return map;
}

async function fetchCensusAcs() {
  const key = process.env.CENSUS_API_KEY;
  const variables = [
    "NAME",
    "B01003_001E",
    "B19013_001E",
    "B15003_001E",
    "B15003_022E",
    "B15003_023E",
    "B15003_024E",
    "B15003_025E",
    "B17001_001E",
    "B17001_002E"
  ];
  const map = {};
  for (const county of counties) {
    const state = county.fips.slice(0, 2);
    const countyCode = county.fips.slice(2);
    const params = new URLSearchParams({
      get: variables.join(","),
      for: `county:${countyCode}`,
      in: `state:${state}`,
      ...(key ? { key } : {})
    });
    const response = await fetch(`https://api.census.gov/data/2023/acs/acs5?${params}`);
    if (!response.ok) continue;
    const text = await response.text();
    if (!text.trim().startsWith("[")) continue;
    const rows = JSON.parse(text);
    const header = rows[0];
    const row = rows[1];
    if (!row) return;
    const get = (name) => Number(row[header.indexOf(name)]);
    const educationBase = get("B15003_001E");
    const bachelors = get("B15003_022E") + get("B15003_023E") + get("B15003_024E") + get("B15003_025E");
    const povertyBase = get("B17001_001E");
    const poverty = get("B17001_002E");
    map[county.slug] = {
      population: clean(get("B01003_001E")),
      medianHouseholdIncome: clean(get("B19013_001E")),
      bachelorsOrHigher: educationBase > 0 ? Number(((bachelors / educationBase) * 100).toFixed(1)) : undefined,
      povertyRate: povertyBase > 0 ? Number(((poverty / povertyBase) * 100).toFixed(1)) : undefined,
      censusAcsYear: "2023 ACS 5-Year"
    };
  }
  return map;
}

function latestBeaRow(rows) {
  return rows
    .filter((item) => item.DataValue && item.DataValue !== "(NA)" && /^\d{4}$/.test(String(item.TimePeriod ?? item.Year ?? "")))
    .sort((a, b) => Number(b.TimePeriod ?? b.Year) - Number(a.TimePeriod ?? a.Year))[0];
}

async function fetchBeaTable(tableName, lineCode, valueKey, transform = (value) => value) {
  const key = process.env.BEA_API_KEY;
  if (!key) return {};
  const map = {};
  await Promise.all(counties.map(async ({ slug, fips }) => {
    const params = new URLSearchParams({
      UserID: key,
      method: "GetData",
      datasetname: "Regional",
      TableName: tableName,
      LineCode: String(lineCode),
      GeoFips: fips,
      Year: "ALL",
      ResultFormat: "JSON"
    });
    const response = await fetch(`https://apps.bea.gov/api/data/?${params}`);
    if (!response.ok) return;
    const json = await response.json();
    const rows = json.BEAAPI?.Results?.Data ?? [];
    const row = latestBeaRow(rows);
    if (!row) return;
    const value = Number(String(row.DataValue).replace(/,/g, ""));
    if (!Number.isFinite(value)) return;
    map[slug] = {
      [valueKey]: transform(value),
      [valueKey === "gdpMillions" ? "beaGdpYear" : "beaIncomeYear"]: String(row.TimePeriod ?? row.Year ?? "")
    };
  }));
  return map;
}

function merge(...objects) {
  const output = {};
  for (const object of objects) {
    for (const [slug, metrics] of Object.entries(object)) {
      output[slug] = { ...(output[slug] ?? {}), ...metrics };
    }
  }
  const updatedAt = new Date().toISOString();
  for (const metrics of Object.values(output)) metrics.updatedAt = updatedAt;
  return output;
}

function clean(value) {
  return Number.isFinite(value) && value > -1 ? value : undefined;
}

function toTs(metrics) {
  return `import type { PublicCountyMetric } from "./publicMetrics";\n\nexport const publicMetrics: Record<string, PublicCountyMetric> = ${JSON.stringify(metrics, null, 2)};\n`;
}

await loadEnv();

const bls = await fetchBlsLaus();
const census = await fetchCensusAcs();
const gdp = await fetchBeaTable("CAGDP9", 1, "gdpMillions", (value) => Math.round(value / 1000));
const perCapitaIncome = await fetchBeaTable("CAINC1", 3, "perCapitaPersonalIncome");
const personalIncome = await fetchBeaTable("CAINC1", 1, "personalIncomeMillions", (value) => Math.round(value / 1000));
const metrics = merge(census, bls, gdp, perCapitaIncome, personalIncome);

await writeFile(path.join(root, "data", "publicMetrics.generated.ts"), toTs(metrics));
console.log(`Updated public metrics for ${Object.keys(metrics).length} counties.`);
