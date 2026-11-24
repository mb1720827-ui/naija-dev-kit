---
name: paystack-payments
description: Use when adding payments to a Nigerian app with Paystack - checkout, one-time payments, webhooks, verifying transactions, subscriptions, payouts, bank lists or account-number lookup. Covers the server-side checks that stop fake or tampered payments.
---

# Paystack payments, done safely

Most broken Paystack integrations make the same mistakes: they trust the browser, skip webhook verification or use floats for money. Follow these rules in order.

## Rules

1. **The secret key never reaches the browser.** `PAYSTACK_SECRET_KEY` (`sk_...`) is server-only and must never get a `NEXT_PUBLIC_`/`VITE_` prefix. Only the public key (`pk_...`) may be in client code.
2. **The server decides the price.** Look up the amount from your database by product/order id. Never take an amount sent by the browser.
3. **Amounts are in kobo, as integers.** ₦5,000 is `500000`. Store money as whole kobo (`bigint` in Postgres). See the `naira-money` skill.
4. **A redirect back to your site is not proof of payment.** After the callback, verify the transaction from your server before giving value.
5. **Verify every webhook's signature** before reading it, using the raw request body.
6. **Fulfil idempotently.** The callback and the webhook can both arrive, and Paystack retries webhooks. Use a unique `reference` per order and only fulfil an order still marked `pending`.
7. **Test keys in development, live keys only in production.** Fail fast if a live key appears outside production (`paystackKeyMode` in `naija-dev-kit` returns `"test"` or `"live"`).

## 1. Start a payment (server)

```ts
// POST https://api.paystack.co/transaction/initialize
const res = await fetch("https://api.paystack.co/transaction/initialize", {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: user.email,
    amount: order.amount_kobo,          // from YOUR database, in kobo
    reference: order.reference,         // unique per order, saved before this call
    callback_url: `${siteUrl}/payments/callback`,
    metadata: { order_id: order.id },
  }),
});
const { status, data } = await res.json();
if (!status) throw new Error("Paystack initialize failed");
// Send the user to data.authorization_url (redirect), or use data.access_code with Paystack's inline popup.
```

## 2. Verify before giving value (server)

```ts
// GET https://api.paystack.co/transaction/verify/:reference
const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
  headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
});
const { data } = await res.json();
const paid =
  data?.status === "success" &&
  data.amount === order.amount_kobo &&   // the full amount, not a tampered one
  data.currency === "NGN" &&
  data.reference === order.reference;
if (paid) await fulfilOrder(order.id);   // idempotent: only acts if the order is still pending
```

## 3. Webhook (Next.js route handler)

```ts
// app/api/paystack/webhook/route.ts
import { verifyPaystackSignature } from "naija-dev-kit";

export async function POST(req: Request) {
  const raw = await req.text(); // the RAW body: don't parse first
  if (!verifyPaystackSignature(raw, req.headers.get("x-paystack-signature"), process.env.PAYSTACK_SECRET_KEY!)) {
    return new Response("Invalid signature", { status: 401 });
  }
  const event = JSON.parse(raw);
  if (event.event === "charge.success") {
    await fulfilByReference(event.data.reference, event.data.amount); // re-check the amount against the order
  }
  return new Response("ok"); // reply fast; do slow work after recording the event
}
```

Without the package, the check is: HMAC-SHA512 of the raw body using your secret key, hex-encoded, compared in constant time with the `x-paystack-signature` header.

## Fulfilment, shared by the callback and the webhook

```sql
-- Mark paid exactly once; returns no row if it was already paid.
update orders set status = 'paid', paid_at = now()
where reference = $1 and status = 'pending' and amount_kobo = $2
returning id;
```

Give value only when that statement returns a row.

## Banks and payouts

- **Never hardcode bank codes.** They change as banks merge or get new licences. Fetch `GET https://api.paystack.co/bank?country=nigeria` and cache it for a day.
- Confirm account names before paying out: `GET https://api.paystack.co/bank/resolve?account_number=...&bank_code=...`. Show the returned name to the user to confirm.

## Before you ship

- [ ] Secret key only on the server, with a test key in development
- [ ] Price looked up on the server, in kobo
- [ ] Callback verifies with `/transaction/verify` and checks amount, currency and reference
- [ ] Webhook signature verified on the raw body
- [ ] Fulfilment is idempotent (unique reference, `status = 'pending'` guard)
- [ ] Tested with Paystack's test cards, including a failed payment
- [ ] Webhook URL set in the Paystack dashboard for live mode, not only test mode

Check Paystack's docs for current fees, test cards and webhook retry behaviour. They change.
