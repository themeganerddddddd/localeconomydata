import { Database, Info, TriangleAlert } from "lucide-react";
import { County } from "@/data/counties";

function status(county?: County) {
  if (!county) {
    return {
      icon: Info,
      tone: "border-blue-200 bg-blue-50 text-slate-700",
      text: "Data status: LocalEconomyData uses public data where available. Specialized expansion scores are directional screening indicators."
    };
  }
  const quality = county.dataQuality;
  const values = quality ? Object.values(quality) : [];
  const realCount = values.filter((item) => item === "real").length;
  const missingCount = values.filter((item) => item === "missing").length;
  if (realCount >= 3) {
    return {
      icon: Database,
      tone: "border-emerald-200 bg-emerald-50 text-slate-700",
      text: "Data status: This profile uses public Census, BLS, BEA, and county boundary data where available. Some specialized indicators may be modeled or unavailable."
    };
  }
  if (missingCount > 0) {
    return {
      icon: Info,
      tone: "border-blue-200 bg-blue-50 text-slate-700",
      text: "Data status: This profile uses public data where available. Some fields are unavailable for this county and are excluded or handled cautiously in the score."
    };
  }
  return {
    icon: TriangleAlert,
    tone: "border-amber-200 bg-amber-50 text-slate-700",
    text: "Data status: This profile includes cached public data and structured screening indicators. Verify source data before making business decisions."
  };
}

export default function DataStatusBanner({ county }: { county?: County }) {
  const config = status(county);
  const Icon = config.icon;
  return (
    <div className={`rounded-2xl border p-4 text-sm leading-6 shadow-sm ${config.tone}`}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-none text-accent" aria-hidden="true" />
        <p>{config.text} Read the <a className="font-semibold text-accent" href="/methodology">methodology</a>.</p>
      </div>
    </div>
  );
}
