import CountyCard from "@/components/CountyCard";
import DataStatusBanner from "@/components/DataStatusBanner";
import MetricCard from "@/components/MetricCard";
import { counties } from "@/data/counties";
import { industries } from "@/data/industries";
import { rankCountiesByIndustry } from "@/lib/scoring";
import { metadata, websiteJsonLd } from "@/lib/seo";

export const generateMetadata = () => metadata({
  title: "LocalEconomyData | Compare Counties for Business Expansion",
  description: "Compare U.S. counties for business expansion using workforce, labor-market, industry-fit, cost, income, GDP, and market-access indicators.",
  path: "/"
});

export default function HomePage() {
  const scoreWeights = [
    ["Talent depth", 25],
    ["Education", 15],
    ["Labor availability", 15],
    ["Industry fit", 20],
    ["Cost", 15],
    ["Market access", 10]
  ] as const;
  const previewCounty = counties[0];
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      <section className="overflow-hidden border-b border-blue-100 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-800">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 text-white lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">County-level business expansion intelligence</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Find the Best County for Business Expansion</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-50">Compare workforce depth, labor availability, industry fit, cost conditions, income, GDP, and market access across county economies in major U.S. regions.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-950 shadow-lg" href="/compare">Compare Counties</a>
              <a className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white" href="/counties">Explore County Scores</a>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="grid gap-3">
              <MetricCard label="Counties covered" value={String(counties.length)} note="Curated U.S. county screening set." />
              <MetricCard label="Industries scored" value={String(industries.length)} note="Industry-fit scoring for expansion screening." />
              <MetricCard label="Methodology" value="Open" note="Transparent scoring weights and caveats." />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <DataStatusBanner />
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Featured counties</h2>
            <p className="mt-2 text-slate-600">Start with high-opportunity counties across the DC region.</p>
          </div>
          <a className="hidden text-sm font-semibold text-accent sm:block" href="/counties">All counties</a>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {counties.slice(0, 6).map((county) => <CountyCard key={county.slug} county={county} />)}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-2xl font-semibold text-ink">Industry score previews</h2>
          <p className="mt-2 text-slate-600">Quick snapshots of counties that rise to the top for different expansion use cases.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {industries.slice(0, 4).map((industry) => {
              const top = rankCountiesByIndustry(industry.key)[0];
              return (
                <a key={industry.slug} href={`/industries/${industry.slug}`} className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm hover:border-blue-300">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">Top counties for</p>
                  <h3 className="mt-2 text-lg font-semibold text-ink">{industry.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Current leader: <strong>{top.name}, {top.state}</strong></p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-ink">How the score works</h2>
          <p className="mt-3 leading-7 text-slate-600">The score combines talent depth, education level, labor availability, industry fit, cost competitiveness, and growth or market access. Here is the same weighted breakdown used on county pages.</p>
          <div className="mt-6 grid gap-3">
            {scoreWeights.map(([label, weight]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-ink">{label}</span>
                  <span className="text-sm font-semibold text-accent">{weight}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-400" style={{ width: `${weight * 4}%` }} />
                </div>
              </div>
            ))}
          </div>
          <a className="mt-5 inline-flex text-sm font-semibold text-accent" href="/methodology">Read the full methodology</a>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-ink">Strengths vs. watch-outs</h2>
          <p className="mt-3 leading-7 text-slate-600">Every county profile is designed to show tradeoffs quickly, not just a score.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Strengths</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {previewCounty.strengths.slice(0, 3).map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Watch-outs</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {previewCounty.risks.slice(0, 3).map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
          </div>
          <a className="mt-5 inline-flex text-sm font-semibold text-accent" href={`/counties/${previewCounty.slug}`}>See a full county profile</a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <h2 className="text-2xl font-semibold text-ink">Featured guides</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            ["Best Counties for Business Expansion in the DC Region", "/guides/best-counties-for-business-expansion-dc-region"],
            ["Montgomery County vs Fairfax County", "/guides/montgomery-vs-fairfax-business-expansion"],
            ["Best Counties for Life Sciences in the DC Region", "/guides/best-counties-for-life-sciences-dc-region"],
            ["Best Counties for Business Expansion on the East Coast", "/guides/best-counties-for-business-expansion-east-coast"]
          ].map(([title, href]) => <a key={href} className="rounded-3xl border border-slate-200 bg-white p-5 font-semibold text-ink shadow-sm hover:border-blue-300" href={href}>{title}</a>)}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-2xl font-semibold text-ink">FAQ</h2>
          <p className="mt-2 max-w-3xl text-slate-600">Common questions about using LocalEconomyData for county screening, industry comparison, and early site-selection research.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["What is LocalEconomyData?", "LocalEconomyData is a county-level economic intelligence tool for comparing workforce depth, labor availability, industry fit, cost conditions, GDP and income signals, and market access across U.S. counties."],
              ["Who is the site built for?", "It is built for economic developers, founders, site selectors, researchers, journalists, investors, consultants, and civic leaders who need a fast way to compare local economies."],
              ["What data does the site use?", "The app combines public datasets and generated screening logic, including BLS LAUS labor-market data, BEA regional income and GDP data, Census ACS indicators when configured, public county/state boundary files, and LocalEconomyData scoring methods."],
              ["How should I use the county scores?", "Use the scores as an early screening layer. A high score should lead to deeper due diligence on labor, real estate, utilities, incentives, permitting, customer access, and local operating risks."],
              ["Can I compare industries by county?", "Yes. County and industry pages show industry-fit scores for sectors such as life sciences, software and AI, logistics, advanced manufacturing, healthcare, professional services, finance, education, and energy infrastructure."],
              ["Are the pages investment advice?", "No. LocalEconomyData is informational and educational. Users should verify all public data with original sources and consult qualified advisors before making business, legal, financial, or real estate decisions."]
            ].map(([question, answer]) => (
              <div key={question} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-ink">{question}</h3>
                <p className="mt-2 leading-7 text-slate-600">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
