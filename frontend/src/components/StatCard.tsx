type Props = {
  label: string;
  value: string | number | null | undefined;
  change?: string | null;
  source?: string;
  period?: string | null;
  note?: string;
};

export default function StatCard({ label, value, change, source, period, note }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value ?? "N/A"}</div>
      {change && <div className={`mt-1 text-sm font-semibold ${change.startsWith("-") ? "text-rose-700" : "text-emerald-700"}`}>{change} YoY</div>}
      {note && <div className="mt-1 text-sm text-slate-500">{note}</div>}
      {(source || period) && <div className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">Source: {source ?? "Mixed"}{period ? ` · Latest: ${period}` : ""}</div>}
    </div>
  );
}
