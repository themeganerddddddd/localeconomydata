export default function SourcesPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Data sources</h1>
      <p className="mt-3 text-slate-600">LocalEconomyData currently uses public-source-shaped MVP data and cached public county geography. The loaded database shows the following latest available periods.</p>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">What It Covers</th>
              <th className="px-4 py-3">Latest Loaded Period</th>
              <th className="px-4 py-3">Updated In App</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr><td className="px-4 py-3 font-semibold">BLS QCEW</td><td className="px-4 py-3">County employment, wages, establishments, NAICS industries, and inputs for LQ.</td><td className="px-4 py-3">2024 Annual</td><td className="px-4 py-3">May 15, 2026</td></tr>
            <tr><td className="px-4 py-3 font-semibold">BLS LAUS</td><td className="px-4 py-3">Unemployment rate, labor force, employed, and unemployed.</td><td className="px-4 py-3">September 2025</td><td className="px-4 py-3">May 15, 2026</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Census ACS 5-Year</td><td className="px-4 py-3">Population, income, education, poverty, commuting, and housing.</td><td className="px-4 py-3">2023 release</td><td className="px-4 py-3">May 15, 2026</td></tr>
            <tr><td className="px-4 py-3 font-semibold">BEA Regional Accounts</td><td className="px-4 py-3">County GDP, personal income, and per-capita income.</td><td className="px-4 py-3">2023</td><td className="px-4 py-3">May 15, 2026</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Census Gazetteer / U.S. Atlas</td><td className="px-4 py-3">County FIPS, names, centroids, and county map polygons.</td><td className="px-4 py-3">2024 geography</td><td className="px-4 py-3">May 15, 2026</td></tr>
          </tbody>
        </table>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-600">Production ingestion is designed to replace seeded MVP observations with direct public-source pulls while preserving the same API, CSV, ranking, and county-profile structure.</p>
    </main>
  );
}
