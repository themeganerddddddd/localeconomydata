import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { year: number; quarter?: string; month?: number; value: number };

export default function TrendChart({ title, data }: { title: string; data: Point[] }) {
  const rows = data.map((item) => ({ ...item, period: item.quarter ? `${item.year} ${item.quarter}` : item.month ? `${item.year}-${String(item.month).padStart(2, "0")}` : `${item.year}` }));
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="mt-3 h-56">
        {rows.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <XAxis dataKey="period" tick={{ fontSize: 12 }} minTickGap={24} />
              <YAxis tick={{ fontSize: 12 }} width={58} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-500">Data not available for this metric/source</div>
        )}
      </div>
    </div>
  );
}
