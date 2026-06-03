"use client";

import { useMemo, useState } from "react";
import CountyCard from "@/components/CountyCard";
import { counties } from "@/data/counties";
import { regions } from "@/lib/regions";

export default function CountyDirectory() {
  const [region, setRegion] = useState("All regions");
  const [state, setState] = useState("All states");
  const states = useMemo(() => ["All states", ...Array.from(new Set(counties.map((county) => county.state))).sort()], []);
  const filtered = counties.filter((county) => (region === "All regions" || county.region === region) && (state === "All states" || county.state === state));
  return (
    <div>
      <div className="mt-8 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Region
          <select className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" value={region} onChange={(event) => setRegion(event.target.value)}>
            {["All regions", ...regions()].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          State
          <select className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" value={state} onChange={(event) => setState(event.target.value)}>
            {states.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((county) => <CountyCard key={county.slug} county={county} />)}
      </div>
      {!filtered.length && <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">No counties match those filters.</p>}
    </div>
  );
}
