import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api/client";
import IndustryTable from "../components/IndustryTable";

export default function IndustryPage() {
  const code = useMemo(() => window.location.pathname.split("/")[2] ?? "541", []);
  const [profile, setProfile] = useState<any | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    apiGet(`/api/industries/${code}`)
      .then((data) => {
        setProfile(data);
        setError("");
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
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-slate-200 p-4"><div className="text-sm text-slate-500">National employment</div><div className="text-2xl font-semibold">{profile.national_employment.toLocaleString()}</div></div>
        <div className="rounded-md border border-slate-200 p-4"><div className="text-sm text-slate-500">Average weekly wage</div><div className="text-2xl font-semibold">${profile.avg_weekly_wage.toLocaleString()}</div></div>
        <div className="rounded-md border border-slate-200 p-4"><div className="text-sm text-slate-500">Counties</div><div className="text-2xl font-semibold">{profile.top_by_employment.length}</div></div>
      </div>
      <h2 className="mt-8 text-xl font-semibold">Top counties by employment</h2>
      <div className="mt-4"><IndustryTable rows={profile.top_by_employment} /></div>
    </main>
  );
}
