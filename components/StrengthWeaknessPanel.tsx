import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { County } from "@/data/counties";

function detailFallback(items: string[]) {
  return items.map((item) => ({
    title: item,
    description: "This factor should be validated against occupation-level data, real estate conditions, and local execution requirements."
  }));
}

export default function StrengthWeaknessPanel({ county }: { county: County }) {
  const strengths = (county.strengthDetails?.length ? county.strengthDetails : detailFallback(county.strengths)).slice(0, 4);
  const risks = (county.riskDetails?.length ? county.riskDetails : detailFallback(county.risks)).slice(0, 4);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-ink">Strengths</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {strengths.map((item) => (
            <div key={item.title} className="rounded-2xl border border-emerald-100 bg-white/80 p-4">
              <h3 className="font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-ink">Watch-outs</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {risks.map((item) => (
            <div key={item.title} className="rounded-2xl border border-amber-100 bg-white/80 p-4">
              <h3 className="font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
