import { metadata } from "@/lib/seo";

export const generateMetadata = () => metadata({
  title: "Contact",
  description: "Contact LocalEconomyData for data corrections, county suggestions, partnerships, custom analysis, or advertising inquiries.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-tight text-ink">Contact</h1>
      <p className="mt-4 leading-7 text-slate-600">For corrections, data questions, county suggestions, partnership inquiries, custom analysis requests, or advertising inquiries, contact LocalEconomyData.</p>
      <a className="mt-6 inline-flex rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white" href="mailto:weststurhan@gmail.com">weststurhan@gmail.com</a>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {["Data corrections", "County suggestions", "Partnership inquiries", "Custom analysis requests", "Advertising inquiries"].map((item) => <div key={item} className="rounded-md border border-slate-200 bg-white p-4 font-semibold text-ink">{item}</div>)}
      </div>
    </main>
  );
}
