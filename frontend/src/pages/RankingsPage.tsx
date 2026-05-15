import { useEffect, useMemo, useState } from "react";
import { apiGet, countyUrl } from "../api/client";
import { updateSeo } from "../lib/seo";

const metricFromPath = (path: string) => {
  if (path.includes("highest-wage")) return "avg_weekly_wage";
  if (path.includes("lowest-unemployment")) return "unemployment_rate";
  if (path.includes("biotech") || path.includes("manufacturing") || path.includes("construction")) return "industry_concentration";
  return "employment_growth";
};

export default function RankingsPage() {
  const metric = useMemo(() => metricFromPath(window.location.pathname), []);
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState("");
  const pageTitle = useMemo(() => {
    if (metric === "avg_weekly_wage") return "Highest Wage Counties in the U.S. | LocalEconomy";
    if (metric === "unemployment_rate") return "Lowest Unemployment Counties in the U.S. | LocalEconomy";
    if (metric === "industry_concentration") return "Top Industry Concentration Counties in the U.S. | LocalEconomy";
    return "Fastest Growing Counties in the U.S. | LocalEconomy";
  }, [metric]);
  useEffect(() => {
    updateSeo({
      title: pageTitle,
      description: `Explore U.S. county rankings by ${metric.replace(/_/g, " ")} using LocalEconomyData's loaded BLS, Census, and BEA-style county indicators.`,
      path: window.location.pathname
    });
    apiGet<{ rows: any[] }>(`/api/rankings?metric=${metric}&limit=50`)
      .then((data) => {
        setRows(data.rows);
        setError("");
      })
      .catch((err) => setError(err.message));
  }, [metric, pageTitle]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">County rankings</h1>
      <p className="mt-2 text-slate-600">Ranked by {metric.replace(/_/g, " ")} across loaded U.S. counties. Select a county to open its economy profile.</p>
      <p className="mt-2 text-sm text-slate-500">Latest loaded data: BLS LAUS September 2025; BLS QCEW 2024 Annual; ACS 2023; BEA 2023. Rankings exclude missing values and use metric-specific direction.</p>
      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="font-semibold">Could not load rankings.</div>
          <div className="mt-1 whitespace-pre-wrap break-words">{error}</div>
        </div>
      )}
      <div className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">County</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Percentile</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.fips} className="border-t border-slate-100 hover:bg-blue-50/50">
                <td className="px-4 py-3 font-semibold">#{row.national_rank}</td>
                <td className="px-4 py-3">
                  <a className="font-semibold text-accent hover:underline" href={countyUrl(row)}>{row.county_name}, {row.state_abbr}</a>
                </td>
                <td className="px-4 py-3">{row.value}</td>
                <td className="px-4 py-3">{row.national_percentile}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-accent">
        <a href="/methodology">Ranking methodology</a>
        <a href="/data-sources">Data sources</a>
        <a href="/guides/what-is-location-quotient">What is location quotient?</a>
      </div>
    </main>
  );
}
