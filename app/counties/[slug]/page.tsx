import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CountyCard from "@/components/CountyCard";
import CountyIndustryExplorer from "@/components/CountyIndustryExplorer";
import CountyInStateMap from "@/components/CountyInStateMap";
import DataStatusBanner from "@/components/DataStatusBanner";
import MetricCard from "@/components/MetricCard";
import ScoreBadge from "@/components/ScoreBadge";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import SourceNote from "@/components/SourceNote";
import StrengthWeaknessPanel from "@/components/StrengthWeaknessPanel";
import { counties } from "@/data/counties";
import { industries } from "@/data/industries";
import { generateCountyFAQ } from "@/lib/content/countyNarratives";
import { calculateCountyScore, getBestIndustries, getCountyBySlug, getCountyScoreBreakdown, getScoreLabel } from "@/lib/scoring";
import { breadcrumbsJsonLd, datasetJsonLd, faqJsonLd, metadata } from "@/lib/seo";
import { formatMillions, formatMoney, formatNumber, formatPercent } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return counties.map((county) => ({ slug: county.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const county = getCountyBySlug(slug);
  if (!county) return {};
  const stateAbbr = county.stateAbbr ?? getStateAbbr(county.state);
  return metadata({
    title: `Is ${county.name}, ${stateAbbr} a Good Place to Expand a Business? Workforce, Cost, and Industry Score`,
    description: `Compare ${county.name}, ${county.state} for business expansion using workforce, education, cost, industry-fit, and market access indicators from LocalEconomyData.`,
    path: `/counties/${county.slug}`,
    type: "article"
  });
}

export default async function CountyPage({ params }: Props) {
  const { slug } = await params;
  const county = getCountyBySlug(slug);
  if (!county) notFound();
  const score = calculateCountyScore(county);
  const bestIndustries = getBestIndustries(county, 5);
  const bestIndustry = bestIndustries[0][0];
  const industryName = (key: string) => industries.find((item) => item.key === key)?.name ?? key.replace(/_/g, " ");
  const nearby = county.nearby.map(getCountyBySlug).filter(Boolean);
  const stateAbbr = getStateAbbr(county.state);
  const latestLine = [
    county.dataVintage?.blsLausPeriod ? `BLS LAUS ${county.dataVintage.blsLausPeriod}` : undefined,
    county.dataVintage?.beaGdpYear ? `BEA GDP ${county.dataVintage.beaGdpYear}` : undefined,
    county.dataVintage?.beaIncomeYear ? `BEA income ${county.dataVintage.beaIncomeYear}` : undefined
  ].filter(Boolean).join(" · ");
  const breakdown = getCountyScoreBreakdown(county);
  const strongest = [...breakdown].sort((a, b) => b.score - a.score)[0];
  const weakest = [...breakdown].sort((a, b) => a.score - b.score)[0];
  const faqItems = generateCountyFAQ(county);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        breadcrumbsJsonLd([{ name: "Home", path: "/" }, { name: "Counties", path: "/counties" }, { name: county.name, path: `/counties/${county.slug}` }]),
        datasetJsonLd(`${county.name} expansion profile`, county.summary, `/counties/${county.slug}`),
        faqJsonLd(faqItems)
      ]) }} />
      <DataStatusBanner county={county} />
      <div className="mt-5"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Counties", href: "/counties" }, { label: county.name }]} /></div>
      <section className="mt-6 overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-800 p-6 text-white shadow-2xl shadow-blue-950/20">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">{county.state} / {county.region}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">{county.name}, {stateAbbr} Economy</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-50">{county.summary}</p>
            {latestLine && <p className="mt-4 text-sm font-semibold text-cyan-100">Latest available public data: {latestLine}</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              {bestIndustries.slice(0, 3).map(([key]) => <a key={key} href={`/industries/${industries.find((item) => item.key === key)?.slug}`} className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/20">Best for {industryName(key)}</a>)}
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {county.strengths.slice(0, 3).map((item) => <span key={item} className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-sm font-semibold text-emerald-50 ring-1 ring-emerald-200/20">{item}</span>)}
              {county.risks.slice(0, 2).map((item) => <span key={item} className="rounded-2xl bg-amber-300/15 px-3 py-2 text-sm font-semibold text-amber-50 ring-1 ring-amber-200/20">Watch: {item}</span>)}
            </div>
          </div>
          <div className="grid gap-4">
            <CountyInStateMap county={county} />
            <div className="rounded-3xl bg-white p-5 text-ink shadow-xl">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Expansion score</div>
              <div className="mt-2 flex items-end gap-3">
                <div className="text-6xl font-semibold">{score}</div>
                <ScoreBadge score={score} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-600">{getScoreLabel(score)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-ink">Quick verdict</h2>
        <p className="mt-3 leading-8 text-slate-700">{county.name} is best for companies that can use {county.topIndustries.slice(0, 3).join(", ").toLowerCase()} strengths while managing {county.risks.slice(0, 2).join(" and ").toLowerCase()}. Its score is driven most by {strongest.label.toLowerCase()}, while the main drag is {weakest.label.toLowerCase()}. For a business expansion search, this makes {county.name} a strong candidate for early screening, but not a substitute for site visits, labor-market validation, utility checks, incentive review, and real estate diligence.</p>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-ink">Why this county scores this way</h2>
          <p className="mt-3 leading-7 text-slate-600">{county.name}'s score is driven most by {strongest.label.toLowerCase()} and its strongest industries, especially {bestIndustries.slice(0, 3).map(([key]) => industryName(key)).join(", ")}. Its weakest component is {weakest.label.toLowerCase()}, which is why the score should be read as a tradeoff map rather than a yes-or-no answer.</p>
          <div className="mt-5"><ScoreBreakdown county={county} /></div>
        </div>
        <StrengthWeaknessPanel county={county} />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Population" value={formatNumber(county.population)} />
        <MetricCard label="Labor force" value={formatNumber(county.laborForce)} note={county.dataVintage?.blsLausPeriod ? `Source: BLS LAUS · ${county.dataVintage.blsLausPeriod}` : "Source: structured screening dataset"} />
        <MetricCard label="Unemployment rate" value={formatPercent(county.unemploymentRate)} note={county.dataVintage?.blsLausPeriod ? `Source: BLS LAUS · ${county.dataVintage.blsLausPeriod}` : "Source: structured screening dataset"} />
        {county.gdpMillions && <MetricCard label="GDP" value={formatMillions(county.gdpMillions)} note={`Source: BEA Regional · ${county.dataVintage?.beaGdpYear}`} />}
        {county.personalIncomeMillions && <MetricCard label="Personal income" value={formatMillions(county.personalIncomeMillions)} note={`Source: BEA Regional · ${county.dataVintage?.beaIncomeYear}`} />}
        {county.perCapitaPersonalIncome && <MetricCard label="Per-capita personal income" value={formatMoney(county.perCapitaPersonalIncome)} note={`Source: BEA Regional · ${county.dataVintage?.beaIncomeYear}`} />}
        <MetricCard label="Median household income" value={formatMoney(county.medianHouseholdIncome)} />
        <MetricCard label="Bachelor's degree or higher" value={formatPercent(county.bachelorsOrHigher)} />
        <MetricCard label="Vacancy proxy" value={county.vacancyProxy ? formatPercent(county.vacancyProxy) : "Not available"} />
        <MetricCard label="Market access score" value={`${county.marketAccessScore}/100`} />
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-ink">Explore this county by industry</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">Scroll through every tracked industry to see where {county.name} is strongest, where fit is moderate, and which national industry pages connect to the county profile.</p>
        <div className="mt-5"><CountyIndustryExplorer county={county} /></div>
      </section>

      <article className="prose-lite mt-8">
        <div className="space-y-8">
          <Section title="Executive Summary">
            <p>{county.name} receives an expansion score of {score}, which makes it a {score >= 70 ? "competitive" : "selective"} market in this DC-region screening model. The county has a population of {formatNumber(county.population)}, a BLS LAUS labor force of about {formatNumber(county.laborForce)}, an unemployment rate of {formatPercent(county.unemploymentRate)}{county.gdpMillions ? `, and BEA county GDP of about ${formatMillions(county.gdpMillions)}` : ""}. Those indicators help show both the size and quality of the available market, but they should be interpreted with caution because county-level averages can hide major differences by neighborhood, commute shed, occupation, facility type, and real estate submarket.</p>
            <p>For a business expansion decision, the key question is not simply whether {county.name} is strong or weak. The better question is what kind of expansion it supports. A headquarters, lab, professional-services office, logistics facility, clinical operation, contractor office, or manufacturing site can all require different labor pools, real estate, permitting conditions, utility capacity, and customer access. This profile treats the county as an early screening candidate and highlights the most important tradeoffs before a company moves into detailed site selection.</p>
            <p>The strongest industry signals for {county.name} are {county.topIndustries.join(", ")}. The best-fit scoring model also identifies {bestIndustries.map(([key]) => industryName(key)).join(", ")} as important opportunities. These scores are not a promise of success. They are a way to organize questions: whether the county has enough talent depth, whether wage levels fit the operating model, whether customers and partners are reachable, whether real estate supply matches the company footprint, and whether the risks are manageable.</p>
          </Section>

          <Section title="Labor Market Analysis">
            <p>{county.laborAnalysis}</p>
            <p>From a workforce-planning standpoint, the county's {formatNumber(county.laborForce)}-person labor force and {formatPercent(county.unemploymentRate)} unemployment rate should be read together. A low unemployment rate may signal economic strength, but it can also mean tighter hiring conditions. A higher rate can signal available labor, but not always the specific occupations a business needs. Employers should verify occupation-level availability, commute tolerance, training pipelines, and salary expectations before treating the county as a final hiring market.</p>
          </Section>

          <Section title="Cost and Real Estate Conditions">
            <p>{county.costAnalysis}</p>
            <p>The county's median household income estimate of {formatMoney(county.medianHouseholdIncome)}{county.perCapitaPersonalIncome ? ` and BEA per-capita personal income of ${formatMoney(county.perCapitaPersonalIncome)}` : ""} provide a directional view of income and cost pressure. For site selection, those numbers should be supplemented with commercial rent, building availability, parking, utilities, tax exposure, insurance, tenant improvement costs, transportation costs, and any incentives. A county can be expensive and still be the right choice if it improves revenue, talent access, customer proximity, or speed to market.</p>
          </Section>

          <Section title="Industry Strengths">
            <p>{county.industryAnalysis}</p>
            <p>Companies should compare the county's industry strengths with their own operating model. For example, a life-sciences company may need wet-lab space, proximity to researchers, specialized suppliers, and regulatory talent. A federal contractor may prioritize security-cleared workers, customer access, teaming partners, and proposal talent. A logistics operator may care more about highway access, shift labor, truck circulation, and site costs. The same county can be excellent for one use case and mediocre for another.</p>
          </Section>

          <Section title="Risks and Constraints">
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
              {county.risks.map((risk) => <li key={risk}>{risk}</li>)}
            </ul>
            <p>Risks do not disqualify a county. They identify the issues a company should investigate before committing to a lease, purchase, hiring plan, or public announcement. For {county.name}, the most important diligence questions include whether the required workforce is available at the expected wage, whether the preferred sites can support the use, whether public approvals are predictable, and whether the county's advantages outweigh its cost and execution constraints.</p>
          </Section>

          <Section title="Nearby County Comparisons">
            <p>Expansion decisions in the DC region are rarely limited to one jurisdiction. Companies should compare {county.name} with nearby counties because labor sheds, customer access, commuting patterns, and real estate supply cross jurisdictional lines.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {nearby.map((item) => item && <CountyCard key={item.slug} county={item} />)}
            </div>
          </Section>

          <Section title="FAQ">
            <div className="grid gap-4">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-ink">{item.question}</h3>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          </Section>

          <SourceNote />
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function getStateAbbr(state: string) {
  return state === "Maryland" ? "MD" : state === "Virginia" ? "VA" : state === "District of Columbia" ? "DC" : state;
}
