import { Download, Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiGet, County } from "../api/client";

export default function DownloadPanel({ fips }: { fips: string }) {
  const [locked, setLocked] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [counties, setCounties] = useState<County[]>([]);
  const [countyFips, setCountyFips] = useState("");
  const [state, setState] = useState("");
  const [naicsLevel, setNaicsLevel] = useState("all");
  const [naicsCode, setNaicsCode] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    apiGet<County[]>("/api/counties").then(setCounties).catch(() => setCounties([]));
  }, []);

  const states = useMemo(() => [...new Set(counties.map((county) => county.state_abbr))].sort(), [counties]);
  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (countyFips) params.set("county_fips", countyFips);
    if (state) params.set("state", state);
    if (naicsLevel && naicsLevel !== "all") params.set("naics_level", naicsLevel);
    if (naicsCode) params.set("naics_code", naicsCode);
    if (year) params.set("year", year);
    const query = params.toString();
    return `/api/export/csv${query ? `?${query}` : ""}`;
  }, [countyFips, state, naicsLevel, naicsCode, year]);

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Downloads</h2>
      <p className="mt-2 text-sm text-slate-600">Leave filters blank to export all loaded counties and all available NAICS codes.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">County
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={countyFips} onChange={(event) => setCountyFips(event.target.value)}>
            <option value="">All counties</option>
            <option value={fips}>Current county</option>
            {counties.map((county) => <option key={county.fips} value={county.fips}>{county.county_name}, {county.state_abbr}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">State
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={state} onChange={(event) => setState(event.target.value)}>
            <option value="">All states</option>
            {states.map((abbr) => <option key={abbr} value={abbr}>{abbr}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">NAICS level
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={naicsLevel} onChange={(event) => setNaicsLevel(event.target.value)}>
            <option value="all">All levels</option>
            <option value="2">2-digit sectors</option>
            <option value="3">3-digit subsectors</option>
            <option value="4">4-digit industry groups</option>
            <option value="5">5-digit industries</option>
            <option value="6">6-digit national industries</option>
            <option value="sector_range">Sector ranges</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">NAICS search
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={naicsCode} onChange={(event) => setNaicsCode(event.target.value)} placeholder="Code or industry" />
        </label>
        <label className="text-sm font-medium text-slate-700">Year
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={year} onChange={(event) => setYear(event.target.value)} placeholder="Latest" />
        </label>
      </div>
      {preparing && <div className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">Preparing CSV...</div>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <a className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white" href={exportUrl} onClick={() => setPreparing(true)}>
          <Download size={16} /> Download CSV
        </a>
        <button className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold" onClick={() => setLocked(true)}>
          <Lock size={16} /> Premium Excel Export
        </button>
        <button className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold" onClick={() => setLocked(true)}>
          <Lock size={16} /> Premium Bulk Download
        </button>
        <button className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold" onClick={() => setLocked(true)}>
          <Lock size={16} /> Premium Forecast Export
        </button>
      </div>
      {locked && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Premium export coming soon</h3>
            <p className="mt-2 text-sm text-slate-600">Select county + NAICS + years. Premium downloads are not enabled yet.</p>
            <button className="mt-5 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={() => setLocked(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
