type Ranking = {
  metric: string;
  value: number;
  national_rank: number;
  state_rank: number;
  national_percentile: number;
};

const labels: Record<string, string> = {
  employment_growth: "Employment growth",
  avg_weekly_wage: "Wage level",
  unemployment_rate: "Unemployment rate",
  population: "Population",
  median_household_income: "Median income",
  industry_concentration: "Industry concentration"
};

export default function RankingCard({ ranking }: { ranking: Ranking }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-600">{labels[ranking.metric] ?? ranking.metric}</div>
      <div className="mt-2 flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold">#{ranking.national_rank}</div>
          <div className="text-xs text-slate-500">national</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">#{ranking.state_rank}</div>
          <div className="text-xs text-slate-500">state</div>
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-accent" style={{ width: `${ranking.national_percentile}%` }} />
      </div>
    </div>
  );
}
