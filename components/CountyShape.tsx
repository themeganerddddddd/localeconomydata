import { MapPinned } from "lucide-react";
import { County } from "@/data/counties";
import { countyShapes } from "@/data/generated/county-shapes.generated";

function initials(county: County) {
  return county.name
    .replace(/ County| City| Parish| District of Columbia/g, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function CountyShape({ county, compact = false }: { county: County; compact?: boolean }) {
  const generatedShape = county.fips ? countyShapes[county.fips] : undefined;
  const path = generatedShape ? geometryToPath(generatedShape) : county.mapShapePath ?? "M48 12 C75 8 103 22 112 48 C122 76 95 100 66 112 C38 123 14 105 10 75 C6 43 21 18 48 12 Z";
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 ${compact ? "p-2" : "p-5"} shadow-xl shadow-blue-950/10 backdrop-blur`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-cyan-50 to-emerald-100" />
      <svg viewBox="0 0 124 124" className={`relative w-full drop-shadow-sm ${compact ? "h-20" : "h-44"}`} role="img" aria-label={`${county.name} shape`}>
        <path d={path} fill="url(#countyShapeGradient)" stroke="#1e40af" strokeWidth="2.5" />
        <defs>
          <linearGradient id="countyShapeGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="55%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#99f6e4" />
          </linearGradient>
        </defs>
        {!generatedShape && !county.mapShapePath && (
          <>
            <circle cx="62" cy="62" r="24" fill="white" opacity="0.86" />
            <text x="62" y="69" textAnchor="middle" className="fill-blue-900 text-xl font-bold">{initials(county)}</text>
          </>
        )}
      </svg>
      {!compact && <div className="relative mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <MapPinned className="h-4 w-4 text-accent" aria-hidden="true" />
        {generatedShape ? "Real county boundary" : "County shape preview"}
      </div>}
    </div>
  );
}

type Shape = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

function geometryToPath(shape: Shape) {
  const polygons = shape.type === "Polygon" ? [shape.coordinates as number[][][]] : shape.coordinates as number[][][][];
  const points = polygons.flat(2) as number[][];
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(0.0001, maxX - minX);
  const height = Math.max(0.0001, maxY - minY);
  const scale = Math.min(104 / width, 104 / height);
  const offsetX = (124 - width * scale) / 2;
  const offsetY = (124 - height * scale) / 2;
  const project = ([x, y]: number[]) => [
    offsetX + (x - minX) * scale,
    124 - (offsetY + (y - minY) * scale)
  ];
  return polygons.map((polygon) => polygon.map((ring) => {
    const [first, ...rest] = ring;
    const [startX, startY] = project(first);
    return `M${startX.toFixed(2)} ${startY.toFixed(2)} ${rest.map((point) => {
      const [x, y] = project(point);
      return `L${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(" ")} Z`;
  }).join(" ")).join(" ");
}
