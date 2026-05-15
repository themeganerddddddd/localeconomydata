import { useMemo, useState } from "react";

type Industry = {
  industry_code: string;
  industry_title: string;
  employment: number;
  avg_weekly_wage: number;
  establishments: number;
  employment_share?: number;
  growth: number | null;
  wage_growth?: number | null;
  lq: number | null;
  employment_national_rank?: number;
  employment_state_rank?: number;
  latest_period?: string;
};

export default function IndustryTable({ rows }: { rows: Industry[] }) {
  const [sort, setSort] = useState<keyof Industry>("employment");
  const sorted = useMemo(
    () => [...rows].sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      if (typeof av === "string" || typeof bv === "string") return String(av ?? "").localeCompare(String(bv ?? ""));
      return Number(bv ?? 0) - Number(av ?? 0);
    }),
    [rows, sort]
  );
  const header = (key: keyof Industry, label: string) => (
    <th className="sticky top-0 bg-slate-50 px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500" onClick={() => setSort(key)}>
      {label}
    </th>
  );
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="metric-table min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {header("industry_code", "NAICS")}
              {header("industry_title", "Industry")}
              {header("employment", "Employment")}
              {header("employment_share", "Share")}
              {header("growth", "Emp. growth")}
              {header("avg_weekly_wage", "Wage")}
              {header("wage_growth", "Wage growth")}
              {header("establishments", "Estab.")}
              {header("lq", "LQ")}
              {header("employment_national_rank", "U.S. employment rank")}
              {header("employment_state_rank", "State employment rank")}
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
                <td className="px-3 py-2 text-right tabular-nums">{row.growth == null ? "N/A" : `${row.growth.toFixed(1)}%`}</td>
                <td className="px-3 py-2 text-right tabular-nums">${row.avg_weekly_wage?.toLocaleString()}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.wage_growth == null ? "N/A" : `${row.wage_growth.toFixed(1)}%`}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.establishments?.toLocaleString()}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.lq?.toFixed(2) ?? "N/A"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.employment_national_rank ? `#${row.employment_national_rank}` : "N/A"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.employment_state_rank ? `#${row.employment_state_rank}` : "N/A"}</td>
                <td className="px-3 py-2">{row.latest_period ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
