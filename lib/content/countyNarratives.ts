import { County, IndustryKey } from "@/data/counties";
import { industries } from "@/data/industries";
import { calculateIndustryScore } from "@/lib/scoring";
import { formatMoney, formatNumber, formatPercent } from "@/lib/utils";

export function generateCountySummary(county: County) {
  const scale = county.population > 750000 ? "large-scale" : county.population > 250000 ? "mid-sized" : "smaller";
  const education = county.bachelorsOrHigher > 45 ? "a high education signal" : "a practical workforce base";
  return `${county.name}, ${county.state} is a ${scale} county economy with ${education}, a labor force of about ${formatNumber(county.laborForce)}, and an unemployment rate of ${formatPercent(county.unemploymentRate)}. Its strongest expansion themes include ${county.topIndustries.slice(0, 3).join(", ").toLowerCase()}.`;
}

export function generateLaborAnalysis(county: County) {
  const tightness = county.unemploymentRate <= 3.5 ? "tight labor conditions" : county.unemploymentRate >= 5 ? "more visible labor availability but also possible economic softness" : "a balanced labor market";
  return `${county.name}'s labor market shows ${tightness}. The county's labor force of about ${formatNumber(county.laborForce)} gives employers a starting pool to evaluate, but companies should still validate occupation-level availability, commute tolerance, wage expectations, training pipelines, and competition from nearby counties.`;
}

export function generateCostAnalysis(county: County) {
  const income = county.perCapitaPersonalIncome ? `BEA per-capita personal income of ${formatMoney(county.perCapitaPersonalIncome)}` : `median household income of ${formatMoney(county.medianHouseholdIncome)}`;
  return `${county.name}'s cost picture should be read through ${income}, wage expectations, housing pressure, and commercial real estate availability. Higher-income counties may support stronger customers and talent, but they can also create employer cost pressure.`;
}

export function generateIndustryAnalysis(county: County) {
  return `${county.name}'s strongest industry themes are ${county.topIndustries.slice(0, 4).join(", ").toLowerCase()}. The best opportunities are likely to come from companies whose operating model matches the county's workforce, customer access, facility needs, and execution constraints.`;
}

export function generateIndustryFitExplanation(county: County, industryKey: IndustryKey) {
  const industry = industries.find((item) => item.key === industryKey);
  const score = calculateIndustryScore(county, industryKey);
  const label = score >= 85 ? "excellent" : score >= 70 ? "strong" : score >= 50 ? "moderate" : "limited";
  return `${county.name} is a ${label} fit for ${industry?.name ?? industryKey} based on its workforce scale, market access, cost profile, and related industry signals. Use this as a screening prompt, then validate real estate, hiring, infrastructure, and customer access.`;
}

export function generateCountyFAQ(county: County) {
  return [
    { question: `What kinds of companies should consider ${county.name}?`, answer: `${county.name} is strongest for ${county.topIndustries.slice(0, 3).join(", ").toLowerCase()} and companies that can benefit from its ${county.strengths.slice(0, 2).join(" and ").toLowerCase()}. The county is most useful as an early screening candidate when a company needs to compare workforce scale, customer access, industry fit, and operating costs across several possible locations.` },
    { question: `How strong is the labor market in ${county.name}?`, answer: `${county.name} has a labor force of about ${formatNumber(county.laborForce)} and an unemployment rate of ${formatPercent(county.unemploymentRate)}. Those figures help frame hiring conditions, but employers should also verify occupation-level labor availability, commute sheds, salary expectations, training pipelines, and competition from nearby counties.` },
    { question: `Is ${county.name} expensive for employers?`, answer: `${county.name}'s cost profile depends on the occupation and facility type. Employers should compare wages, commercial space, taxes, utilities, insurance, commute sheds, incentives, and site readiness before deciding whether the county's advantages justify its costs.` },
    { question: `Which industries fit ${county.name} best?`, answer: `The strongest industry signals for ${county.name} include ${county.topIndustries.slice(0, 4).join(", ").toLowerCase()}. The industry-fit score is intended to show whether the county's workforce, market access, cost profile, and business base match common expansion needs for those sectors.` },
    { question: "How is the LocalEconomyData score calculated?", answer: "The score combines talent depth, education level, labor availability, industry fit, cost competitiveness, and growth or market access. Missing source components are handled cautiously rather than treated as zero." },
    { question: "What data sources does this profile use?", answer: "Profiles use public economic indicators where available, including BLS LAUS labor-market data, BEA regional income and GDP data, Census ACS indicators where configured, public boundary files for maps, and LocalEconomyData scoring logic for industry and expansion screening." },
    { question: "Should this score replace a formal site-selection process?", answer: "No. The score is an early screening tool. Companies should verify source data, real estate, utilities, incentives, permitting, workforce pipelines, infrastructure, customer access, and local operating risks before making a final decision." }
  ];
}
