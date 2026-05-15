import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api/client";
import CountyProfile, { CountyProfileData } from "../components/CountyProfile";
import { slugify, updateSeo } from "../lib/seo";

export default function CountyPage() {
  const fips = useMemo(() => window.location.pathname.match(/-(\d{5})$/)?.[1] ?? "", []);
  const [profile, setProfile] = useState<CountyProfileData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!fips) return;
    apiGet<CountyProfileData>(`/api/counties/${fips}`)
      .then((data) => {
        setProfile(data);
        const countyPath = `/county/${data.county.state_abbr.toLowerCase()}/${slugify(data.county.county_name)}-${data.county.fips}`;
        updateSeo({
          title: `${data.county.county_name}, ${data.county.state_abbr} Economy: Jobs, Wages, GDP, Industries & Rankings`,
          description: `Explore ${data.county.county_name}, ${data.county.state_name} economic data including jobs, unemployment, wages, GDP, NAICS industries, location quotients, rankings, and trends.`,
          path: countyPath,
          jsonLd: [
            {
              "@context": "https://schema.org",
              "@type": "Dataset",
              name: `${data.county.county_name}, ${data.county.state_abbr} Economy`,
              description: data.summary,
              spatialCoverage: `${data.county.county_name}, ${data.county.state_name}`,
              temporalCoverage: `${data.data_vintage.acs ?? "2014"}/${data.data_vintage.laus ?? "latest"}`,
              publisher: { "@type": "Organization", name: "LocalEconomyData", url: "https://localeconomydata.com/" },
              variableMeasured: ["unemployment rate", "employment", "wages", "GDP", "population", "location quotient"]
            },
            {
              "@context": "https://schema.org",
              "@type": "Place",
              name: `${data.county.county_name}, ${data.county.state_abbr}`,
              geo: { "@type": "GeoCoordinates", latitude: data.county.lat, longitude: data.county.lon }
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://localeconomydata.com/" },
                { "@type": "ListItem", position: 2, name: data.county.state_name, item: `https://localeconomydata.com/state/${slugify(data.county.state_name)}` },
                { "@type": "ListItem", position: 3, name: data.county.county_name, item: `https://localeconomydata.com${countyPath}` }
              ]
            }
          ]
        });
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
