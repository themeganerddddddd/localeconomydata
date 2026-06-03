import { metadata } from "@/lib/seo";

export const generateMetadata = () => metadata({
  title: "Terms of Use",
  description: "Terms of use for LocalEconomyData.",
  path: "/terms"
});

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-tight text-ink">Terms of Use</h1>
      <div className="prose-lite mt-6">
        <p>LocalEconomyData is provided for informational use only. It is not financial, legal, investment, real estate, site-selection, or business advice.</p>
        <p>No guarantee is made that the information is accurate, complete, timely, or suitable for a particular decision. Public data can lag, be revised, contain suppression, or fail to capture important local conditions.</p>
        <p>LocalEconomyData is not affiliated with the Bureau of Labor Statistics, the Bureau of Economic Analysis, the U.S. Census Bureau, or any federal, state, or local government agency.</p>
        <p>Users are responsible for independent verification before making business, investment, hiring, real estate, or relocation decisions. Consult qualified professionals and original data sources when decisions matter.</p>
        <p>Contact <a className="font-semibold text-accent" href="mailto:weststurhan@gmail.com">weststurhan@gmail.com</a> with questions.</p>
      </div>
    </main>
  );
}
