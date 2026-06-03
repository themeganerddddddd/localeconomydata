"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { County } from "@/data/counties";
import { calculateCountyScore } from "@/lib/scoring";

export default function CountyScoreChart({ counties }: { counties: County[] }) {
  const data = counties.map((county) => ({ name: county.name.replace(" County", ""), score: calculateCountyScore(county) }));
  return (
    <div className="h-72 rounded-md border border-slate-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
