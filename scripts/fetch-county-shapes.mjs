import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const root = process.cwd();
const registryText = await readFile(path.join(root, "data", "countyRegistry.ts"), "utf8");
const wanted = new Set([...registryText.matchAll(/fips:\s*"(\d{5})"/g)].map((match) => match[1]));

const source = "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json";
const response = await fetch(source);
if (!response.ok) throw new Error(`County shape fetch failed: ${response.status}`);
const geojson = await response.json();
const shapes = {};

for (const feature of geojson.features ?? []) {
  const fips = String(feature.id ?? feature.properties?.GEO_ID ?? feature.properties?.STATE + feature.properties?.COUNTY).padStart(5, "0");
  if (!wanted.has(fips)) continue;
  shapes[fips] = {
    fips,
    type: feature.geometry.type,
    coordinates: feature.geometry.coordinates
  };
}

await mkdir(path.join(root, "data", "generated"), { recursive: true });
await writeFile(
  path.join(root, "data", "generated", "county-shapes.generated.ts"),
  `export type GeneratedCountyShape = {\n  fips: string;\n  type: "Polygon" | "MultiPolygon";\n  coordinates: number[][][] | number[][][][];\n};\n\nexport const countyShapes: Record<string, GeneratedCountyShape> = ${JSON.stringify(shapes)};\n`
);

console.log(`Generated ${Object.keys(shapes).length} county shapes from public GeoJSON.`);
