import { counties, County, IndustryKey } from "@/data/counties";

const clamp = (value: number) => Math.max(0, Math.min(100, value));

function normalize(value: number, values: number[], inverse = false) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 50;
  const score = ((value - min) / (max - min)) * 100;
  return inverse ? 100 - score : score;
}

function balancedUnemployment(rate: number) {
  const ideal = 3.6;
  const distance = Math.abs(rate - ideal);
  return clamp(100 - distance * 24);
}

export function calculateIndustryScore(county: County, industry: IndustryKey): number {
  return calculateDetailedIndustryScore(county, industry) ?? county.industryScores[industry];
}

export type IndustryScoreBreakdownItem = {
  key: string;
  label: string;
  score: number | null;
  weight: number;
  weightedPoints: number | null;
  explanation: string;
};

export function getIndustryScoreBreakdown(county: County, industry: IndustryKey): IndustryScoreBreakdownItem[] {
  const laborValues = counties.map((item) => item.laborForce);
  const educationValues = counties.map((item) => item.bachelorsOrHigher);
  const wageValues = counties.map((item) => item.medianWageEstimate);
  const existingBase = county.industryScores[industry];
  const logisticsBoost = industry === "logistics" ? county.marketAccessScore : existingBase;
  const infrastructure = ["logistics", "advanced_manufacturing", "energy_infrastructure"].includes(industry) ? logisticsBoost : (county.marketAccessScore + existingBase) / 2;
  const educationLabel = industry === "life_sciences" ? "Research and education base" : industry === "software_ai" ? "Education / technical talent" : industry === "federal_contracting" ? "Security / professional talent proxy" : industry === "logistics" ? "Transportation access" : "Education / specialized talent";
  const marketLabel = industry === "federal_contracting" ? "Federal market access" : "Market access";
  const infrastructureLabel = industry === "life_sciences" ? "Lab / real estate fit" : industry === "logistics" ? "Industrial real estate fit" : industry === "software_ai" ? "Startup / professional services ecosystem" : "Infrastructure / real estate fit";
  const rows = [
    ["workforce_depth", "Workforce depth", normalize(county.laborForce, laborValues), 0.25, "Measures whether the county has enough labor-market scale for this industry."],
    ["specialized_talent", educationLabel, normalize(county.bachelorsOrHigher, educationValues), 0.20, "Uses education and specialized workforce proxies for industry-relevant hiring."],
    ["industry_base", "Existing industry base", existingBase, 0.25, "Reflects the county's current screening score for this industry and related ecosystem strength."],
    ["cost", "Cost competitiveness", normalize(county.medianWageEstimate, wageValues, true), 0.15, "Lower wage and income pressure improves the cost side of the score."],
    ["market_access", marketLabel, county.marketAccessScore, 0.10, "Captures customer, corridor, metro, and regional access relevant to expansion."],
    ["infrastructure", infrastructureLabel, infrastructure, 0.05, "Represents whether the county appears to fit the facility and infrastructure needs of the industry."]
  ] as const;
  return rows.map(([key, label, score, weight, explanation]) => ({
    key,
    label,
    score: Number.isFinite(score) ? Math.round(clamp(score)) : null,
    weight,
    weightedPoints: Number.isFinite(score) ? clamp(score) * weight : null,
    explanation
  }));
}

export function calculateDetailedIndustryScore(county: County, industry: IndustryKey): number | null {
  const rows = getIndustryScoreBreakdown(county, industry).filter((item) => item.score !== null);
  if (!rows.length) return null;
  const totalWeight = rows.reduce((sum, item) => sum + item.weight, 0);
  return Math.round(rows.reduce((sum, item) => sum + (item.score ?? 0) * (item.weight / totalWeight), 0));
}

export type ScoreBreakdownItem = {
  key: string;
  label: string;
  score: number;
  weight: number;
  weightedPoints: number;
  explanation: string;
};

export function getCountyScoreBreakdown(county: County): ScoreBreakdownItem[] {
  const laborValues = counties.map((item) => item.laborForce);
  const educationValues = counties.map((item) => item.bachelorsOrHigher);
  const wageValues = counties.map((item) => item.medianWageEstimate);
  const talentDepth = normalize(county.laborForce, laborValues);
  const educationLevel = normalize(county.bachelorsOrHigher, educationValues);
  const laborAvailability = (normalize(county.laborForce, laborValues) * 0.45) + (balancedUnemployment(county.unemploymentRate) * 0.55);
  const industryFit = Object.values(county.industryScores).reduce((sum, value) => sum + value, 0) / Object.values(county.industryScores).length;
  const costCompetitiveness = normalize(county.medianWageEstimate, wageValues, true);
  const marketAccess = county.marketAccessScore;
  const rows = [
    ["talent_depth", "Talent Depth", talentDepth, 0.25, "Scores the scale of the local labor force and surrounding workforce depth."],
    ["education_level", "Education Level", educationLevel, 0.15, "Measures the county's higher-education signal for specialized and professional hiring."],
    ["labor_availability", "Labor Availability", laborAvailability, 0.15, "Balances labor-force scale with a healthy unemployment rate that suggests neither severe weakness nor extreme tightness."],
    ["industry_fit", "Industry Fit", industryFit, 0.20, "Averages the county's sector-specific fit across the industries tracked by LocalEconomyData."],
    ["cost_competitiveness", "Cost Competitiveness", costCompetitiveness, 0.15, "Uses income and wage-pressure signals inversely so lower-cost counties receive more room in the model."],
    ["market_access", "Growth / Market Access", marketAccess, 0.10, "Captures corridor access, customer proximity, regional growth context, and practical expansion reach."]
  ] as const;
  return rows.map(([key, label, score, weight, explanation]) => ({
    key,
    label,
    score: Math.round(clamp(score)),
    weight,
    weightedPoints: clamp(score) * weight,
    explanation
  }));
}

export function calculateCountyScore(county: County): number {
  return Math.round(getCountyScoreBreakdown(county).reduce((sum, item) => sum + item.weightedPoints, 0));
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "Excellent expansion market";
  if (score >= 70) return "Strong expansion market";
  if (score >= 55) return "Selective opportunity market";
  if (score >= 40) return "Caution market";
  return "Weak expansion market";
}

export function rankCountiesByIndustry(industry: IndustryKey): County[] {
  return [...counties].sort((a, b) => calculateIndustryScore(b, industry) - calculateIndustryScore(a, industry));
}

export function getCountyBySlug(slug: string): County | undefined {
  return counties.find((county) => county.slug === slug);
}

export function getBestIndustries(county: County, limit = 3) {
  return Object.entries(county.industryScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit) as [IndustryKey, number][];
}
