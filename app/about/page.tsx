import { metadata } from "@/lib/seo";

export const generateMetadata = () => metadata({
  title: "About",
  description: "Learn why LocalEconomyData helps users compare county-level workforce, industry, cost, and market conditions.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-tight text-ink">About LocalEconomyData</h1>
      <div className="prose-lite mt-6">
        <p>LocalEconomyData exists because business expansion decisions often require local economic context that is scattered across public agencies, spreadsheets, PDFs, and local knowledge. County-level data is not perfect, but it is a useful starting point for comparing labor markets, industry clusters, costs, risks, and market access.</p>
        <p>The site helps businesses, founders, investors, consultants, and economic development professionals compare counties before making expansion decisions. The editorial approach is practical: combine clear metrics with written analysis, caveats, and industry-specific interpretation instead of presenting raw data alone.</p>
        <p>The first version focuses on the DC, Maryland, and Virginia region. Labor-market indicators are refreshed from BLS LAUS and county output and income indicators are refreshed from BEA Regional data. Additional public sources can be added over time while preserving the same emphasis on useful, readable analysis.</p>
        <p>Contact: <a className="font-semibold text-accent" href="mailto:weststurhan@gmail.com">weststurhan@gmail.com</a></p>
      </div>
    </main>
  );
}
