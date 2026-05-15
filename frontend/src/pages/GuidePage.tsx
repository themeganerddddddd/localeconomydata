import { useEffect } from "react";
import { updateSeo } from "../lib/seo";

const guides: Record<string, { title: string; description: string; body: string[] }> = {
  "what-is-location-quotient": {
    title: "What Is Location Quotient?",
    description: "Learn how location quotient compares a county industry concentration with the national average.",
    body: [
      "Location quotient, often shortened to LQ, compares the share of local employment in an industry with that industry's share of national employment.",
      "An LQ above 1.0 means the industry is more concentrated locally than nationally. An LQ below 1.0 means the industry is less concentrated locally than nationally.",
      "LocalEconomyData uses LQ to identify county industry specializations, regional clusters, and places where a sector has unusual local weight."
    ]
  },
  "what-are-naics-codes": {
    title: "What Are NAICS Codes?",
    description: "Learn how NAICS codes organize industries from broad sectors to detailed national industries.",
    body: [
      "NAICS codes are industry classification codes used by U.S. statistical agencies to group businesses into comparable industries.",
      "Two-digit NAICS codes describe broad sectors, while longer codes describe more detailed subsectors, industry groups, and national industries.",
      "County industry tables use NAICS codes so researchers can compare employment, wages, growth, and concentration across places."
    ]
  },
  "how-county-unemployment-is-measured": {
    title: "How County Unemployment Is Measured",
    description: "Learn what county unemployment rates measure and how to interpret LAUS labor market data.",
    body: [
      "County unemployment rates estimate the share of the local labor force that is unemployed and actively seeking work.",
      "The BLS Local Area Unemployment Statistics program publishes monthly labor force, employed, unemployed, and unemployment rate estimates.",
      "Small-area unemployment data can be revised, so researchers should check source vintages and avoid over-interpreting tiny monthly moves."
    ]
  },
  "what-is-qcew": {
    title: "What Is QCEW?",
    description: "Learn how BLS QCEW data measures county employment, establishments, wages, and industries.",
    body: [
      "The Quarterly Census of Employment and Wages is a BLS program built from unemployment insurance records.",
      "QCEW covers most U.S. wage and salary jobs and provides county employment, establishments, wages, and industry detail.",
      "Because QCEW is detailed and high quality, it is one of the best public sources for comparing county industry structure."
    ]
  }
};

export default function GuidePage() {
  const slug = window.location.pathname.split("/")[2] ?? "";
  const guide = guides[slug] ?? guides["what-is-location-quotient"];

  useEffect(() => {
    updateSeo({
      title: `${guide.title} | LocalEconomyData`,
      description: guide.description,
      path: `/guides/${slug}`
    });
  }, [guide, slug]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-sm font-semibold text-slate-500"><a href="/">Home</a> <span>/</span> <span>Guides</span></nav>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">{guide.title}</h1>
      <div className="mt-6 space-y-5 leading-7 text-slate-700">
        {guide.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-accent">
        <a href="/methodology">Methodology</a>
        <a href="/data-sources">Data Sources</a>
        <a href="/rankings/fastest-growing-counties">County Rankings</a>
      </div>
    </main>
  );
}
