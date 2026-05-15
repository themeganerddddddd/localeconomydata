import { CountyFeature, countyFips, featureRings, isLonLat, projectLonLat } from "../data/geo";

type Props = {
  fips: string;
  features: CountyFeature[];
  width?: number;
  height?: number;
  className?: string;
};

function collectProjectedPoints(featureItem: CountyFeature) {
  return featureRings(featureItem).flatMap((ring) =>
    ring.map((point) => (isLonLat(point) ? projectLonLat(point, 1000, 620) : [point[0] * 10, point[1] * 10]))
  );
}

export default function CountyShapePreview({ fips, features, width = 220, height = 140, className = "" }: Props) {
  const shape = features.find((item) => countyFips(item) === fips);
  if (!shape) {
    return (
      <div className={`grid place-items-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400 ${className}`} style={{ width, height }}>
        County shape unavailable
      </div>
    );
  }

  const projected = collectProjectedPoints(shape);
  const xs = projected.map((point) => point[0]);
  const ys = projected.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const viewBox = `${minX - 8} ${minY - 8} ${Math.max(maxX - minX + 16, 12)} ${Math.max(maxY - minY + 16, 12)}`;

  return (
    <svg className={`rounded-md border border-slate-200 bg-slate-50 ${className}`} width={width} height={height} viewBox={viewBox} role="img" aria-label="Selected county shape preview">
      {featureRings(shape).map((ring, index) => {
        const points = ring
          .map((point) => {
            const [x, y] = isLonLat(point) ? projectLonLat(point, 1000, 620) : [point[0] * 10, point[1] * 10];
            return `${x.toFixed(2)},${y.toFixed(2)}`;
          })
          .join(" ");
        return <polygon key={index} points={points} fill="#eaf2ff" stroke="#475569" strokeWidth="1.15" />;
      })}
    </svg>
  );
}
