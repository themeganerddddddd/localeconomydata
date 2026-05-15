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

  if (error) return <div className="p-8 text-red-700">{error}</div>;
  if (!profile) return <div className="p-8 text-slate-600">Loading county profile...</div>;
  return <CountyProfile profile={profile} />;
}
