import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CountyShape from "@/components/CountyShape";
import DataStatusBanner from "@/components/DataStatusBanner";
import IndustryRankTable from "@/components/IndustryRankTable";
import SourceNote from "@/components/SourceNote";
import StrengthWeaknessPanel from "@/components/StrengthWeaknessPanel";
import { IndustryKey } from "@/data/counties";
import { industries } from "@/data/industries";
import { calculateIndustryScore, rankCountiesByIndustry } from "@/lib/scoring";
import { articleJsonLd, breadcrumbsJsonLd, faqJsonLd, metadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const industry = industries.find((item) => item.slug === slug);
  if (!industry) return {};
  return metadata({
    title: `Best Counties for ${industry.name} Expansion | LocalEconomyData`,
    description: `Compare DC-region counties for ${industry.name} expansion using workforce, cost, market access, risk, and industry-fit scoring.`,
    path: `/industries/${industry.slug}`,
    type: "article"
  });
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const industry = industries.find((item) => item.slug === slug);
  if (!industry) notFound();
  const key = industry.key as IndustryKey;
  const ranked = rankCountiesByIndustry(key);
  const topFive = ranked.slice(0, 5);
  const bestOverall = ranked[0];
  const bestLowerCost = [...ranked].sort((a, b) => a.medianWageEstimate - b.medianWageEstimate)[0];
  const bestHighTalent = [...ranked].sort((a, b) => b.bachelorsOrHigher - a.bachelorsOrHigher)[0];
  const bestEmerging = [...ranked].filter((county) => county.marketAccessScore >= 75 && county.medianWageEstimate < 65000)[0] ?? bestLowerCost;
  const faqItems = [
    { question: `What counties are best for ${industry.name} expansion?`, answer: `${topFive.map((county) => `${county.name}, ${county.state}`).join("; ")} currently rank highest for ${industry.name} in this screening model.` },
    { question: `What factors matter most for ${industry.name} site selection?`, answer: `Companies should compare workforce depth, specialized talent, wage pressure, facility availability, customer access, infrastructure, and execution risks for ${industry.name} expansion.` },
    { question: "How should companies use this score?", answer: "Use the score to build an early short list, then verify occupation-level labor data, real estate, utilities, incentives, permitting, and local operating risks before making a decision." }
  ];
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        breadcrumbsJsonLd([{ name: "Home", path: "/" }, { name: "Industries", path: "/industries" }, { name: industry.name, path: `/industries/${industry.slug}` }]),
        articleJsonLd(`Best Counties for ${industry.name} Expansion`, industry.description, `/industries/${industry.slug}`),
        faqJsonLd(faqItems)
      ]) }} />
      <DataStatusBanner />
      <div className="mt-5"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Industries", href: "/industries" }, { label: industry.name }]} /></div>
      <section className="mt-6 rounded-[2rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Industry expansion guide</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Best Counties for {industry.name} Expansion</h1>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600">{industry.description}</p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["Best county overall", bestOverall],
          ["Best lower-cost option", bestLowerCost],
          ["Best high-talent option", bestHighTalent],
          ["Best emerging option", bestEmerging]
        ].map(([label, county]) => county && (
          <a key={`${label}`} href={`/counties/${(county as any).slug}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300">
            <CountyShape county={county as any} />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-accent">{label as string}</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">{(county as any).name}</h2>
            <p className="mt-2 text-sm text-slate-600">{calculateIndustryScore(county as any, key)} industry score</p>
          </a>
        ))}
      </section>

      <article className="prose-lite mt-8 space-y-8">
        <Section title="Industry overview">
          <p>{industry.name} expansion decisions depend on more than one headline metric. A company needs to know whether a county has the right workforce, customer access, supplier base, real estate conditions, wage structure, and public-sector environment. LocalEconomyData scores counties for this industry using a structured industry-fit value, but the score is best understood as a screening tool that helps users decide where to investigate first.</p>
          <p>In the DC, Maryland, and Virginia region, county choice can change the economics and risk profile of the same company. A close-in county may offer better client access and executive talent but higher wages and real estate costs. An outer county may offer more space and cost flexibility but require a stronger recruiting and commute strategy. This guide explains which counties rank well, why they rank well, and what tradeoffs businesses should validate before choosing a location.</p>
        </Section>

        <Section title={`What matters for ${industry.name}`}>
          <p>For {industry.name}, the most important questions are whether the county can support specialized hiring, whether the cost structure fits the business model, whether customers or partners are reachable, and whether the county's existing industry base creates practical advantages. A score can highlight likely fit, but a company should still confirm occupation-level labor data, facility availability, permitting timelines, infrastructure capacity, and incentives.</p>
          <p>Companies should also look at resilience. Counties with only one advantage can be fragile if costs rise or a single customer relationship changes. Stronger expansion markets tend to combine several advantages: workforce depth, education, related employers, transportation access, and a credible path to scaling over time.</p>
        </Section>

        <Section title="Ranked county table">
          <IndustryRankTable industry={key} />
        </Section>

        <Section title="Top five counties">
          {topFive.map((county, index) => (
            <div key={county.slug} className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-lg font-semibold text-ink">#{index + 1}: <a className="text-accent" href={`/counties/${county.slug}`}>{county.name}, {county.state}</a></h3>
              <p>{county.name} scores {calculateIndustryScore(county, key)} for {industry.name}. Its main advantages include {county.strengths.slice(0, 3).join(", ").toLowerCase()}. The county's top industries include {county.topIndustries.join(", ")}, which helps explain why it appears near the top of this screening model.</p>
              <p>For companies evaluating {county.name}, the key tradeoff is whether its advantages justify its constraints: {county.risks.slice(0, 2).join(" and ").toLowerCase()}. A company should compare the county with nearby alternatives before treating the ranking as a final recommendation.</p>
            </div>
          ))}
        </Section>

        <Section title="Industry strengths and watch-outs">
          <p>{industry.name} expansions need a county that fits the operating model, not just a high overall score. The current leading county is {bestOverall.name}, but lower-cost, high-talent, and emerging options may be better depending on the company.</p>
          <div className="mt-5"><StrengthWeaknessPanel county={bestOverall} /></div>
        </Section>

        <Section title="Cost and talent tradeoff">
          <p>The strongest county for {industry.name} is not always the cheapest county. In many cases, higher-cost counties rank well because they offer specialized workers, executive talent, customer access, or an existing ecosystem that reduces go-to-market risk. Lower-cost counties can still be the better choice when a company needs more space, larger teams, simpler operations, or room to grow without paying inner-core premiums.</p>
          <p>Decision-makers should separate strategic fit from operating cost. A company serving federal customers may accept a premium for proximity and credibility. A logistics company may prioritize land, road access, and labor availability. A life-sciences firm may need lab infrastructure and scientific talent. A software company may value hybrid-work recruiting reach more than a single office location. The best county depends on the business model.</p>
        </Section>

        <Section title="Risks to consider">
          <p>Risks include public data lag, county-wide averages that hide submarket variation, incomplete real estate information, and the limits of any screening model. Before making decisions, companies should verify source data, review current commercial real estate listings, speak with local economic development teams, examine utility and permitting conditions, and test whether the desired workforce can be hired at the target wage.</p>
          <p>Use this guide as a starting point. It is designed to help users ask better questions, not to replace professional site-selection, legal, financial, real estate, or incentive advice.</p>
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
