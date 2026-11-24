export type Network = "MTN" | "Airtel" | "Glo" | "9mobile";

// Number ranges as originally allocated by the NCC. Because of mobile number portability (MNP), a customer
// can keep their number when they switch networks, so a prefix tells you the ORIGINAL network only.
const PREFIXES: Record<Network, readonly string[]> = {
  MTN: ["0703", "0704", "0706", "0803", "0806", "0810", "0813", "0814", "0816", "0903", "0906", "0913", "0916", "07025", "07026"],
  Airtel: ["0701", "0708", "0802", "0808", "0812", "0901", "0902", "0904", "0907", "0912"],
  Glo: ["0705", "0805", "0807", "0811", "0815", "0905", "0915"],
  "9mobile": ["0809", "0817", "0818", "0908", "0909"],
};

// Longest prefixes first, so "07025" wins over a shorter match.
const LOOKUP = Object.entries(PREFIXES)
  .flatMap(([network, prefixes]) => prefixes.map((prefix) => ({ prefix, network: network as Network })))
  .sort((a, b) => b.prefix.length - a.prefix.length);

/** Nigerian mobile numbers have 10 digits after the country code, starting 70, 80, 81, 90 or 91. */
const MOBILE_NSN = /^(70|80|81|90|91)\d{8}$/;

/**
 * Turns any common way of writing a Nigerian mobile number into E.164 ("+2348031234567"), the format to store.
 * Accepts "0803 123 4567", "+234 803 123 4567", "2348031234567", "+234 (0) 803-123-4567" and "8031234567".
 * Returns null if it isn't a valid Nigerian mobile number.
 */
export function normalizePhone(input: string): string | null {
  let digits = input.trim().replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;

  let nsn: string;
  if (digits.startsWith("2340") && digits.length === 14) nsn = digits.slice(4); // +234 (0) 803...
  else if (digits.startsWith("234") && digits.length === 13) nsn = digits.slice(3);
  else if (digits.startsWith("0") && digits.length === 11) nsn = digits.slice(1);
  else if (digits.length === 10) nsn = digits;
  else return null;

  return MOBILE_NSN.test(nsn) ? `+234${nsn}` : null;
}

/** "+2348031234567" (or any accepted input) → "0803 123 4567", the way Nigerians write numbers. */
export function formatPhoneLocal(input: string): string | null {
  const e164 = normalizePhone(input);
  if (!e164) return null;
  const local = `0${e164.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

/**
 * The network a number was ORIGINALLY issued on, or null if the prefix is unknown.
 * Don't use this to decide where to send airtime or data: ported numbers will be wrong. Ask the user.
 */
export function phoneNetwork(input: string): Network | null {
  const e164 = normalizePhone(input);
  if (!e164) return null;
  const local = `0${e164.slice(4)}`;
  return LOOKUP.find((p) => local.startsWith(p.prefix))?.network ?? null;
}
