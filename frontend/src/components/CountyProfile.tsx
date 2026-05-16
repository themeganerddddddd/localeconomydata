import { useEffect, useMemo, useState } from "react";
import { apiGet, County } from "../api/client";
import { CountyFeature, countyFips, geometryFipsForDataFips, loadCountyFeatures, syntheticCountyFeature } from "../data/geo";
import DownloadPanel from "./DownloadPanel";
import IndustryTable from "./IndustryTable";
import LqTable from "./LqTable";
import StateCountyMap from "./StateCountyMap";
import StatCard from "./StatCard";
import TrendChart from "./TrendChart";
import { slugify } from "../lib/seo";

export type CountyProfileData = {
  county: County;
  latest: { laus: any; acs: any; bea: any; qcew_total: any };
  data_vintage: Record<string, string | null>;
  derived: Record<string, any>;
  rankings: any[];
  ranking_counts: { national: number; state: number };
  same_state_counties: County[];
  top_industries: any[];
  lq_rankings: any[];
  trends: Record<string, any[]>;
  summary: string;
};

const money = (value?: number | null) => (value == null ? "N/A" : `$${Math.round(value).toLocaleString()}`);
const pct = (value?: number | null) => (value == null ? null : `${value > 0 ? "+" : ""}${Number(value).toFixed(1)}%`);
const number = (value?: number | null) => (value == null ? "Data not available" : Math.round(value).toLocaleString());

