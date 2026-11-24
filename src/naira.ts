const formatter = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });
const wholeFormatter = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

/** Store money as whole kobo (₦1 = 100 kobo). Floats like 0.1 + 0.2 make totals drift. */
export function formatNaira(kobo: number, { showKobo = true }: { showKobo?: boolean } = {}): string {
  if (!Number.isSafeInteger(kobo)) throw new TypeError(`formatNaira expects whole kobo, got ${kobo}`);
  return (showKobo ? formatter : wholeFormatter).format(kobo / 100);
}

/**
 * Parses naira written by a person ("₦1,250.50", "N1250", "1,250", "1250.5") into whole kobo, without float rounding.
 * Returns null if it isn't a valid amount (letters, more than 2 decimal places, negative).
 */
export function nairaToKobo(input: string | number): number | null {
  const text = String(input).trim().replace(/^(₦|NGN|N)\s*/i, "").replace(/,/g, "");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) return null;
  const kobo = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(kobo) ? kobo : null;
}

/** VAT on an amount in kobo, rounded to the nearest kobo. Nigeria's rate is 7.5% (2026); pass the rate if it changes. */
export function vatOn(kobo: number, ratePercent = 7.5): number {
  if (!Number.isSafeInteger(kobo)) throw new TypeError(`vatOn expects whole kobo, got ${kobo}`);
  return Math.round((kobo * ratePercent) / 100);
}
