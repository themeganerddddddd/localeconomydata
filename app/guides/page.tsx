import { metadata, articleJsonLd } from "@/lib/seo";

const guides = [
  {
    title: "Best Counties for Business Expansion in the DC Region",
    href: "/guides/best-counties-for-business-expansion-dc-region",
    description: "Compare counties by workforce, costs, industry fit, market access, and site-selection tradeoffs."
  },
  {
    title: "Montgomery County vs Fairfax County for Business Expansion",
    href: "/guides/montgomery-vs-fairfax-business-expansion",
    description: "A practical comparison of two leading DC-region counties for business expansion."
  },
  {
    title: "Best Counties for Life Sciences Expansion in the DC Region",
    href: "/guides/best-counties-for-life-sciences-dc-region",
    description: "Evaluate life-sciences expansion markets by research access, workforce, space needs, and cost."
  },
  {
    title: "Best Counties for Business Expansion on the East Coast",
    href: "/guides/best-counties-for-business-expansion-east-coast",
    description: "Compare expanded East Coast county markets for talent, cost, logistics, life sciences, software, and federal contracting."
  }
];

export const generateMetadata = () => metadata({
  title: "Business Expansion Guides for County Site Selection",
  description: "Read LocalEconomyData guides on county site selection, business expansion, life sciences, workforce, costs, and regional tradeoffs.",
  path: "/guides",
  type: "article"
});

export default function GuidesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd("Business Expansion Guides for County Site Selection", "County site-selection and business expansion guides from LocalEconomyData.", "/guides")) }} />
      <h1 className="text-4xl font-semibold tracking-tight text-ink">Business Expansion Guides</h1>
      <p className="mt-4 max-w-3xl leading-7 text-slate-600">Original guides for comparing counties, understanding regional tradeoffs, and turning public economic data into practical site-selection questions.</p>
      <div className="mt-8 grid gap-5">
        {guides.map((guide) => (
          <a key={guide.href} href={guide.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300">
            <h2 className="text-xl font-semibold text-ink">{guide.title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{guide.description}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
