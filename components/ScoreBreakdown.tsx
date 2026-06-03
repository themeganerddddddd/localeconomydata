import { County } from "@/data/counties";
import { getCountyScoreBreakdown } from "@/lib/scoring";

export default function ScoreBreakdown({ county }: { county: County }) {
  const rows = getCountyScoreBreakdown(county);
  return (
    <div className="grid gap-4">
      {rows.map((row) => (
        <div key={row.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-ink">{row.label}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{row.explanation}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-ink">{row.score}</div>
              <div className="text-xs font-semibold uppercase text-slate-500">{Math.round(row.weight * 100)}% weight</div>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400" style={{ width: `${row.score}%` }} />
          </div>
          <p className="mt-2 text-xs font-medium text-slate-500">{row.weightedPoints.toFixed(1)} weighted points</p>
        </div>
      ))}
    </div>
  );
}
