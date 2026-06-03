export function lausSeriesId(fips: string, code: "3" | "4" | "5" | "6") {
  return `LAUCN${fips}000000000${code}`;
}

export const lausSeries = {
  unemploymentRate: "3",
  unemployed: "4",
  employed: "5",
  laborForce: "6"
} as const;
