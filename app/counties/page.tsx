import CountyDirectory from "@/components/CountyDirectory";
import DataStatusBanner from "@/components/DataStatusBanner";
import { metadata } from "@/lib/seo";

export const generateMetadata = () => metadata({
  title: "County Profiles for Business Expansion",
  description: "Browse DC, Maryland, and Virginia county profiles for workforce, cost, industry fit, and expansion screening.",
  path: "/counties"
});

export default function CountiesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <DataStatusBanner />
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink">County Profiles</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">Compare counties across workforce depth, education, cost indicators, market access, industry-fit scores, and written expansion analysis. The initial editorial focus is the DC, Maryland, and Virginia region.</p>
      <CountyDirectory />
    </main>
  );
}
