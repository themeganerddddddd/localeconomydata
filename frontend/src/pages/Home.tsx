import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiGet, County, countyUrl } from "../api/client";
import CountyMap from "../components/CountyMap";
import { updateSeo } from "../lib/seo";

export default function Home() {
  const [counties, setCounties] = useState<County[]>([]);
  const [selected, setSelected] = useState<County | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    updateSeo({
      title: "LocalEconomyData: U.S. County Jobs, Wages, GDP, Industries & Rankings",
      description: "Explore local economic data for every U.S. county, including jobs, unemployment, wages, GDP, NAICS industries, location quotients, rankings, trends, and CSV downloads.",
      path: "/",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "LocalEconomyData",
          url: "https://localeconomydata.com/",
          description: "County economic data, rankings, industries, and downloadable local economy indicators."
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "LocalEconomyData",
          url: "https://localeconomydata.com/",
          logo: "https://localeconomydata.com/logo.png"
        }
      ]
    });
    apiGet<County[]>("/api/counties").then((rows) => {
      setCounties(rows);
      setSelected(rows[0] ?? null);
      setError("");
    }).catch((err) => setError(err.message));
  }, []);

  const matches = useMemo(() => {
    if (!query) return [];
    return counties.filter((county) => `${county.county_name} ${county.state_abbr} ${county.state_name}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  }, [counties, query]);

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Local economic data for every U.S. county.</h1>
            <p className="mt-4 text-lg text-slate-600">Explore jobs, wages, unemployment, industry concentration, rankings, trends, and downloadable county data from public sources.</p>
          </div>
          <div className="relative mt-8 max-w-2xl">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input className="w-full rounded-md border border-slate-300 py-3 pl-10 pr-3 text-base" placeholder="Search county or state" value={query} onChange={(event) => setQuery(event.target.value)} />
            {matches.length > 0 && (
              <div className="absolute z-10 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                {matches.map((county) => (
                  <a key={county.fips} className="block px-4 py-3 hover:bg-slate-50" href={countyUrl(county)}>
                    {county.county_name}, {county.state_abbr}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <div className="font-semibold">Could not load county data.</div>
            <div className="mt-1 whitespace-pre-wrap break-words">{error}</div>
          </div>
        )}
        <CountyMap counties={counties} selected={selected} onSelect={setSelected} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold">Featured rankings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Fastest employment growth", "/rankings/fastest-growing-counties"],
            ["Highest wages", "/rankings/highest-wage-counties"],
            ["Lowest unemployment", "/rankings/lowest-unemployment-counties"],
            ["Strongest industry concentration", "/rankings/top-biotech-counties"]
          ].map(([label, href]) => (
            <a key={href} href={href} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm hover:border-accent">
              <div className="text-sm font-semibold text-slate-500">Ranking</div>
              <div className="mt-2 text-lg font-semibold">{label}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Frequently Asked Questions</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {[
              ["What does LocalEconomyData show?", "LocalEconomyData organizes county-level jobs, wages, unemployment, GDP, population, NAICS industry detail, location quotients, rankings, trends, and CSV downloads in one place."],
              ["Where does the data come from?", "The platform is structured around public sources including BLS QCEW, BLS LAUS, Census ACS 5-Year, BEA Regional Accounts, and Census county geography."],
              ["What is a location quotient?", "A location quotient compares a county's employment concentration in an industry with the national average. Values above 1.0 mean the industry is more concentrated locally."],
              ["How should I use county rankings?", "Rankings help compare counties across common metrics such as wage levels, unemployment, employment growth, and industry concentration. Missing values are excluded from ranking calculations."],
              ["Can I download the data?", "Yes. The download panel supports researcher-friendly CSV exports with county, NAICS, rank, source, and period fields."],
              ["Why do data periods differ?", "Public economic datasets are released on different schedules. County pages show the latest loaded periods for BLS LAUS, BLS QCEW, Census ACS, and BEA data."]
            ].map(([question, answer]) => (
              <details key={question} className="rounded-lg border border-slate-200 bg-white p-5">
                <summary className="cursor-pointer text-base font-semibold text-ink">{question}</summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-accent">
            <a href="/guides/what-is-location-quotient">What is location quotient?</a>
            <a href="/guides/what-are-naics-codes">What are NAICS codes?</a>
            <a href="/methodology">Methodology</a>
            <a href="/data-sources">Data Sources</a>
          </div>
        </div>
      </section>

    </main>
  );
}
