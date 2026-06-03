import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const root = process.cwd();
const stateFipsByName = {
  Alabama: "01", Alaska: "02", Arizona: "04", Arkansas: "05", California: "06", Colorado: "08", Connecticut: "09",
  Delaware: "10", "District of Columbia": "11", Florida: "12", Georgia: "13", Hawaii: "15", Idaho: "16",
  Illinois: "17", Indiana: "18", Iowa: "19", Kansas: "20", Kentucky: "21", Louisiana: "22", Maine: "23",
  Maryland: "24", Massachusetts: "25", Michigan: "26", Minnesota: "27", Mississippi: "28", Missouri: "29",
  Montana: "30", Nebraska: "31", Nevada: "32", "New Hampshire": "33", "New Jersey": "34", "New Mexico": "35",
  "New York": "36", "North Carolina": "37", "North Dakota": "38", Ohio: "39", Oklahoma: "40", Oregon: "41",
  Pennsylvania: "42", "Rhode Island": "44", "South Carolina": "45", "South Dakota": "46", Tennessee: "47",
  Texas: "48", Utah: "49", Vermont: "50", Virginia: "51", Washington: "53", "West Virginia": "54",
  Wisconsin: "55", Wyoming: "56"
};

const registryText = await readFile(path.join(root, "data", "countyRegistry.ts"), "utf8");
const wantedStateNames = new Set([...registryText.matchAll(/state:\s*"([^"]+)"/g)].map((match) => match[1]));
const wantedFips = new Set([...wantedStateNames].map((name) => stateFipsByName[name]).filter(Boolean));

const source = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";
const response = await fetch(source);
if (!response.ok) throw new Error(`State shape fetch failed: ${response.status}`);
const geojson = await response.json();
const shapes = {};

for (const feature of geojson.features ?? []) {
  const name = feature.properties?.name;
  const fips = stateFipsByName[name];
  if (!fips || !wantedFips.has(fips)) continue;
  shapes[fips] = {
    fips,
    name,
    type: feature.geometry.type,
    coordinates: feature.geometry.coordinates
  };
}

await mkdir(path.join(root, "data", "generated"), { recursive: true });
await writeFile(
  path.join(root, "data", "generated", "state-shapes.generated.ts"),
  `export type GeneratedStateShape = {\n  fips: string;\n  name: string;\n  type: "Polygon" | "MultiPolygon";\n  coordinates: number[][][] | number[][][][];\n};\n\nexport const stateShapes: Record<string, GeneratedStateShape> = ${JSON.stringify(shapes)};\n`
);

console.log(`Generated ${Object.keys(shapes).length} state shapes from public GeoJSON.`);
