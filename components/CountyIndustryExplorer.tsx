"use client";

import { useState } from "react";
import IndustryScoreBreakdown from "@/components/IndustryScoreBreakdown";
import { County, IndustryKey } from "@/data/counties";
import { industries } from "@/data/industries";
import { calculateDetailedIndustryScore } from "@/lib/scoring";

function fitLabel(score: number | null) {
  if (score === null) return "Not available";
  if (score >= 85) return "Excellent fit";
  if (score >= 70) return "Strong fit";
  if (score >= 50) return "Moderate fit";
  return "Weak fit";
}

export default function CountyIndustryExplorer({ county }: { county: County }) {
  const [selected, setSelected] = useState<IndustryKey>(industries[0].key as IndustryKey);
  return (
    <div>
      <div className="overflow-x-auto pb-3">
        <div className="flex min-w-full gap-4">
          {industries.map((industry) => {
            const key = industry.key as IndustryKey;
            const score = calculateDetailedIndustryScore(county, key);
            const active = selected === key;
            return (
              <button key={industry.slug} type="button" onClick={() => setSelected(key)} className={`w-[250px] flex-none rounded-3xl border p-5 text-left shadow-sm transition ${active ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">{industry.name}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent">{fitLabel(score)}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2 text-lg font-semibold text-accent">{score ?? "NA"}</div>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{industry.description}</p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-5"><IndustryScoreBreakdown county={county} industry={selected} /></div>
    </div>
  );
}
