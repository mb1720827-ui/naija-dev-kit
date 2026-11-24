import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Checks that a webhook really came from Paystack. Paystack signs the raw request body with HMAC-SHA512 using
 * your secret key and sends it in the `x-paystack-signature` header. Pass the RAW body, before JSON parsing:
 * re-serialising parsed JSON can change the bytes and break the check.
 */
export function verifyPaystackSignature(
  rawBody: string | Buffer,
  signature: string | null | undefined,
  secretKey: string,
): boolean {
  if (!signature || !secretKey) return false;
  const expected = Buffer.from(createHmac("sha512", secretKey).update(rawBody).digest("hex"), "hex");
  const given = Buffer.from(signature, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** "test" or "live" for a Paystack key, or null if it isn't one. Useful to stop live keys reaching dev or CI. */
export function paystackKeyMode(key: string): "test" | "live" | null {
  const match = /^(?:sk|pk)_(test|live)_[A-Za-z0-9]+$/.exec(key.trim());
  return match ? (match[1] as "test" | "live") : null;
}
