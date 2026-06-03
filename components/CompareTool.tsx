"use client";

import { useMemo, useState } from "react";
import CountyComparisonTable from "@/components/CountyComparisonTable";
import CountyScoreChart from "@/components/CountyScoreChart";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import StrengthWeaknessPanel from "@/components/StrengthWeaknessPanel";
import { counties, IndustryKey } from "@/data/counties";
import { industries } from "@/data/industries";
import { calculateCountyScore, calculateDetailedIndustryScore, getBestIndustries } from "@/lib/scoring";

const defaults = ["montgomery-county-md", "fairfax-county-va", "prince-georges-county-md"];

export default function CompareTool() {
  const [selected, setSelected] = useState(defaults);
  const [industry, setIndustry] = useState<IndustryKey>("life_sciences");
  const selectedCounties = useMemo(() => selected.map((slug) => counties.find((county) => county.slug === slug)).filter(Boolean), [selected]);
  const toggle = (slug: string) => {
    setSelected((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);
      if (current.length >= 4) return current;
      return [...current, slug];
    });
  };
  const leader = [...selectedCounties].sort((a, b) => calculateCountyScore(b!) - calculateCountyScore(a!))[0];
  const bestTalent = [...selectedCounties].sort((a, b) => (b?.bachelorsOrHigher ?? 0) - (a?.bachelorsOrHigher ?? 0))[0];
  const bestCost = [...selectedCounties].sort((a, b) => (a?.medianWageEstimate ?? 0) - (b?.medianWageEstimate ?? 0))[0];
  const bestIndustry = [...selectedCounties].sort((a, b) => (getBestIndustries(b!, 1)[0]?.[1] ?? 0) - (getBestIndustries(a!, 1)[0]?.[1] ?? 0))[0];
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Select 2-4 counties</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {counties.map((county) => (
            <label key={county.slug} className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-sm transition ${selected.includes(county.slug) ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"}`}>
              <span><span className="font-semibold text-ink">{county.name}</span><span className="block text-xs text-slate-500">{county.state}</span></span>
              <input type="checkbox" checked={selected.includes(county.slug)} onChange={() => toggle(county.slug)} />
            </label>
          ))}
        </div>
      </div>
      <CountyScoreChart counties={selectedCounties as any} />
      {leader && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-ink">Component comparison anchor: {leader.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">The current leader's component scores show why it rises above the selected alternatives.</p>
            <div className="mt-4"><ScoreBreakdown county={leader as any} /></div>
          </div>
          <StrengthWeaknessPanel county={leader as any} />
        </div>
      )}
      <CountyComparisonTable counties={selectedCounties as any} />
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">Industry-specific comparison</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Choose an industry to compare fit scores across the selected counties.</p>
          </div>
          <label className="text-sm font-semibold text-slate-700">
            Industry
            <select className="mt-2 block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" value={industry} onChange={(event) => setIndustry(event.target.value as IndustryKey)}>
              {industries.map((item) => <option key={item.slug} value={item.key}>{item.name}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">County</th><th className="px-4 py-3">Industry fit score</th><th className="px-4 py-3">Top fit</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{selectedCounties.map((county) => county && <tr key={county.slug}><td className="px-4 py-3 font-semibold text-ink">{county.name}</td><td className="px-4 py-3">{calculateDetailedIndustryScore(county, industry) ?? "Not available"}</td><td className="px-4 py-3 text-slate-600">{getBestIndustries(county, 1)[0]?.[0].replace(/_/g, " ")}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 p-5 leading-7 text-slate-700 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Written recommendation</h2>
        <p className="mt-3">Among the selected counties, {leader?.name} currently has the highest expansion score. Best for talent: {bestTalent?.name}. Best for cost: {bestCost?.name}. Best for industry fit: {bestIndustry?.name}. Best overall: {leader?.name}. This recommendation is directional: a company should still compare facility needs, occupation-level hiring, commute patterns, customer access, incentives, and execution risks before narrowing a short list.</p>
      </div>
    </div>
  );
}
