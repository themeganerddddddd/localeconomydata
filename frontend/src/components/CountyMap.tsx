import { PointerEvent, WheelEvent, useEffect, useMemo, useRef, useState } from "react";
import { County, countyUrl } from "../api/client";
import CountyShapePreview from "./CountyShapePreview";
import { CountyFeature, countyFips, featureCenter, featureRings, geometryFipsForDataFips, loadCountyFeatures, ringToPoints, syntheticCountyFeature } from "../data/geo";

type Props = {
  counties: County[];
  selected?: County | null;
  onSelect: (county: County) => void;
};

export default function CountyMap({ counties, selected, onSelect }: Props) {
  const [metric, setMetric] = useState<keyof County>("unemployment_rate");
  const [features, setFeatures] = useState<CountyFeature[]>([]);
  const [hovered, setHovered] = useState<County | null>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 100, height: 62 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const dragMovedRef = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistance = useRef<number | null>(null);
  const countiesByFips = useMemo(() => {
    const map = new Map<string, County>();
    for (const county of counties) {
      map.set(county.fips, county);
      map.set(geometryFipsForDataFips(county.fips), county);
    }
    return map;
  }, [counties]);
  const values = counties.map((county) => Number(county[metric])).filter((value) => Number.isFinite(value));
  const min = Math.min(...values);
  const max = Math.max(...values);

  useEffect(() => {
    loadCountyFeatures().then((collection) => setFeatures(collection.features));
  }, []);

  const mapFeatures = useMemo(() => {
    const seen = new Set(features.map(countyFips));
    const missing = counties
      .filter((county) => !seen.has(geometryFipsForDataFips(county.fips)))
      .map((county) => syntheticCountyFeature(county.fips, county.lon, county.lat));
    return [...features, ...missing];
  }, [counties, features]);

  const fillFor = (county?: County) => {
    if (!county) return "#eef2f7";
    const raw = Number(county[metric]);
    if (!Number.isFinite(raw) || max === min) return "#cbd5e1";
    const normalized = (raw - min) / (max - min);
    const adjusted = metric === "unemployment_rate" ? 1 - normalized : normalized;
    return adjusted > 0.75 ? "#1d4ed8" : adjusted > 0.5 ? "#3b82f6" : adjusted > 0.25 ? "#93c5fd" : "#dbeafe";
  };

  const fmt = (value?: number | null, kind: "pct" | "money" | "number" = "number") => {
    if (value == null) return "Data not available";
    if (kind === "pct") return `${value.toFixed(1)}%`;
    if (kind === "money") return `$${Math.round(value).toLocaleString()}`;
    return Math.round(value).toLocaleString();
  };
  const zoom = (factor: number) => {
    setViewBox((box) => {
      const nextWidth = Math.max(18, Math.min(100, box.width * factor));
      const nextHeight = Math.max(12, Math.min(62, box.height * factor));
      return {
        x: Math.max(0, Math.min(100 - nextWidth, box.x + (box.width - nextWidth) / 2)),
        y: Math.max(0, Math.min(62 - nextHeight, box.y + (box.height - nextHeight) / 2)),
        width: nextWidth,
        height: nextHeight
      };
    });
  };
  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dragRef.current = { x: event.clientX, y: event.clientY };
    dragMovedRef.current = false;
  };
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const activePointers = [...pointers.current.values()];
    if (activePointers.length >= 2) {
      const distance = Math.hypot(activePointers[0].x - activePointers[1].x, activePointers[0].y - activePointers[1].y);
      if (pinchDistance.current) zoom(distance > pinchDistance.current ? 0.96 : 1.04);
      pinchDistance.current = distance;
      return;
    }
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragMovedRef.current = true;
    setViewBox((box) => ({
      ...box,
      x: Math.max(0, Math.min(100 - box.width, box.x - (dx / 760) * box.width)),
      y: Math.max(0, Math.min(62 - box.height, box.y - (dy / 460) * box.height))
    }));
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
  const selectCounty = (county?: County) => {
    if (!county || dragMovedRef.current) return;
    onSelect(county);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">U.S. county map</h2>
            <p className="text-sm text-slate-500">Real county polygons from public U.S. atlas data when available; missing metrics render neutral.</p>
          </div>
          <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={metric} onChange={(event) => setMetric(event.target.value as keyof County)}>
            <option value="unemployment_rate">Unemployment rate</option>
            <option value="employment_growth">Employment growth</option>
            <option value="avg_weekly_wage">Average weekly wage</option>
            <option value="gdp">GDP</option>
          </select>
        </div>
        <div className="relative">
          {hovered && (
            <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
              <div className="font-semibold">{hovered.county_name}, {hovered.state_abbr}</div>
              <div className="text-slate-500">{fmt(Number(hovered[metric]), metric.includes("growth") || metric === "unemployment_rate" ? "pct" : metric === "avg_weekly_wage" || metric === "gdp" ? "money" : "number")}</div>
            </div>
          )}
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-md border border-slate-200 bg-white/90 p-1 shadow-sm">
            <button className="h-7 w-7 rounded border border-slate-300 bg-white text-sm font-semibold" aria-label="Zoom in" onClick={() => zoom(0.72)}>+</button>
            <button className="h-7 w-7 rounded border border-slate-300 bg-white text-sm font-semibold" aria-label="Zoom out" onClick={() => zoom(1.28)}>-</button>
            <button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold" onClick={() => setViewBox({ x: 0, y: 0, width: 100, height: 62 })}>Reset</button>
          </div>
          <svg
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            className="h-[460px] w-full cursor-grab rounded bg-slate-50 active:cursor-grabbing"
            role="img"
            aria-label="Clickable U.S. county map"
            style={{ touchAction: "none" }}
            onWheel={onWheel}
            onDoubleClick={() => zoom(0.72)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
          >
          <rect x="0" y="0" width="100" height="62" fill="#f8fafc" />
          {mapFeatures.map((feature) => {
            const fips = countyFips(feature);
            const county = countiesByFips.get(fips);
            const active = selected?.fips === fips;
            const synthetic = feature.properties.synthetic;
            const [cx, cy] = featureCenter(feature);
            return (
              <g
                key={fips}
                onClick={() => selectCounty(county)}
                onMouseEnter={() => setHovered(county ?? null)}
                onMouseLeave={() => setHovered(null)}
                className={county ? "cursor-pointer" : ""}
              >
                {synthetic ? (
                  <circle cx={cx} cy={cy} r={active ? 0.18 : 0.12} fill={active ? "#0f172a" : fillFor(county)} stroke={active ? "#0f172a" : "#64748b"} strokeWidth={active ? "0.05" : "0.025"} />
                ) : (
                  featureRings(feature).map((ring, index) => (
                    <polygon key={index} points={ringToPoints(ring)} fill={active ? "#0f172a" : fillFor(county)} stroke={active ? "#0f172a" : "#ffffff"} strokeWidth={active ? "0.11" : "0.035"} />
                  ))
                )}
                <title>{county ? `${county.county_name}, ${county.state_abbr}` : "County data not loaded"}</title>
              </g>
            );
          })}
          </svg>
        </div>
      </div>
      <aside className="rounded-md border border-slate-200 bg-white p-5 lg:sticky lg:top-4 lg:self-start">
        {selected ? (
          <>
            <div className="text-sm font-semibold text-accent">County snapshot</div>
            <CountyShapePreview fips={selected.fips} features={mapFeatures} width={330} height={150} className="mt-3 w-full" />
            <h3 className="mt-2 text-2xl font-semibold">{selected.county_name}</h3>
            <p className="mt-1 text-slate-600">{selected.state_name}</p>
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm">
              <div className="font-semibold">Rankings snapshot</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-slate-600">
                <div>U.S. unemployment: <strong>#{selected.unemployment_national_rank ?? "N/A"}</strong></div>
                <div>State unemployment: <strong>#{selected.unemployment_state_rank ?? "N/A"}</strong></div>
                <div>U.S. growth: <strong>#{selected.employment_growth_national_rank ?? "N/A"}</strong></div>
                <div>State growth: <strong>#{selected.employment_growth_state_rank ?? "N/A"}</strong></div>
                <div>U.S. wage: <strong>#{selected.wage_national_rank ?? "N/A"}</strong></div>
                <div>State wage: <strong>#{selected.wage_state_rank ?? "N/A"}</strong></div>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-slate-500">Unemployment</dt><dd className="font-semibold">{fmt(selected.unemployment_rate, "pct")}</dd></div>
              <div><dt className="text-slate-500">Employment</dt><dd className="font-semibold">{fmt(selected.total_employment)}</dd></div>
              <div><dt className="text-slate-500">Employment growth</dt><dd className="font-semibold">{fmt(selected.employment_growth, "pct")}</dd></div>
              <div><dt className="text-slate-500">Avg. weekly wage</dt><dd className="font-semibold">{fmt(selected.avg_weekly_wage, "money")}</dd></div>
              <div><dt className="text-slate-500">GDP</dt><dd className="font-semibold">{fmt(selected.gdp, "money")}</dd></div>
              <div><dt className="text-slate-500">Population</dt><dd className="font-semibold">{fmt(selected.population)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">Sources: BLS LAUS Sep 2025-style monthly seed, BLS QCEW 2024 Annual-style seed, BEA 2023-style seed. FIPS {selected.fips}</p>
            <a className="mt-6 inline-flex w-full justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white" href={countyUrl(selected)}>
              View full economy profile
            </a>
          </>
        ) : (
          <p className="text-sm text-slate-600">Click a loaded county polygon to open economic stats and profile link.</p>
        )}
      </aside>
    </div>
  );
}