export default function CountyProfile({ profile }: { profile: CountyProfileData }) {
  const { county, latest } = profile;
  const [features, setFeatures] = useState<CountyFeature[]>([]);
  const [level, setLevel] = useState("all");
  const [industrySearch, setIndustrySearch] = useState("");
  const [showAllIndustries, setShowAllIndustries] = useState(false);
  const [industries, setIndustries] = useState(profile.top_industries);
  const [industryError, setIndustryError] = useState("");

  const rankings = useMemo(() => new Map(profile.rankings.map((ranking) => [ranking.metric, ranking])), [profile.rankings]);
  const rankLine = (metric: string, scope: "national" | "state") => {
    const ranking = rankings.get(metric);
    if (!ranking) return "Data not available";
    const rank = scope === "national" ? ranking.national_rank : ranking.state_rank;
    const total = scope === "national" ? profile.ranking_counts.national : profile.ranking_counts.state;
    const place = scope === "national" ? "U.S. counties" : `${county.state_name} counties`;
    return `#${rank} of ${total.toLocaleString()} ${place}`;
  };

  useEffect(() => {
    loadCountyFeatures().then((collection) => setFeatures(collection.features));
  }, []);

  const shapeFeatures = useMemo(() => {
    if (features.some((feature) => countyFips(feature) === geometryFipsForDataFips(county.fips))) return features;
    return [...features, syntheticCountyFeature(county.fips, county.lon, county.lat)];
  }, [county, features]);

  useEffect(() => {
    apiGet<any[]>(`/api/counties/${county.fips}/industries?level=${level}&limit=250`)
      .then((rows) => {
        setIndustries(rows);
        setIndustryError("");
      })
      .catch((err) => setIndustryError(err.message));
  }, [county.fips, level]);

  const filteredIndustries = industries.filter((row) => `${row.industry_code} ${row.industry_title}`.toLowerCase().includes(industrySearch.toLowerCase()));
  const visibleIndustries = showAllIndustries ? filteredIndustries : filteredIndustries.slice(0, 20);
  const filteredLq = (profile.lq_rankings ?? []).filter((row) => `${row.industry_code} ${row.industry_title}`.toLowerCase().includes(industrySearch.toLowerCase()));
  const vintageLine = `Latest available data: BLS LAUS ${profile.data_vintage.laus ?? "not available"}; BLS QCEW ${profile.data_vintage.qcew ?? "not available"}; ACS 5-Year ${profile.data_vintage.acs ?? "not available"}; BEA ${profile.data_vintage.bea ?? "not available"}.`;

  return (
    <main className="bg-slate-50/70 pb-10">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <nav className="mb-4 text-sm font-semibold text-slate-500">
          <a href="/">Home</a> <span>/</span> <a href={`/state/${slugify(county.state_name)}`}>{county.state_name}</a> <span>/</span> <span>{county.county_name}</span>
        </nav>
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{county.county_name}, {county.state_abbr} Economy</h1>
            <p className="mt-2 text-base text-slate-600">Jobs, wages, unemployment, GDP, industries, rankings, and local economic trends.</p>
            <p className="mt-1 text-sm font-medium text-slate-500">{county.state_name}</p>
            <p className="mt-3 max-w-3xl text-slate-700">{profile.summary}</p>
            <p className="mt-3 text-sm font-semibold text-slate-700">{vintageLine}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-accent">
              <a href={`/state/${slugify(county.state_name)}`}>{county.state_name} counties</a>
              <a href="/rankings/fastest-growing-counties">County rankings</a>
              <a href="/methodology">Methodology</a>
              <a href="/data-sources">Data sources</a>
            </div>
          </div>
          <StateCountyMap stateAbbr={county.state_abbr} selectedFips={county.fips} features={shapeFeatures} countiesData={profile.same_state_counties ?? []} />
        </div>
      </header>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Key Economy Snapshot</h2>
          <p className="mt-1 text-sm text-slate-600">The headline indicators most researchers check first.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Unemployment rate" value={`${latest.laus?.unemployment_rate ?? "N/A"}%`} source="BLS LAUS" period={profile.data_vintage.laus} />
          <StatCard label="Total employment" value={number(latest.qcew_total?.employment)} change={pct(profile.derived.employment_growth)} source="BLS QCEW" period={profile.data_vintage.qcew} />
          <StatCard label="Employment growth" value={pct(profile.derived.employment_growth) ?? "N/A"} source="BLS QCEW" period={profile.data_vintage.qcew} />
          <StatCard label="Average weekly wage" value={money(latest.qcew_total?.avg_weekly_wage)} change={pct(profile.derived.wage_growth)} source="BLS QCEW" period={profile.data_vintage.qcew} />
          <StatCard label="GDP" value={money(latest.bea?.gdp)} change={pct(profile.derived.gdp_growth)} source="BEA" period={profile.data_vintage.bea} />
          <StatCard label="Population" value={number(latest.acs?.population)} change={pct(profile.derived.population_growth)} source="ACS 5-Year" period={profile.data_vintage.acs} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Rankings Snapshot</h2>
        <p className="mt-1 text-sm text-slate-600">National and in-state placement among counties with valid loaded values.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Unemployment rate", "unemployment_rate"],
            ["Employment growth", "employment_growth"],
            ["Average weekly wage", "avg_weekly_wage"],
            ["GDP growth", "gdp_growth"],
            ["Population growth", "population_growth"],
            ["Strongest industry LQ", "industry_concentration"]
          ].map(([label, metric]) => (
            <div key={metric} className="rounded-md border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-500">{label}</div>
              <div className="mt-3 text-lg font-semibold">{rankLine(metric, "national")}</div>
              <div className="mt-1 text-sm text-slate-600">{rankLine(metric, "state")}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Labor Market</h2>
        <p className="mt-1 text-sm text-slate-600">Unemployment, labor force, and payroll employment indicators.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Unemployment rate" value={`${latest.laus?.unemployment_rate ?? "N/A"}%`} source="BLS LAUS" period={profile.data_vintage.laus} />
          <StatCard label="Labor force" value={number(latest.laus?.labor_force)} source="BLS LAUS" period={profile.data_vintage.laus} />
          <StatCard label="Employed" value={number(latest.laus?.employed)} source="BLS LAUS" period={profile.data_vintage.laus} />
          <StatCard label="Unemployed" value={number(latest.laus?.unemployed)} source="BLS LAUS" period={profile.data_vintage.laus} />
          <StatCard label="Total employment" value={number(latest.qcew_total?.employment)} change={pct(profile.derived.employment_growth)} source="BLS QCEW" period={profile.data_vintage.qcew} />
          <StatCard label="Employment growth" value={pct(profile.derived.employment_growth) ?? "N/A"} source="BLS QCEW" period={profile.data_vintage.qcew} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Wages and Income</h2>
        <p className="mt-1 text-sm text-slate-600">Workplace wage levels and household/personal income measures.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Average weekly wage" value={money(latest.qcew_total?.avg_weekly_wage)} change={pct(profile.derived.wage_growth)} source="BLS QCEW" period={profile.data_vintage.qcew} />
          <StatCard label="Wage growth" value={pct(profile.derived.wage_growth) ?? "N/A"} source="BLS QCEW" period={profile.data_vintage.qcew} />
          <StatCard label="Median household income" value={money(latest.acs?.median_household_income)} source="ACS 5-Year" period={profile.data_vintage.acs} />
          <StatCard label="Per-capita income" value={money(latest.bea?.per_capita_income)} source="BEA" period={profile.data_vintage.bea} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Business and Industry</h2>
        <p className="mt-1 text-sm text-slate-600">Business establishments, largest sectors, and strongest local concentrations.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Establishments" value={number(latest.qcew_total?.establishments)} change={pct(profile.derived.establishment_growth)} source="BLS QCEW" period={profile.data_vintage.qcew} />
          <StatCard label="Establishment growth" value={pct(profile.derived.establishment_growth) ?? "N/A"} source="BLS QCEW" period={profile.data_vintage.qcew} />
          <StatCard label="Largest industry" value={profile.derived.top_industry?.industry_title ?? "Data not available"} note={profile.derived.top_industry ? `${number(profile.derived.top_industry.employment)} jobs` : undefined} source="BLS QCEW" period={profile.data_vintage.qcew} />
          <StatCard label="Highest concentration industry" value={profile.derived.highest_lq_industry?.industry_title ?? "Data not available"} note={profile.derived.highest_lq_industry ? `LQ ${profile.derived.highest_lq_industry.lq}` : undefined} source="BLS QCEW" period={profile.data_vintage.qcew} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Output and Population</h2>
        <p className="mt-1 text-sm text-slate-600">Regional output and demographic scale from BEA and ACS-style series.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="GDP" value={money(latest.bea?.gdp)} change={pct(profile.derived.gdp_growth)} source="BEA" period={profile.data_vintage.bea} />
          <StatCard label="GDP growth" value={pct(profile.derived.gdp_growth) ?? "N/A"} source="BEA" period={profile.data_vintage.bea} />
          <StatCard label="Population" value={number(latest.acs?.population)} change={pct(profile.derived.population_growth)} source="ACS 5-Year" period={profile.data_vintage.acs} />
          <StatCard label="Population growth" value={pct(profile.derived.population_growth) ?? "N/A"} source="ACS 5-Year" period={profile.data_vintage.acs} />
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <TrendChart title={`Unemployment over time - BLS LAUS ${profile.trends.unemployment_rate?.[0]?.year ?? ""}-${profile.data_vintage.laus ?? ""}`} data={profile.trends.unemployment_rate ?? []} />
        <TrendChart title={`Employment over time - BLS QCEW ${profile.trends.employment?.[0]?.year ?? ""}-${profile.data_vintage.qcew ?? ""}`} data={profile.trends.employment ?? []} />
        <TrendChart title={`Average weekly wage over time - BLS QCEW ${profile.trends.avg_weekly_wage?.[0]?.year ?? ""}-${profile.data_vintage.qcew ?? ""}`} data={profile.trends.avg_weekly_wage ?? []} />
        <TrendChart title={`GDP over time - BEA ${profile.trends.gdp?.[0]?.year ?? ""}-${profile.data_vintage.bea ?? ""}`} data={profile.trends.gdp ?? []} />
        <TrendChart title={`Population over time - ACS ${profile.trends.population?.[0]?.year ?? ""}-${profile.data_vintage.acs ?? ""}`} data={profile.trends.population ?? []} />
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">NAICS / Industry Breakdown</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">Showing all available loaded industries for this county. Use the NAICS level selector and search box to narrow the table.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Search NAICS or industry" value={industrySearch} onChange={(event) => setIndustrySearch(event.target.value)} />
            <label className="text-sm font-medium text-slate-700">
              NAICS level
              <select className="ml-2 rounded-md border border-slate-300 px-3 py-2" value={level} onChange={(event) => setLevel(event.target.value)}>
                <option value="all">All available detail</option>
                <option value="2">Sector level: 2-digit</option>
                <option value="3">Subsector level: 3-digit</option>
                <option value="4">Industry group: 4-digit</option>
                <option value="5">Industry: 5-digit</option>
                <option value="6">National industry: 6-digit</option>
                <option value="sector_range">Sector ranges</option>
              </select>
            </label>
          </div>
        </div>
        <div className="mt-4">
          {industryError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <div className="font-semibold">Could not load the selected industry detail.</div>
              <div className="mt-1 whitespace-pre-wrap break-words">{industryError}</div>
            </div>
          )}
          <IndustryTable rows={visibleIndustries} />
        </div>
        {filteredIndustries.length > 20 && <button className="mt-3 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold" onClick={() => setShowAllIndustries((value) => !value)}>{showAllIndustries ? "Show fewer" : `Show all ${filteredIndustries.length} industries`}</button>}
      </section>

      <section className="mt-8">
        <LqTable rows={filteredLq} />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        <DownloadPanel fips={county.fips} />
        <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold">Data Sources</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div><strong>BLS LAUS:</strong> monthly unemployment, {profile.data_vintage.laus ?? "not available"}</div>
            <div><strong>BLS QCEW:</strong> annual county industry data, {profile.data_vintage.qcew ?? "not available"}</div>
            <div><strong>Census ACS 5-Year:</strong> release {profile.data_vintage.acs ?? "not available"}</div>
            <div><strong>BEA Regional:</strong> GDP and income, {profile.data_vintage.bea ?? "not available"}</div>
          </div>
          <div className="mt-4 flex gap-3 text-sm font-semibold text-accent">
            <a href="/methodology">Methodology</a>
            <a href="/data-sources">Data Sources</a>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
