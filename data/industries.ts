export const industries = [
  {
    key: "life_sciences",
    slug: "life-sciences",
    name: "Life Sciences",
    description: "Biotech, therapeutics, diagnostics, medical research, and related lab-intensive activity."
  },
  {
    key: "federal_contracting",
    slug: "federal-contracting",
    name: "Federal Contracting",
    description: "Government contractors, defense services, cybersecurity, consulting, and public-sector vendors."
  },
  {
    key: "software_ai",
    slug: "software-ai",
    name: "Software & AI",
    description: "Software companies, applied AI startups, data infrastructure, automation, and analytics."
  },
  {
    key: "logistics",
    slug: "logistics",
    name: "Logistics",
    description: "Distribution, warehousing, last-mile delivery, freight, and supply-chain operations."
  },
  {
    key: "advanced_manufacturing",
    slug: "advanced-manufacturing",
    name: "Advanced Manufacturing",
    description: "Specialized production, electronics, aerospace components, precision systems, and hardware."
  },
  {
    key: "healthcare_services",
    slug: "healthcare-services",
    name: "Healthcare Services",
    description: "Provider networks, outpatient care, medical offices, health administration, and care delivery."
  },
  {
    key: "professional_services",
    slug: "professional-services",
    name: "Professional Services",
    description: "Consulting, legal, accounting, management, design, engineering, and business support services."
  },
  {
    key: "education_research",
    slug: "education-research",
    name: "Education & Research",
    description: "Universities, research institutes, applied R&D, training providers, and knowledge-economy anchors."
  },
  {
    key: "finance_insurance",
    slug: "finance-insurance",
    name: "Finance & Insurance",
    description: "Banking, insurance, fintech, corporate finance, risk services, and related back-office operations."
  },
  {
    key: "energy_infrastructure",
    slug: "energy-infrastructure",
    name: "Energy & Infrastructure",
    description: "Utilities, grid modernization, construction, energy services, infrastructure delivery, and resilience work."
  }
] as const;

export type Industry = (typeof industries)[number];
