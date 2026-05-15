import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api/client";
import CountyProfile, { CountyProfileData } from "../components/CountyProfile";

export default function CountyPage() {
  const fips = useMemo(() => window.location.pathname.match(/-(\d{5})$/)?.[1] ?? "", []);
  const [profile, setProfile] = useState<CountyProfileData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!fips) return;
    apiGet<CountyProfileData>(`/api/counties/${fips}`)
      .then((data) => {
        setProfile(data);
        document.title = `${data.county.county_name}, ${data.county.state_abbr} Economy: Jobs, Wages, GDP, Industries & Rankings`;
        document.querySelector("meta[name='description']")?.setAttribute("content", `Explore ${data.county.county_name}, ${data.county.state_name} economic data including jobs, unemployment, wages, GDP, NAICS industries, location quotients, rankings, and trends.`);
      })
      .catch((err) => setError(err.message));
  }, [fips]);

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="font-semibold">Could not load county profile.</div>
          <div className="mt-1 whitespace-pre-wrap break-words">{error}</div>
        </div>
      </main>
    );
  }
  if (!profile) return <div className="p-8 text-slate-600">Loading county profile...</div>;
  return <CountyProfile profile={profile} />;
}
