import { metadata } from "@/lib/seo";

export const generateMetadata = () => metadata({
  title: "Privacy Policy",
  description: "Privacy policy for LocalEconomyData.",
  path: "/privacy"
});

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-tight text-ink">Privacy Policy</h1>
      <div className="prose-lite mt-6">
        <p>LocalEconomyData is an informational website that presents county-level economic and business expansion analysis. We do not require visitors to provide sensitive personal information to read the site.</p>
        <p>Analytics may be used to understand traffic, page performance, and user behavior in aggregate. Advertising may be used in the future. Cookies, browser identifiers, IP addresses, and similar technologies may be used by analytics or advertising vendors.</p>
        <p>Third-party vendors, including Google, may use cookies to serve ads based on prior visits to this or other websites. Google advertising cookies may personalize ads where permitted. Users can manage ad personalization through Google settings and browser controls.</p>
        <p>LocalEconomyData does not sell personal information. Contact <a className="font-semibold text-accent" href="mailto:weststurhan@gmail.com">weststurhan@gmail.com</a> with privacy questions.</p>
      </div>
    </main>
  );
}
