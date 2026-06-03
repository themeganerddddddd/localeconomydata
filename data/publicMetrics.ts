export type PublicCountyMetric = {
  unemploymentRate?: number;
  laborForce?: number;
  employed?: number;
  unemployed?: number;
  population?: number;
  medianHouseholdIncome?: number;
  bachelorsOrHigher?: number;
  povertyRate?: number;
  gdpMillions?: number;
  personalIncomeMillions?: number;
  perCapitaPersonalIncome?: number;
  blsLausPeriod?: string;
  censusAcsYear?: string;
  beaGdpYear?: string;
  beaIncomeYear?: string;
  updatedAt?: string;
};

export const publicMetrics: Record<string, PublicCountyMetric> = {};
