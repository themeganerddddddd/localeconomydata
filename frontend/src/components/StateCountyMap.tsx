import { PointerEvent, WheelEvent, useEffect, useMemo, useRef, useState } from "react";
import { County, countyUrl } from "../api/client";
import { CountyFeature, countyFips, featureCenter, featureRings, geometryFipsForDataFips, isLonLat, projectLonLat, syntheticCountyFeature } from "../data/geo";

const STATE_FIPS: Record<string, string> = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06", CO: "08", CT: "09", DE: "10",
  DC: "11", FL: "12", GA: "13", HI: "15", ID: "16", IL: "17", IN: "18", IA: "19",
  KS: "20", KY: "21", LA: "22", ME: "23", MD: "24", MA: "25", MI: "26", MN: "27",
  MS: "28", MO: "29", MT: "30", NE: "31", NV: "32", NH: "33", NJ: "34", NM: "35",
  NY: "36", NC: "37", ND: "38", OH: "39", OK: "40", OR: "41", PA: "42", RI: "44",
  SC: "45", SD: "46", TN: "47", TX: "48", UT: "49", VT: "50", VA: "51", WA: "53",
  WV: "54", WI: "55", WY: "56"
};

function projectedRing(ring: number[][]) {
  return ring.map((point) => (isLonLat(point) ? projectLonLat(point, 1000, 620) : [point[0] * 10, point[1] * 10]));
}

function viewBoxFor(features: CountyFeature[]) {
  const points = features.flatMap((feature) => featureRings(feature).flatMap(projectedRing));
  if (!points.length) return "0 0 1000 620";
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return `${minX - 12} ${minY - 12} ${Math.max(maxX - minX + 24, 24)} ${Math.max(maxY - minY + 24, 24)}`;
}

export default function StateCountyMap({
  stateAbbr,
  selectedFips,
  features,
  countiesData = []
}: {
  stateAbbr: string;
  selectedFips: string;
  features: CountyFeature[];
  countiesData?: County[];
}) {
  const statePrefix = STATE_FIPS[stateAbbr];
  const countyByFips = new Map<string, County>();
  countiesData.forEach((county) => {
    countyByFips.set(county.fips, county);
    countyByFips.set(geometryFipsForDataFips(county.fips), county);
  });
  const stateFeatures = features.filter((feature) => countyFips(feature).startsWith(statePrefix ?? ""));
  const atlasFips = new Set(stateFeatures.map(countyFips));
  const missingLoadedFeatures = countiesData
    .filter((county) => !atlasFips.has(geometryFipsForDataFips(county.fips)))
    .map((county) => syntheticCountyFeature(county.fips, county.lon, county.lat));
  const renderFeatures = stateFeatures.length ? [...stateFeatures, ...missingLoadedFeatures] : countiesData.map((county) => ({
    type: "Feature" as const,
    id: county.fips,
    properties: { fips: county.fips },
    geometry: { type: "Polygon" as const, coordinates: [[
      projectLonLat([county.lon - 0.2, county.lat + 0.2], 1000, 620),
      projectLonLat([county.lon + 0.2, county.lat + 0.2], 1000, 620),
      projectLonLat([county.lon + 0.2, county.lat - 0.2], 1000, 620),
      projectLonLat([county.lon - 0.2, county.lat - 0.2], 1000, 620),
      projectLonLat([county.lon - 0.2, county.lat + 0.2], 1000, 620)
    ]] }
  }));

  const fittedViewBox = useMemo(() => viewBoxFor(renderFeatures), [renderFeatures]);
  const [viewBox, setViewBox] = useState(fittedViewBox);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistance = useRef<number | null>(null);

  useEffect(() => setViewBox(fittedViewBox), [fittedViewBox]);

  const parsed = () => {
    const [x, y, width, height] = viewBox.split(" ").map(Number);
    return { x, y, width, height };
  };
  const updateBox = (next: { x: number; y: number; width: number; height: number }) => setViewBox(`${next.x} ${next.y} ${next.width} ${next.height}`);
  const zoom = (factor: number) => {
    const box = parsed();
    const width = Math.max(box.width * factor, box.width * 0.2);
    const height = Math.max(box.height * factor, box.height * 0.2);
    updateBox({ x: box.x + (box.width - width) / 2, y: box.y + (box.height - height) / 2, width, height });
  };
  const pan = (dx: number, dy: number) => {
    const box = parsed();
    updateBox({ ...box, x: box.x + dx * box.width, y: box.y + dy * box.height });
  };
  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dragRef.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const active = [...pointers.current.values()];
    if (active.length >= 2) {
      const distance = Math.hypot(active[0].x - active[1].x, active[0].y - active[1].y);
      if (pinchDistance.current) zoom(distance > pinchDistance.current ? 0.96 : 1.04);
      pinchDistance.current = distance;
      return;
    }
    if (!dragRef.current) return;
    const box = parsed();
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    updateBox({ ...box, x: box.x - (dx / 620) * box.width, y: box.y - (dy / 260) * box.height });
    dragRef.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerEnd = (event: PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchDistance.current = null;
    if (pointers.current.size === 0) dragRef.current = null;
  };
  const onWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    zoom(event.deltaY > 0 ? 1.12 : 0.88);
  };

  if (!renderFeatures.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold">Other counties in {stateAbbr}</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {countiesData.map((county) => <a key={county.fips} className="rounded border border-slate-200 px-2 py-1" href={countyUrl(county)}>{county.county_name}</a>)}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <h2 className="text-base font-semibold">County context in {stateAbbr}</h2>
        <p className="text-sm text-slate-500">Click another loaded county in the state to open its economy profile.</p>
      </div>
      <div className="relative">
        <div className="absolute right-3 top-3 z-10 flex gap-2">
          <button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold" onClick={() => zoom(0.75)}>+</button>
          <button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold" onClick={() => zoom(1.25)}>-</button>
          <button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold" onClick={() => setViewBox(fittedViewBox)}>Reset map</button>
        </div>
      <svg
        viewBox={viewBox}
        className="h-64 w-full rounded bg-slate-50"
        role="img"
        aria-label={`${stateAbbr} county map`}
        style={{ touchAction: "none" }}
        onWheel={onWheel}
        onDoubleClick={() => zoom(0.75)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        {renderFeatures.map((feature) => {
          const fips = countyFips(feature);
          const county = countyByFips.get(fips);
          const selected = fips === selectedFips;
          const synthetic = "synthetic" in feature.properties && feature.properties.synthetic;
          const center = projectedRing([featureCenter(feature)])[0];
          return (
            <a key={fips} href={county ? countyUrl(county) : undefined} className={county ? "cursor-pointer" : ""}>
              {synthetic ? (
                <circle cx={center[0]} cy={center[1]} r={selected ? 2.2 : 1.5} fill={selected ? "#2563eb" : county ? "#dbeafe" : "#f1f5f9"} stroke={selected ? "#0f172a" : "#64748b"} strokeWidth={selected ? "0.7" : "0.4"} />
              ) : (
                featureRings(feature).map((ring, index) => {
                  const points = projectedRing(ring).map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
                  return <polygon key={index} points={points} fill={selected ? "#2563eb" : county ? "#dbeafe" : "#f1f5f9"} stroke={selected ? "#0f172a" : "#94a3b8"} strokeWidth={selected ? "1.2" : "0.45"} />;
                })
              )}
              <title>{county ? `${county.county_name}, ${county.state_abbr}` : "County not loaded"}</title>
            </a>
          );
        })}
      </svg>
      </div>
    </div>
  );
}
