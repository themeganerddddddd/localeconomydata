import { useEffect, useMemo, useState } from "react";
import { apiGet, County, countyUrl } from "../api/client";
import { slugify, updateSeo } from "../lib/seo";
import { stateBySlug } from "../lib/states";

const number = (value?: number | null) => (value == null ? "N/A" : Math.round(value).toLocaleString());
const money = (value?: number | null) => (value == null ? "N/A" : `$${Math.round(value).toLocaleString()}`);

export default function StatePage() {
  const slug = window.location.pathname.split("/")[2] ?? "";
  const state = useMemo(() => stateBySlug(slug), [slug]);
  const [counties, setCounties] = useState<County[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state) return;
    const [, stateName] = state;
    updateSeo({
      title: `${stateName} Economy: County Jobs, Wages, GDP & Industry Rankings`,
      description: `Explore ${stateName} economic data by county, including jobs, wages, unemployment, GDP, industry concentration, and rankings.`,
      path: `/state/${slugify(stateName)}`
    });
    apiGet<County[]>("/api/counties")
      .then((rows) => {
        setCounties(rows.filter((county) => county.state_abbr === state[0]));
        setError("");
      })
      .catch((err) => setError(err.message));
  }, [slug, state]);

  if (!state) return <main className="mx-auto max-w-5xl px-4 py-10">State not found.</main>;
  const [, stateName] = state;
  const byEmployment = [...counties].sort((a, b) => (b.total_employment ?? 0) - (a.total_employment ?? 0)).slice(0, 10);
  const byWage = [...counties].sort((a, b) => (b.avg_weekly_wage ?? 0) - (a.avg_weekly_wage ?? 0)).slice(0, 10);
  const byUnemployment = [...counties].sort((a, b) => (a.unemployment_rate ?? 999) - (b.unemployment_rate ?? 999)).slice(0, 10);

  return (
    <main className="bg-slate-50/70">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm font-semibold text-slate-500"><a href="/">Home</a> <span>/</span> <span>{stateName}</span></nav>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{stateName} Economy</h1>
        <p className="mt-3 max-w-3xl text-slate-600">County jobs, wages, unemployment, GDP, industry concentration, and rankings for {stateName}. Latest loaded data: BLS LAUS September 2025; BLS QCEW 2024 Annual; ACS 2023; BEA 2023.</p>
        {error && <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <RankingList title="Top counties by employment" rows={byEmployment} value={(county) => number(county.total_employment)} />
          <RankingList title="Highest wage counties" rows={byWage} value={(county) => money(county.avg_weekly_wage)} />
          <RankingList title="Lowest unemployment counties" rows={byUnemployment} value={(county) => `${county.unemployment_rate ?? "N/A"}%`} />
        </div>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold">All {stateName} Counties</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {counties.map((county) => (
              <a key={county.fips} href={countyUrl(county)} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-accent hover:bg-blue-50">
                {county.county_name}
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Explore More</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-accent">
            <a href="/rankings/fastest-growing-counties">Fastest growing counties</a>
            <a href="/rankings/highest-wage-counties">Highest wage counties</a>
            <a href="/rankings/lowest-unemployment-counties">Lowest unemployment counties</a>
            <a href="/industry/541/professional-scientific-and-technical-services">Professional services</a>
            <a href="/industry/62/health-care-and-social-assistance">Health care</a>
            <a href="/methodology">Methodology</a>
          </div>
        </section>
      </section>
    </main>
  );
}

function RankingList({ title, rows, value }: { title: string; rows: County[]; value: (county: County) => string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.map((county, index) => (
          <a key={county.fips} href={countyUrl(county)} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-slate-50">
            <span className="text-sm font-semibold">{index + 1}. {county.county_name}</span>
            <span className="text-sm text-slate-600">{value(county)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
