export function getNaicsDigitLevel(naicsCode?: string | null): number | "sector_range" | null {
  if (!naicsCode) return null;
  const code = String(naicsCode).trim();
  if (code.includes("-")) return "sector_range";
  const digits = code.replace(/\D/g, "");
  const length = digits.length;
  return [2, 3, 4, 5, 6].includes(length) ? (length as 2 | 3 | 4 | 5 | 6) : null;
}
