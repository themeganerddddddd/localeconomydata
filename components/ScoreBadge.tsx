import { getScoreLabel } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export default function ScoreBadge({ score }: { score: number }) {
  const label = getScoreLabel(score);
  return (
    <div className={cn(
      "inline-flex items-center gap-3 rounded-md border px-3 py-2",
      score >= 85 ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
      score >= 70 ? "border-blue-200 bg-blue-50 text-blue-800" :
      score >= 55 ? "border-amber-200 bg-amber-50 text-amber-800" :
      "border-slate-200 bg-slate-50 text-slate-700"
    )}>
      <span className="text-2xl font-semibold">{score}</span>
      <span className="max-w-36 text-xs font-semibold leading-4">{label}</span>
    </div>
  );
}
