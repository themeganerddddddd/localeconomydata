import { metadata, articleJsonLd } from "@/lib/seo";

export const generateMetadata = () => metadata({
  title: "Business Expansion Scoring Methodology",
  description: "How LocalEconomyData scores county expansion markets using talent depth, education, labor availability, industry fit, cost competitiveness, and market access.",
  path: "/methodology",
  type: "article"
});

export default function MethodologyPage() {
  const weights = [
    ["Talent Depth", "25%", "Normalized labor force size."],
    ["Education Level", "15%", "Bachelor's degree or higher share."],
    ["Labor Availability", "15%", "Labor force scale and balanced unemployment."],
    ["Industry Fit", "20%", "Industry-specific suitability scores."],
    ["Cost Competitiveness", "15%", "Inverse wage/cost pressure."],
    ["Growth / Market Access", "10%", "Manual market access score."]
  ];
  const sources = [
    ["Census ACS 5-Year", "Population, median household income, education, poverty", "Used when CENSUS_API_KEY is available; otherwise fields are marked missing or fallback."],
    ["BLS LAUS", "Labor force, employed, unemployed, unemployment rate", "Fetched at update time with BLS_API_KEY."],
    ["BLS QCEW", "Industry employment, establishments, wages, NAICS sector mix", "Parser path is planned; manually assigned industry indicators are labeled as screening inputs until QCEW is wired."],
    ["BEA Regional", "County GDP, personal income, per-capita personal income", "Fetched at update time with BEA_API_KEY."],
    ["Public county boundaries", "County shape outlines", "Generated from public county GeoJSON and rendered as SVG silhouettes."]
  ];
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd("Business Expansion Scoring Methodology", "How LocalEconomyData scores county expansion markets.", "/methodology")) }} />
      <h1 className="text-4xl font-semibold tracking-tight text-ink">Methodology</h1>
      <div className="prose-lite mt-6">
        <p>LocalEconomyData measures county-level expansion conditions for businesses, founders, investors, consultants, and economic development professionals. The goal is not to produce a final site-selection recommendation. The goal is to help users screen counties, compare tradeoffs, and identify the right questions before spending time and money on deeper diligence.</p>
        <p>The expansion score combines six factors: talent depth, education level, labor availability, industry fit, cost competitiveness, and growth or market access. Each factor is normalized across the current completed county dataset so users can compare counties on a consistent 0-100 scale. The model is deterministic and intentionally simple so it can be challenged, edited, and improved as additional public sources are added.</p>
      </div>
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-ink">Data sources</h2>
        <div className="mt-4 overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Source</th><th className="px-4 py-3">Fields</th><th className="px-4 py-3">Current use</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{sources.map((row) => <tr key={row[0]}><td className="px-4 py-3 font-semibold">{row[0]}</td><td className="px-4 py-3 text-slate-700">{row[1]}</td><td className="px-4 py-3 text-slate-600">{row[2]}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <div className="mt-8 overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Factor</th><th className="px-4 py-3">Weight</th><th className="px-4 py-3">Interpretation</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{weights.map((row) => <tr key={row[0]}><td className="px-4 py-3 font-semibold">{row[0]}</td><td className="px-4 py-3">{row[1]}</td><td className="px-4 py-3 text-slate-600">{row[2]}</td></tr>)}</tbody>
        </table>
      </div>
      <section className="prose-lite mt-8">
        <h2 className="text-2xl font-semibold text-ink">How to interpret scores</h2>
        <p>Scores above 85 indicate excellent expansion markets, usually because a county combines deep talent, strong education, market access, and relevant industry fit. Scores from 70 to 84 indicate strong markets with meaningful advantages and manageable tradeoffs. Scores from 55 to 69 indicate selective opportunity markets that may be right for specific companies. Scores below that range require more caution and more validation.</p>
        <h2 className="mt-8 text-2xl font-semibold text-ink">Limitations and caveats</h2>
        <p>This is a directional screening tool, not financial, legal, real estate, investment, or business advice. County-level data can hide neighborhood differences. Public data may lag, be revised, or be suppressed. BLS LAUS and BEA Regional data are refreshed through public APIs, county shapes are generated from public boundary data, and Census ACS fields are supported when a Census API key is configured. QCEW/NAICS industry data is not yet fully wired, so industry-fit scores remain screening inputs until that parser is completed.</p>
        <h2 className="mt-8 text-2xl font-semibold text-ink">Missing data handling</h2>
        <p>When a public source is unavailable, the page displays data status information and avoids presenting unavailable fields as real values. Scores are still directional and should be interpreted with source notes. Future scoring versions should reweight missing components explicitly; the current model uses the completed screening dataset and flags missing source categories through the data status banner.</p>
        <h2 className="mt-8 text-2xl font-semibold text-ink">Industry-specific score breakdowns</h2>
        <p>Industry fit scores use six factors: workforce depth, education or specialized talent, existing industry base, cost competitiveness, market access, and infrastructure or real estate fit. The labels adapt by industry. For example, logistics emphasizes transportation and industrial real estate, while life sciences emphasizes research, education, and lab fit. If a factor is unavailable, it is shown as not available and excluded from the detailed industry total.</p>
        <h2 className="mt-8 text-2xl font-semibold text-ink">County-in-state maps</h2>
        <p>County profile maps are generated from public county and state GeoJSON. The state outline is rendered first in a neutral fill, and the selected county is highlighted on top using the county FIPS code. This helps users understand where the county sits inside its state without loading a heavy interactive map on every SEO page.</p>
      </section>
    </main>
  );
}
