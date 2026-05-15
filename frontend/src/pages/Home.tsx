import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiGet, County, countyUrl } from "../api/client";
import CountyMap from "../components/CountyMap";

export default function Home() {
  const [counties, setCounties] = useState<County[]>([]);
  const [selected, setSelected] = useState<County | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    apiGet<County[]>("/api/counties").then((rows) => {
      setCounties(rows);
      setSelected(rows[0] ?? null);
    });
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

    </main>
  );
}
