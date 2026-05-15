import { useMemo, useState } from "react";

type Row = {
  industry_code: string;
  industry_title: string;
  employment: number;
  employment_share?: number;
  lq?: number | null;
  lq_national_rank?: number;
  lq_state_rank?: number;
  lq_national_denominator?: number;
  lq_state_denominator?: number;
  latest_period?: string;
};

export default function LqTable({ rows = [] }: { rows?: Row[] }) {
  const [sort, setSort] = useState<keyof Row>("lq");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => `${row.industry_code} ${row.industry_title}`.toLowerCase().includes(query));
  }, [rows, search]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const av = a[sort];
    const bv = b[sort];
    if (typeof av === "string" || typeof bv === "string") return String(av ?? "").localeCompare(String(bv ?? ""));
    return Number(bv ?? 0) - Number(av ?? 0);
  }), [filtered, sort]);
  const header = (key: keyof Row, label: string, align = "text-left") => (
    <th className={`sticky top-0 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-500 ${align}`} onClick={() => setSort(key)}>{label}</th>
  );
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Industry Concentration / Location Quotient Rankings</h3>
            <p className="mt-2 max-w-4xl text-sm text-slate-600">Location quotient compares this county's employment concentration in an industry to the national average. An LQ above 1.0 means the industry is more concentrated locally than nationally. Share is the industry's employment as a percentage of total county employment in the latest period.</p>
          </div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm sm:w-72"
            placeholder="Search NAICS or industry"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              {header("industry_code", "NAICS")}
              {header("industry_title", "Industry")}
              {header("employment", "Employment", "text-right")}
              {header("employment_share", "Share", "text-right")}
              {header("lq", "LQ", "text-right")}
              {header("lq_national_rank", "U.S. LQ rank", "text-right")}
              {header("lq_state_rank", "State LQ rank", "text-right")}
              {header("latest_period", "Period")}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.industry_code} className="border-t border-slate-100 odd:bg-white even:bg-slate-50/60 hover:bg-blue-50/50">
                <td className="px-3 py-2 font-mono text-xs">{row.industry_code}</td>
                <td className="px-3 py-2 font-medium">{row.industry_title}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.employment?.toLocaleString()}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.employment_share == null ? "N/A" : `${row.employment_share.toFixed(1)}%`}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.lq?.toFixed(2) ?? "N/A"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.lq_national_rank ? `#${row.lq_national_rank} of ${row.lq_national_denominator?.toLocaleString()}` : "N/A"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.lq_state_rank ? `#${row.lq_state_rank} of ${row.lq_state_denominator?.toLocaleString()}` : "N/A"}</td>
                <td className="px-3 py-2">{row.latest_period ?? "N/A"}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={8}>No industries match this search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
