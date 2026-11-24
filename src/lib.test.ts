import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  findState,
  formatNaira,
  formatPhoneLocal,
  nairaToKobo,
  normalizePhone,
  paystackKeyMode,
  phoneNetwork,
  STATES,
  statesInZone,
  vatOn,
  verifyPaystackSignature,
} from "./index.js";

describe("phone numbers", () => {
  it.each([
    "08031234567",
    "0803 123 4567",
    "0803-123-4567",
    "+2348031234567",
    "+234 803 123 4567",
    "2348031234567",
    "+234 (0) 803-123-4567",
    "8031234567",
    " 0803.123.4567 ",
  ])("normalises %s to E.164", (input) => {
    expect(normalizePhone(input)).toBe("+2348031234567");
  });

  it.each(["0803123456", "080312345678", "06031234567", "+2338031234567", "0803123456a", "", "+"])("rejects %s", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });

  it("formats for display the way Nigerians write numbers", () => {
    expect(formatPhoneLocal("+2349061234567")).toBe("0906 123 4567");
  });

  it("detects the original network, preferring the longer prefix", () => {
    expect(phoneNetwork("0803 123 4567")).toBe("MTN");
    expect(phoneNetwork("0802 123 4567")).toBe("Airtel");
    expect(phoneNetwork("0805 123 4567")).toBe("Glo");
    expect(phoneNetwork("0809 123 4567")).toBe("9mobile");
    expect(phoneNetwork("07025 12 3456")).toBe("MTN");
    expect(phoneNetwork("07021 12 3456")).toBeNull(); // valid number, prefix not in the list
    expect(phoneNetwork("not a number")).toBeNull();
  });
});

describe("naira", () => {
  it("formats whole kobo as naira", () => {
    expect(formatNaira(125050)).toBe("₦1,250.50");
    expect(formatNaira(0)).toBe("₦0.00");
    expect(formatNaira(125050, { showKobo: false })).toBe("₦1,251");
  });

  it("refuses fractional kobo, which would hide a float bug", () => {
    expect(() => formatNaira(12.5)).toThrow();
  });

  it.each([
    ["₦1,250.50", 125050],
    ["N1250", 125000],
    ["NGN 1,250", 125000],
    ["1250.5", 125050],
    ["0.1", 10],
    ["  ₦99.99 ", 9999],
    [1250, 125000],
  ] as const)("parses %s into %d kobo without float error", (input, kobo) => {
    expect(nairaToKobo(input)).toBe(kobo);
  });

  it.each(["12.345", "-500", "abc", "1,25.0.0", ""])("rejects %s", (input) => {
    expect(nairaToKobo(input)).toBeNull();
  });

  it("works out 7.5% VAT in kobo", () => {
    expect(vatOn(100000)).toBe(7500);
    expect(vatOn(133)).toBe(10); // 9.975 rounds to 10
    expect(vatOn(100000, 10)).toBe(10000);
  });
});

describe("states", () => {
  it("has the 36 states and the FCT, each unique", () => {
    expect(STATES).toHaveLength(37);
    expect(new Set(STATES.map((s) => s.name)).size).toBe(37);
    expect(new Set(STATES.map((s) => s.iso)).size).toBe(37);
  });

  it("has the right number of states in each geopolitical zone", () => {
    const zones = ["North Central", "North East", "North West", "South East", "South South", "South West"] as const;
    const counts = Object.fromEntries(zones.map((z) => [z, statesInZone(z).length]));
    expect(counts).toEqual({
      "North Central": 7, // 6 states + FCT
      "North East": 6,
      "North West": 7,
      "South East": 5,
      "South South": 6,
      "South West": 6,
    });
  });

  it("finds states by name, code or alias", () => {
    expect(findState("Lagos")?.capital).toBe("Ikeja");
    expect(findState("lagos state")?.iso).toBe("NG-LA");
    expect(findState("NG-RI")?.name).toBe("Rivers");
    expect(findState("ri")?.name).toBe("Rivers");
    expect(findState("FCT")?.capital).toBe("Abuja");
    expect(findState("Akwa Ibom")?.capital).toBe("Uyo");
    expect(findState("Atlantis")).toBeUndefined();
  });
});

describe("paystack", () => {
  const secret = "sk_test_abc123";
  const body = JSON.stringify({ event: "charge.success", data: { reference: "order-42", amount: 500000 } });
  const sign = (raw: string, key = secret) => createHmac("sha512", key).update(raw).digest("hex");

  it("accepts a correctly signed webhook body", () => {
    expect(verifyPaystackSignature(body, sign(body), secret)).toBe(true);
    expect(verifyPaystackSignature(Buffer.from(body), sign(body), secret)).toBe(true);
  });

  it("rejects tampered bodies, wrong keys and missing or malformed signatures", () => {
    expect(verifyPaystackSignature(body.replace("500000", "1"), sign(body), secret)).toBe(false);
    expect(verifyPaystackSignature(body, sign(body, "sk_test_other"), secret)).toBe(false);
    expect(verifyPaystackSignature(body, null, secret)).toBe(false);
    expect(verifyPaystackSignature(body, "not-hex", secret)).toBe(false);
    expect(verifyPaystackSignature(body, sign(body), "")).toBe(false);
  });

  it("tells test and live keys apart", () => {
    expect(paystackKeyMode("sk_test_abc123")).toBe("test");
    expect(paystackKeyMode("pk_live_xyz789")).toBe("live");
    expect(paystackKeyMode("rk_live_xyz")).toBeNull();
  });
});
