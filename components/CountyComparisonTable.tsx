import { County } from "@/data/counties";
import { calculateCountyScore, getScoreLabel } from "@/lib/scoring";
import { formatMoney, formatNumber, formatPercent } from "@/lib/utils";

export default function CountyComparisonTable({ counties }: { counties: County[] }) {
  const rows = [
    ["Expansion score", (c: County) => String(calculateCountyScore(c))],
    ["Score label", (c: County) => getScoreLabel(calculateCountyScore(c))],
    ["Population", (c: County) => formatNumber(c.population)],
    ["Labor force", (c: County) => formatNumber(c.laborForce)],
    ["Unemployment rate", (c: County) => formatPercent(c.unemploymentRate)],
    ["Bachelor's degree or higher", (c: County) => formatPercent(c.bachelorsOrHigher)],
    ["Median household income", (c: County) => formatMoney(c.medianHouseholdIncome)],
    ["Median wage estimate", (c: County) => formatMoney(c.medianWageEstimate)],
    ["Best industries", (c: County) => c.topIndustries.slice(0, 3).join(", ")]
  ];
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Metric</th>
            {counties.map((county) => <th key={county.slug} className="px-4 py-3">{county.name}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(([label, getter]) => (
            <tr key={label as string}>
              <td className="px-4 py-3 font-semibold">{label as string}</td>
              {counties.map((county) => <td key={county.slug} className="px-4 py-3 text-slate-700">{(getter as (c: County) => string)(county)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
