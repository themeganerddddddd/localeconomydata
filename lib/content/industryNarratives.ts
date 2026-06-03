import { County, IndustryKey } from "@/data/counties";
import { industries } from "@/data/industries";
import { getIndustryScoreBreakdown } from "@/lib/scoring";

function industryName(industry: IndustryKey) {
  return industries.find((item) => item.key === industry)?.name ?? industry.replace(/_/g, " ");
}

export function generateIndustryScoreExplanation(county: County, industry: IndustryKey) {
  const rows = getIndustryScoreBreakdown(county, industry).filter((item) => item.score !== null);
  const strongest = [...rows].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const weakest = [...rows].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
  return `${county.name}'s ${industryName(industry)} score is mainly driven by ${strongest?.label.toLowerCase() ?? "available public-data signals"}. The main constraint is ${weakest?.label.toLowerCase() ?? "limited source coverage"}, so this score should be used as an industry-specific screening prompt rather than a final site-selection answer.`;
}

export function generateIndustryStrengths(county: County, industry: IndustryKey) {
  const rows = getIndustryScoreBreakdown(county, industry).filter((item) => (item.score ?? 0) >= 70).slice(0, 3);
  return rows.length ? rows.map((item) => `${item.label}: ${item.explanation}`) : county.strengths.slice(0, 3);
}

export function generateIndustryWatchouts(county: County, industry: IndustryKey) {
  const rows = getIndustryScoreBreakdown(county, industry).filter((item) => item.score !== null && (item.score ?? 0) < 55).slice(0, 3);
  return rows.length ? rows.map((item) => `${item.label}: confirm this factor with current local data.`) : county.risks.slice(0, 3);
}
