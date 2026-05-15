import { useEffect, useMemo, useState } from "react";
import { apiGet, countyUrl } from "../api/client";
import IndustryTable from "../components/IndustryTable";
import { slugify, updateSeo } from "../lib/seo";

export default function IndustryPage() {
  const code = useMemo(() => (window.location.pathname.split("/")[2] ?? "541").split("-")[0], []);
  const [profile, setProfile] = useState<any | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    apiGet<any>(`/api/industries/${code}`)
      .then((data) => {
        setProfile(data);
        setError("");
        updateSeo({
          title: `${data.industry_title} Economy: Top Counties, Wages, Jobs & Location Quotients`,
          description: `Explore where "${data.industry_title}" is strongest across U.S. counties using employment, wages, growth, and location quotient rankings.`,
          path: `/industry/${code}/${slugify(data.industry_title)}`
        });
      })
      .catch((err) => setError(err.message));
  }, [code]);
  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="font-semibold">Could not load industry data.</div>
          <div className="mt-1 whitespace-pre-wrap break-words">{error}</div>
        </div>
      </main>
    );
  }
  if (!profile) return <div className="p-8">Loading industry...</div>;
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">{profile.industry_title}</h1>
      <p className="mt-2 max-w-3xl text-slate-600">Top counties for this NAICS industry by employment and concentration. Latest loaded QCEW period: 2024 Annual.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-slate-200 p-4"><div className="text-sm text-slate-500">National employment</div><div className="text-2xl font-semibold">{profile.national_employment.toLocaleString()}</div></div>
        <div className="rounded-md border border-slate-200 p-4"><div className="text-sm text-slate-500">Average weekly wage</div><div className="text-2xl font-semibold">${profile.avg_weekly_wage.toLocaleString()}</div></div>
        <div className="rounded-md border border-slate-200 p-4"><div className="text-sm text-slate-500">Counties</div><div className="text-2xl font-semibold">{profile.top_by_employment.length}</div></div>
      </div>
      <h2 className="mt-8 text-xl font-semibold">Top counties by employment</h2>
      <div className="mt-4"><IndustryTable rows={profile.top_by_employment} /></div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-accent">
        {profile.top_by_employment.slice(0, 8).map((county: any) => (
          <a key={county.fips} href={countyUrl(county)}>{county.county_name}, {county.state_abbr}</a>
        ))}
        <a href="/rankings/top-industry-concentration">Industry concentration rankings</a>
        <a href="/guides/what-are-naics-codes">What are NAICS codes?</a>
      </div>
    </main>
  );
}
