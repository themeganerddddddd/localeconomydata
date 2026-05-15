const content = {
  privacy: {
    title: "Privacy",
    body: [
      "LocalEconomyData uses public economic data about places and industries. We do not ask visitors for sensitive personal data to use the site.",
      "If analytics or advertising are enabled, third-party services such as Google Analytics or Google AdSense may use cookies, web beacons, IP addresses, device identifiers, browser information, and similar technologies to measure site usage, serve ads, prevent fraud, and understand ad performance.",
      "Google and its advertising partners may use cookies to serve personalized or non-personalized ads depending on visitor settings, consent choices, region, and applicable law. Visitors can manage Google ad personalization at My Ad Center or through browser cookie controls.",
      "Where required, including for users in the European Economic Area, the United Kingdom, and Switzerland, advertising or analytics cookies should be loaded only after appropriate consent through a consent-management tool.",
      "LocalEconomyData does not sell personal information. Contact weststurhan@gmail.com with privacy questions or deletion/correction requests."
    ]
  },
  terms: {
    title: "Terms",
    body: [
      "Data is provided for informational purposes only, with no warranty of completeness, timeliness, or accuracy.",
      "LocalEconomyData is not financial, legal, investment, or policy advice.",
      "Users should verify important figures with the original BLS, Census, BEA, or other source publications.",
      "Advertising, sponsorships, or affiliate links may appear on the site in the future. Sponsored or advertising content does not change the informational nature of the data and should not be treated as endorsement or professional advice.",
      "Users may not misuse the site, interfere with security or availability, scrape in a way that harms service performance, or present downloaded data in a misleading way."
    ]
  },
  contact: {
    title: "Contact",
    body: []
  }
};

const contactText = "For corrections, data questions, or partnership inquiries, contact us. Westley Sturhan is an economic development researcher and civic data builder focused on making local economies easier to understand. His work combines public policy, data analysis, and product design to turn fragmented public datasets into practical tools for residents, businesses, journalists, and decision-makers. Trained in economic development at the London School of Economics, Westley focuses on affordability, wage growth, workforce trends, business activity, and regional competitiveness, helping people see how headline economic numbers translate into everyday local realities.";

export default function SimplePage({ kind }: { kind: keyof typeof content }) {
  const page = content[kind];
  if (kind === "contact") {
    return (
      <main className="bg-slate-50/70">
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[360px_1fr]">
              <aside className="border-b border-slate-200 bg-slate-50 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="mx-auto max-w-xs lg:mx-0">
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <img
                      className="h-80 w-full object-cover object-[50%_20%]"
                      src="/westley-sturhan.jpeg"
                      alt="Westley Sturhan"
                    />
                  </div>
                  <div className="mt-5 rounded-md border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Direct Contact</div>
                    <div className="mt-3 flex flex-col gap-2">
                      <a className="inline-flex justify-center rounded-md bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700" href="mailto:weststurhan@gmail.com">
                        weststurhan@gmail.com
                      </a>
                      <a className="inline-flex justify-center rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="https://www.linkedin.com/in/westley-sturhan-waibel-09497917b/" target="_blank" rel="noreferrer">
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="max-w-3xl">
                  <div className="text-sm font-semibold uppercase tracking-wide text-accent">Corrections, data questions, and partnerships</div>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Contact</h1>
                  <p className="mt-5 text-lg leading-8 text-slate-700">{contactText}</p>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-ink">Corrections</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Report county, industry, source, or ranking issues.</p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-ink">Data Questions</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Ask about methodology, vintages, or metric definitions.</p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-ink">Partnerships</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Discuss research, civic data, or regional analysis projects.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">{page.title}</h1>
      <div className="mt-6 space-y-4 leading-7 text-slate-700">
        {page.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </main>
  );
}
