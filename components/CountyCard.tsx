import { County } from "@/data/counties";
import { calculateCountyScore, getBestIndustries } from "@/lib/scoring";
import CountyInStateMap from "./CountyInStateMap";
import ScoreBadge from "./ScoreBadge";

export default function CountyCard({ county }: { county: County }) {
  const score = calculateCountyScore(county);
  return (
    <article className="flex h-full flex-col rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4"><CountyInStateMap county={county} compact /></div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink">{county.name}</h3>
          <p className="text-sm text-slate-500">{county.state}</p>
        </div>
        <ScoreBadge score={score} />
      </div>
      <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">{county.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {getBestIndustries(county, 3).map(([industry]) => (
          <span key={industry} className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-accent">{industry.replace(/_/g, " ")}</span>
        ))}
      </div>
      <a className="mt-auto pt-5 text-sm font-semibold text-accent" href={`/counties/${county.slug}`}>View county profile</a>
    </article>
  );
}
