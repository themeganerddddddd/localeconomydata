import { feature } from "topojson-client";
import fallbackGeo from "./seed_counties.json";

export type CountyFeature = {
  type: "Feature";
  id?: string | number;
  properties: { fips?: string; name?: string; synthetic?: boolean; [key: string]: unknown };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};

export type FeatureCollection = {
  type: "FeatureCollection";
  features: CountyFeature[];
};

const LOCAL_ATLAS_URL = "/counties-10m.json";
const ATLAS_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

export async function loadCountyFeatures(): Promise<FeatureCollection> {
  try {
    const response = await fetch(LOCAL_ATLAS_URL);
    if (!response.ok) throw new Error("Local county atlas unavailable");
    const topology = await response.json();
    const collection = feature(topology, topology.objects.counties) as unknown as FeatureCollection;
    return normalizeFeatureCollection({
      ...collection,
      features: collection.features.map((item) => ({
        ...item,
        properties: { ...item.properties, fips: String(item.id ?? item.properties.fips).padStart(5, "0") }
      }))
    });
  } catch {
    try {
      const response = await fetch(ATLAS_URL);
      if (!response.ok) throw new Error("County atlas unavailable");
      const topology = await response.json();
      const collection = feature(topology, topology.objects.counties) as unknown as FeatureCollection;
      return normalizeFeatureCollection({
        ...collection,
        features: collection.features.map((item) => ({
          ...item,
          properties: { ...item.properties, fips: String(item.id ?? item.properties.fips).padStart(5, "0") }
        }))
      });
    } catch {
      return fallbackGeo as FeatureCollection;
    }
  }
}

export function countyFips(featureItem: CountyFeature): string {
  return String(featureItem.properties.fips ?? featureItem.id ?? "").padStart(5, "0");
}

export function projectLonLat([lon, lat]: number[], width = 100, height = 62): [number, number] {
  const x = ((lon + 125) / 59) * width;
  const y = ((50 - lat) / 26) * height;
  return [x, y];
}

function projectUsInsetLonLat([rawLon, lat]: number[]): [number, number] {
  const lon = rawLon > 0 ? rawLon - 360 : rawLon;
  if (lat < 24 && lon < -150) {
    return [
      30 + ((lon + 161) / 7) * 16,
      51 + ((23 - lat) / 5) * 8
    ];
  }
  if (lat > 50 || lon < -130) {
    return [
      2 + ((lon + 180) / 50) * 25,
      38 + ((72 - lat) / 21) * 18
    ];
  }
  if (lat < 20 && lon > -70) {
    return [
      70 + ((lon + 68) / 4) * 11,
      56 + ((19 - lat) / 2) * 4
    ];
  }
  return [
    26 + ((lon + 125) / 59) * 72,
    4 + ((50 - lat) / 26) * 52
  ];
}

function coordinateBounds(features: CountyFeature[]) {
  const points = features.flatMap((featureItem) => featureRings(featureItem).flat());
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  };
}

function mapGeometryCoordinates(
  coordinates: number[][][] | number[][][][],
  mapper: (point: number[]) => number[]
): number[][][] | number[][][][] {
  return coordinates.map((item: any) => {
    if (typeof item?.[0]?.[0] === "number") return item.map(mapper);
    return mapGeometryCoordinates(item, mapper);
  }) as number[][][] | number[][][][];
}

export function normalizeFeatureCollection(collection: FeatureCollection, width = 100, height = 62): FeatureCollection {
  const bounds = coordinateBounds(collection.features);
  const sourceWidth = bounds.maxX - bounds.minX;
  const sourceHeight = bounds.maxY - bounds.minY;
  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0) return collection;

  const geographic = bounds.minX >= -180 && bounds.maxX <= 180 && bounds.minY >= -20 && bounds.maxY <= 75;
  if (geographic) {
    return {
      ...collection,
      features: collection.features.map((featureItem) => ({
        ...featureItem,
        geometry: {
          ...featureItem.geometry,
          coordinates: mapGeometryCoordinates(featureItem.geometry.coordinates, projectUsInsetLonLat) as any
        }
      }))
    };
  }

  const alreadyFitted = bounds.minX >= -1 && bounds.maxX <= width + 1 && bounds.minY >= -1 && bounds.maxY <= height + 1;
  if (alreadyFitted) return collection;

  const padding = 2;
  const scale = Math.min((width - padding * 2) / sourceWidth, (height - padding * 2) / sourceHeight);
  const scaledWidth = sourceWidth * scale;
  const scaledHeight = sourceHeight * scale;
  const offsetX = (width - scaledWidth) / 2;
  const offsetY = (height - scaledHeight) / 2;

  return {
    ...collection,
    features: collection.features.map((featureItem) => ({
      ...featureItem,
      geometry: {
        ...featureItem.geometry,
        coordinates: mapGeometryCoordinates(featureItem.geometry.coordinates, ([x, y]) => [
          offsetX + (x - bounds.minX) * scale,
          offsetY + (y - bounds.minY) * scale
        ]) as any
      }
    }))
  };
}

export function isLonLat(point: number[]): boolean {
  return point[0] <= -50 && point[0] >= -180 && point[1] >= 15 && point[1] <= 75;
}

export function ringToPoints(ring: number[][], width = 100, height = 62): string {
  return ring
    .map((point) => {
      const [x, y] = isLonLat(point) ? projectLonLat(point, width, height) : point;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function featureRings(featureItem: CountyFeature): number[][][] {
  if (featureItem.geometry.type === "Polygon") return featureItem.geometry.coordinates as number[][][];
  return (featureItem.geometry.coordinates as number[][][][]).flat();
}

export function featureCenter(featureItem: CountyFeature): [number, number] {
  const points = featureRings(featureItem).flat();
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return [
    xs.reduce((sum, value) => sum + value, 0) / Math.max(xs.length, 1),
    ys.reduce((sum, value) => sum + value, 0) / Math.max(ys.length, 1)
  ];
}

export function syntheticCountyFeature(fips: string, lon: number, lat: number): CountyFeature {
  const [x, y] = projectLonLat([lon, lat]);
  const size = 0.16;
  return {
    type: "Feature",
    id: fips,
    properties: { fips, synthetic: true },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [x - size, y - size],
        [x + size, y - size],
        [x + size, y + size],
        [x - size, y + size],
        [x - size, y - size]
      ]]
    }
  };
}
