import CountyCard from "@/components/CountyCard";
import { metadata } from "@/lib/seo";
import { countiesForRegion, regionSlug, regions } from "@/lib/regions";

export const generateMetadata = () => metadata({
  title: "Regional County Economy Rankings",
  description: "Explore LocalEconomyData regional pages for county business expansion, workforce, cost, industry fit, and market access.",
  path: "/regions"
});

export default function RegionsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-tight text-ink">Regions</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">Browse curated regional groups of county economies. Each region page links county profiles, industry rankings, and cost/talent tradeoffs.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {regions().map((region) => {
          const sample = countiesForRegion(regionSlug(region)).slice(0, 2);
          return (
            <section key={region} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-ink"><a className="text-accent" href={`/regions/${regionSlug(region)}`}>{region}</a></h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{countiesForRegion(regionSlug(region)).length} completed county profiles.</p>
              <div className="mt-4 grid gap-3">{sample.map((county) => <CountyCard key={county.slug} county={county} />)}</div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
