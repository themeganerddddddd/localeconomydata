import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://localeconomydata.com";
const LASTMOD = "2026-05-15";
const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "../..");
const countyFile = resolve(root, "backend/app/data/reference/2024_Gaz_counties_national.txt");
const outputFile = resolve(root, "frontend/public/sitemap.xml");

const stateNames = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut",
  DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
};

const industries = [
  ["11", "Agriculture, Forestry, Fishing and Hunting"],
  ["21", "Mining, Quarrying, and Oil and Gas Extraction"],
  ["22", "Utilities"],
  ["23", "Construction"],
  ["31", "Manufacturing"],
  ["42", "Wholesale Trade"],
  ["44", "Retail Trade"],
  ["48", "Transportation and Warehousing"],
  ["51", "Information"],
  ["52", "Finance and Insurance"],
  ["53", "Real Estate and Rental and Leasing"],
  ["541", "Professional, Scientific, and Technical Services"],
  ["5415", "Computer Systems Design and Related Services"],
  ["5417", "Scientific Research and Development Services"],
  ["56", "Administrative and Support Services"],
  ["61", "Educational Services"],
  ["62", "Health Care and Social Assistance"],
  ["71", "Arts, Entertainment, and Recreation"],
  ["72", "Accommodation and Food Services"],
  ["92", "Public Administration"]
];

const slugify = (value) => value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const urls = [
  ["/", "daily", "1.0"],
  ["/rankings/highest-wage-counties", "weekly", "0.9"],
  ["/rankings/lowest-unemployment-counties", "weekly", "0.9"],
  ["/rankings/fastest-growing-counties", "weekly", "0.9"],
  ["/rankings/top-industry-concentration", "weekly", "0.8"],
  ["/methodology", "monthly", "0.7"],
  ["/data-sources", "monthly", "0.7"],
  ["/privacy", "yearly", "0.4"],
  ["/terms", "yearly", "0.4"],
  ["/contact", "yearly", "0.5"],
  ["/guides/what-is-location-quotient", "monthly", "0.7"],
  ["/guides/what-are-naics-codes", "monthly", "0.7"],
  ["/guides/how-county-unemployment-is-measured", "monthly", "0.7"],
  ["/guides/what-is-qcew", "monthly", "0.7"]
];

for (const [abbr, name] of Object.entries(stateNames)) {
  urls.push([`/state/${slugify(name)}`, "weekly", "0.8"]);
}

try {
  const lines = readFileSync(countyFile, "utf8").trim().split(/\r?\n/);
  const headers = lines.shift().split("\t").map((header) => header.trim());
  const get = (row, key) => row[headers.indexOf(key)]?.trim();
  for (const line of lines) {
    const row = line.split("\t");
    const fips = get(row, "GEOID")?.padStart(5, "0");
    const stateAbbr = get(row, "USPS");
    const countyName = get(row, "NAME");
    if (!fips || !stateAbbr || !countyName || stateAbbr === "PR") continue;
    urls.push([`/county/${stateAbbr.toLowerCase()}/${slugify(countyName)}-${fips}`, "weekly", "0.75"]);
  }
} catch (error) {
  console.warn(`Could not read county gazetteer for sitemap: ${error.message}`);
}

for (const [code, title] of industries) {
  urls.push([`/industry/${code}/${slugify(title)}`, "weekly", "0.75"]);
  urls.push([`/industry/${code}-${slugify(title)}`, "weekly", "0.75"]);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([path, changefreq, priority]) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

if (!xml.startsWith("<?xml")) throw new Error("Generated sitemap does not start with XML declaration.");
if (!xml.includes("<urlset")) throw new Error("Generated sitemap is missing urlset.");
if (/<!doctype html>|<div id=["']root["']/i.test(xml)) throw new Error("Generated sitemap contains HTML.");

writeFileSync(outputFile, xml, "utf8");
console.log(`Generated ${urls.length} sitemap URLs at ${outputFile}`);
