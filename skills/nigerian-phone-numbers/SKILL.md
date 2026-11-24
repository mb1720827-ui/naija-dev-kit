---
name: nigerian-phone-numbers
description: Use when an app collects, validates, stores, displays or texts Nigerian phone numbers - sign-up forms, OTP/SMS, WhatsApp links, airtime or data top-ups, or detecting MTN/Airtel/Glo/9mobile.
---

# Nigerian phone numbers

People write the same number many ways: `0803 123 4567`, `+234 803 123 4567`, `2348031234567`, `+234 (0) 803-123-4567`. If you store them as typed, duplicate accounts and failed SMS follow.

## Rules

1. **Accept any common format, store one format: E.164** (`+2348031234567`). Normalise on the server, not just in the form.
2. **Display the local format** Nigerians recognise: `0803 123 4567`.
3. **Validate the national number**: 10 digits after `+234`, starting `70`, `80`, `81`, `90` or `91`.
4. **Use a unique index on the E.164 column**, so the same person can't sign up twice with different spellings.
5. **A prefix shows the ORIGINAL network only.** With mobile number portability, an `0803` number may now be on Airtel. Never choose the airtime/data network from the prefix alone: ask the user, and pre-fill your guess.

## With naija-dev-kit

```ts
import { formatPhoneLocal, normalizePhone, phoneNetwork } from "naija-dev-kit";

normalizePhone("0803 123 4567");      // "+2348031234567"
normalizePhone("+234 (0) 803-123-4567"); // "+2348031234567"
normalizePhone("0803 123 456");       // null (too short)
formatPhoneLocal("+2348031234567");   // "0803 123 4567"
phoneNetwork("0803 123 4567");        // "MTN" (original network: a hint, not a fact)
```

## Without the package

```ts
export function normalizePhone(input: string): string | null {
  let d = input.trim().replace(/[\s\-().]/g, "").replace(/^\+/, "");
  if (!/^\d+$/.test(d)) return null;
  if (d.startsWith("2340") && d.length === 14) d = d.slice(4);
  else if (d.startsWith("234") && d.length === 13) d = d.slice(3);
  else if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  else if (d.length !== 10) return null;
  return /^(70|80|81|90|91)\d{8}$/.test(d) ? `+234${d}` : null;
}
```

## Forms

- Use `<input type="tel" inputmode="tel" autocomplete="tel">`.
- Let people type `0803...`. Don't force them to type `+234`.
- Show the normalised number back ("We'll text 0803 123 4567") before sending an OTP.

## SMS and OTP

- Numbers on the Do-Not-Disturb (DND) list can block promotional SMS. Send OTPs through your SMS provider's **transactional/DND route**.
- Offer a fallback: a WhatsApp or voice OTP, or email.
- Rate-limit OTP requests per number and per IP. SMS costs money and is a common abuse target.

## WhatsApp links

`https://wa.me/2348031234567`: use the E.164 number without the `+`.
