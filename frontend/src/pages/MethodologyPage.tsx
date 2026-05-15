export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 leading-7 text-slate-700">
      <h1 className="text-3xl font-semibold text-ink">Methodology</h1>
      <p className="mt-4">The MVP combines seeded county rows shaped after BLS QCEW, BLS LAUS, Census ACS 5-year, and BEA Regional Accounts. Full ingestion scripts are modular so each source can be updated independently and failures do not block other sources.</p>
      <h2 className="mt-6 text-xl font-semibold text-ink">Location quotient</h2>
      <p>LQ = (county industry employment / county total employment) / (national industry employment / national total employment).</p>
      <h2 className="mt-6 text-xl font-semibold text-ink">Rankings</h2>
      <p>National ranks are computed across available counties. State ranks are computed within state. Percentiles are derived from rank position, and missing values are excluded from rank calculations.</p>
      <h2 className="mt-6 text-xl font-semibold text-ink">Release lags</h2>
      <p>QCEW, ACS, and BEA series arrive with publication lags. County pages show the latest available period loaded into SQLite.</p>
    </main>
  );
}
