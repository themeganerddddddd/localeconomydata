import { ArrowRight } from "lucide-react";
import { County, IndustryKey } from "@/data/counties";
import { industries } from "@/data/industries";
import { generateIndustryScoreExplanation, generateIndustryStrengths, generateIndustryWatchouts } from "@/lib/content/industryNarratives";
import { calculateDetailedIndustryScore, getIndustryScoreBreakdown } from "@/lib/scoring";

function fitLabel(score: number | null) {
  if (score === null) return "Not available";
  if (score >= 85) return "Excellent fit";
  if (score >= 70) return "Strong fit";
  if (score >= 50) return "Moderate fit";
  return "Weak fit";
}

export default function IndustryScoreBreakdown({ county, industry }: { county: County; industry: IndustryKey }) {
  const meta = industries.find((item) => item.key === industry);
  const score = calculateDetailedIndustryScore(county, industry);
  const rows = getIndustryScoreBreakdown(county, industry);
  const strengths = generateIndustryStrengths(county, industry);
  const watchouts = generateIndustryWatchouts(county, industry);
  return (
    <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Industry score breakdown</p>
          <h3 className="mt-1 text-2xl font-semibold text-ink">{meta?.name}</h3>
          <p className="mt-2 leading-7 text-slate-600">{generateIndustryScoreExplanation(county, industry)}</p>
        </div>
        <div className="rounded-3xl bg-white px-5 py-4 text-center shadow-sm">
          <div className="text-4xl font-semibold text-ink">{score ?? "NA"}</div>
          <div className="text-xs font-semibold uppercase text-slate-500">{fitLabel(score)}</div>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {rows.map((row) => (
          <div key={row.key} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-ink">{row.label}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">{row.explanation}</p>
              </div>
              <div className="text-right text-sm font-semibold text-slate-600">{row.score === null ? "Not available" : row.score}<span className="block text-xs uppercase text-slate-400">{Math.round(row.weight * 100)}% weight</span></div>
            </div>
            {row.score !== null && <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-400" style={{ width: `${row.score}%` }} /></div>}
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <h4 className="font-semibold text-ink">Strengths for this industry</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">{strengths.map((item) => <li key={item}>- {item}</li>)}</ul>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h4 className="font-semibold text-ink">Watch-outs</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">{watchouts.map((item) => <li key={item}>- {item}</li>)}</ul>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <a className="inline-flex items-center gap-1 text-sm font-semibold text-accent" href={`/industries/${meta?.slug}`}>Open industry page <ArrowRight className="h-4 w-4" /></a>
        <a className="inline-flex items-center gap-1 text-sm font-semibold text-accent" href="/compare">Compare counties <ArrowRight className="h-4 w-4" /></a>
      </div>
    </section>
  );
}
