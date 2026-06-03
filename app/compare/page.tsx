import CompareTool from "@/components/CompareTool";
import DataStatusBanner from "@/components/DataStatusBanner";
import { metadata } from "@/lib/seo";

export const generateMetadata = () => metadata({
  title: "Compare Counties for Business Expansion",
  description: "Compare DC-region counties by expansion score, labor force, education, wages, unemployment, industry fit, and market access.",
  path: "/compare"
});

export default function ComparePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <DataStatusBanner />
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink">Compare Counties</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">Select two to four counties and compare expansion scores, workforce indicators, cost signals, education levels, and best-fit industries side by side.</p>
      <div className="mt-8"><CompareTool /></div>
    </main>
  );
}
