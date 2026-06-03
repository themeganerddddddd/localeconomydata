import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CountyCard from "@/components/CountyCard";
import IndustryRankTable from "@/components/IndustryRankTable";
import { industries } from "@/data/industries";
import { calculateCountyScore } from "@/lib/scoring";
import { breadcrumbsJsonLd, faqJsonLd, metadata } from "@/lib/seo";
import { countiesForRegion, regionSlug, regionTitle, regions } from "@/lib/regions";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return regions().map((region) => ({ slug: regionSlug(region) }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const region = regionTitle(slug);
  return metadata({
    title: `${region} Economy: County Business Expansion Rankings`,
    description: `Compare ${region} counties for business expansion using workforce, cost, market access, industry fit, and public data indicators.`,
    path: `/regions/${slug}`,
    type: "article"
  });
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params;
  const region = regionTitle(slug);
  const rows = countiesForRegion(slug).sort((a, b) => calculateCountyScore(b) - calculateCountyScore(a));
  if (rows.length < 1) notFound();
  const faqItems = [
    { question: `What are the best counties in ${region} for business expansion?`, answer: `${rows.slice(0, 5).map((county) => `${county.name}, ${county.state}`).join("; ")} rank highly in this regional screening set.` },
    { question: `How should companies compare counties in ${region}?`, answer: "Compare workforce depth, education, labor availability, industry fit, cost pressure, market access, facility needs, and local execution risks." }
  ];
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        breadcrumbsJsonLd([{ name: "Home", path: "/" }, { name: "Regions", path: "/regions" }, { name: region, path: `/regions/${slug}` }]),
        faqJsonLd(faqItems)
      ]) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Regions", href: "/regions" }, { label: region }]} />
      <section className="mt-6 rounded-[2rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-6 shadow-sm">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">{region} Economy</h1>
        <p className="mt-4 max-w-4xl leading-8 text-slate-700">{region} includes {rows.length} completed county profiles in LocalEconomyData. This region page compares county expansion markets by workforce scale, education, cost signals, industry fit, and market access. The goal is not to pick one universal winner, but to help businesses identify which counties deserve deeper diligence based on the operating model.</p>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-ink">Top counties by expansion score</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{rows.slice(0, 6).map((county) => <CountyCard key={county.slug} county={county} />)}</div>
      </section>
      <section className="prose-lite mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-ink">Cost and talent tradeoff</h2>
        <p>Counties in {region} differ in both talent depth and cost pressure. Higher-scoring counties often combine larger labor pools, stronger education levels, and better market access, but those same advantages can increase wage and real estate pressure. Lower-cost counties can be better for logistics, operations, manufacturing, and back-office expansion if they still meet workforce and site requirements.</p>
        <p>Companies should use the regional ranking to build a short list, then compare occupation-level labor availability, commercial real estate, transportation, utilities, tax exposure, incentives, and permitting conditions. The best county for a software headquarters may not be the best county for a distribution center, lab, clinic network, contractor office, or manufacturing operation.</p>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-ink">Best counties by industry</h2>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">{industries.slice(0, 4).map((industry) => <div key={industry.slug}><h3 className="mb-3 font-semibold text-ink">{industry.name}</h3><IndustryRankTable industry={industry.key as any} /></div>)}</div>
      </section>
      <section className="prose-lite mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-ink">FAQ</h2>
        {faqItems.map((item) => <div key={item.question}><h3 className="mt-4 font-semibold text-ink">{item.question}</h3><p>{item.answer}</p></div>)}
      </section>
    </main>
  );
}
