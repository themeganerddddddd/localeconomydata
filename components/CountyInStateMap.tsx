import CountyShape from "@/components/CountyShape";
import { County } from "@/data/counties";
import { countyShapes } from "@/data/generated/county-shapes.generated";
import { stateShapes } from "@/data/generated/state-shapes.generated";

type Shape = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

const stateFipsByAbbr: Record<string, string> = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06", CO: "08", CT: "09", DE: "10", DC: "11", FL: "12", GA: "13",
  HI: "15", ID: "16", IL: "17", IN: "18", IA: "19", KS: "20", KY: "21", LA: "22", ME: "23", MD: "24", MA: "25",
  MI: "26", MN: "27", MS: "28", MO: "29", MT: "30", NE: "31", NV: "32", NH: "33", NJ: "34", NM: "35", NY: "36",
  NC: "37", ND: "38", OH: "39", OK: "40", OR: "41", PA: "42", RI: "44", SC: "45", SD: "46", TN: "47", TX: "48",
  UT: "49", VT: "50", VA: "51", WA: "53", WV: "54", WI: "55", WY: "56"
};

export default function CountyInStateMap({ county, compact = false }: { county: County; compact?: boolean }) {
  const stateFips = county.stateAbbr ? stateFipsByAbbr[county.stateAbbr] : county.fips?.slice(0, 2);
  const state = stateFips ? stateShapes[stateFips] : undefined;
  const countyShape = county.fips ? countyShapes[county.fips] : undefined;
  if (!state || !countyShape) {
    // Fallback is intentionally quiet: generated state/county shapes can be refreshed from public boundary files.
    return <CountyShape county={county} compact={compact} />;
  }
  const bounds = getBounds(state);
  const statePath = geometryToPath(state, bounds);
  const countyPath = geometryToPath(countyShape, bounds);
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 ${compact ? "p-2" : "p-5"} shadow-xl shadow-blue-950/10 backdrop-blur`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50" />
      <svg viewBox="0 0 160 140" className={`relative w-full ${compact ? "h-24" : "h-56"}`} role="img" aria-label={`${county.name} location within ${county.state}`}>
        <path d={statePath} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        <path d={countyPath} fill="url(#countyInStateGradient)" stroke="#0f766e" strokeWidth="1.35" />
        <defs>
          <linearGradient id="countyInStateGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="55%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      {!compact && <p className="relative mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Location within {county.state}</p>}
    </div>
  );
}

function polygons(shape: Shape) {
  return shape.type === "Polygon" ? [shape.coordinates as number[][][]] : shape.coordinates as number[][][][];
}

function allPoints(shape: Shape) {
  return polygons(shape).flat(2) as number[][];
}

function getBounds(shape: Shape) {
  const points = allPoints(shape);
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  };
}

function geometryToPath(shape: Shape, bounds: ReturnType<typeof getBounds>) {
  const width = Math.max(0.0001, bounds.maxX - bounds.minX);
  const height = Math.max(0.0001, bounds.maxY - bounds.minY);
  const scale = Math.min(136 / width, 116 / height);
  const offsetX = (160 - width * scale) / 2;
  const offsetY = (140 - height * scale) / 2;
  const project = ([x, y]: number[]) => [
    offsetX + (x - bounds.minX) * scale,
    140 - (offsetY + (y - bounds.minY) * scale)
  ];
  return polygons(shape).map((polygon) => polygon.map((ring) => {
    const [first, ...rest] = ring;
    const [startX, startY] = project(first);
    return `M${startX.toFixed(2)} ${startY.toFixed(2)} ${rest.map((point) => {
      const [x, y] = project(point);
      return `L${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(" ")} Z`;
  }).join(" ")).join(" ");
}
