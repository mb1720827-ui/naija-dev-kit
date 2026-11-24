---
name: naira-money
description: Use when an app stores, calculates, parses or displays naira amounts - prices, carts, wallets, invoices, VAT, budgets, Paystack amounts or any column holding money in Nigeria.
---

# Naira and money

## Rules

1. **Store whole kobo, never floats.** ₦1 = 100 kobo. In JavaScript `0.1 + 0.2 !== 0.3`, and those errors add up in carts and wallets. Use `bigint` columns in Postgres (`amount_kobo bigint not null check (amount_kobo >= 0)`) and integers in code.
2. **Name columns with the unit**: `price_kobo`, not `price`.
3. **Do all maths in kobo**, then format once for display.
4. **Parse user input as text**, not with `parseFloat`: "₦1,250.50" → `125050`.
5. **Paystack amounts are already in kobo.** Don't multiply them by 100 twice.
6. **Round once, at a clear step** (for example VAT per line or per invoice), and state which in your code.

## With naija-dev-kit

```ts
import { formatNaira, nairaToKobo, vatOn } from "naija-dev-kit";

formatNaira(125050);                    // "₦1,250.50"
formatNaira(125050, { showKobo: false }); // "₦1,251"
nairaToKobo("₦1,250.50");               // 125050
nairaToKobo("N1250");                   // 125000
nairaToKobo("12.345");                  // null (more than 2 decimal places)
vatOn(100000);                          // 7500 (7.5% VAT on ₦1,000)
```

## Without the package

```ts
const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });
export const formatNaira = (kobo: number) => ngn.format(kobo / 100);
```

## VAT

Nigeria's VAT rate is **7.5%** (2026). Keep the rate in one constant so a change is one edit. Show whether prices include VAT.

## Display

- `₦` is right for Nigerian users. Some older Android fonts lack the glyph, so if you use a custom font, check that it includes `₦` or fall back to `NGN`.
- Show large balances with separators: `₦1,250,000.00`.
- Tables of amounts: use `font-variant-numeric: tabular-nums` (Tailwind `tabular-nums`) so digits line up.

## Checklist

- [ ] Every money column is an integer in kobo, with the unit in its name
- [ ] No `parseFloat` on money input
- [ ] Totals computed in kobo and formatted once
- [ ] VAT rate in one constant
