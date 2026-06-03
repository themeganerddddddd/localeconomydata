import IndustryRankTable from "@/components/IndustryRankTable";
import { industries } from "@/data/industries";
import { metadata } from "@/lib/seo";

export const generateMetadata = () => metadata({
  title: "Industry Expansion Guides",
  description: "Compare DC-region counties by industry fit for life sciences, federal contracting, software, logistics, manufacturing, healthcare, and professional services.",
  path: "/industries"
});

export default function IndustriesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-tight text-ink">Industry Expansion Guides</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">Each industry guide explains what matters for that expansion use case, ranks counties by industry-fit score, and highlights cost, talent, and market access tradeoffs.</p>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {industries.map((industry) => (
          <article key={industry.slug} className="rounded-md border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold text-ink">{industry.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{industry.description}</p>
            <a className="mt-4 inline-flex text-sm font-semibold text-accent" href={`/industries/${industry.slug}`}>View guide</a>
          </article>
        ))}
      </div>
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-ink">Life sciences ranking preview</h2>
        <div className="mt-4"><IndustryRankTable industry="life_sciences" /></div>
      </section>
    </main>
  );
}
