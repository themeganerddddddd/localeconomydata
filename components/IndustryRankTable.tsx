import { IndustryKey } from "@/data/counties";
import { industries } from "@/data/industries";
import { calculateIndustryScore, rankCountiesByIndustry } from "@/lib/scoring";

export default function IndustryRankTable({ industry }: { industry: IndustryKey }) {
  const rows = rankCountiesByIndustry(industry);
  const title = industries.find((item) => item.key === industry)?.name ?? industry;
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">County</th>
            <th className="px-4 py-3">{title} score</th>
            <th className="px-4 py-3">Best uses</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((county, index) => (
            <tr key={county.slug}>
              <td className="px-4 py-3 font-semibold">#{index + 1}</td>
              <td className="px-4 py-3"><a className="font-semibold text-accent" href={`/counties/${county.slug}`}>{county.name}, {county.state}</a></td>
              <td className="px-4 py-3">{calculateIndustryScore(county, industry)}</td>
              <td className="px-4 py-3 text-slate-600">{county.topIndustries.slice(0, 3).join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
