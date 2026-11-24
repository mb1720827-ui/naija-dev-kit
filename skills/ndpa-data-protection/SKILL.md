---
name: ndpa-data-protection
description: Use when a Nigerian app collects personal data - sign-up forms, KYC, BVN or NIN, health or financial details, analytics, privacy policies, account deletion, data exports or a data breach. Practical engineering checklist for the Nigeria Data Protection Act 2023.
---

# Personal data under the Nigeria Data Protection Act (NDPA) 2023

> This is an engineering checklist, not legal advice. For a product handling sensitive or large-scale data, have a lawyer or a licensed Data Protection Compliance Organisation review it.

The NDPA 2023 is enforced by the **Nigeria Data Protection Commission (NDPC)**. It applies to anyone processing personal data of people in Nigeria.

## What the law expects, turned into engineering tasks

| Principle | What to build |
|---|---|
| **Lawful basis** (consent, contract, legal obligation, vital interest, public interest or legitimate interest) | Record *why* you collect each field. When consent is the basis: unticked checkboxes, plain wording, and a stored record of when and what the user agreed to. |
| **Collect only what you need** | Remove form fields you don't use. Don't ask for BVN, NIN, date of birth or home address "just in case". |
| **Purpose limitation** | Don't reuse data for a new purpose (for example marketing) without a lawful basis for it. |
| **Storage limitation** | Set a retention period per table and delete or anonymise old data on a schedule. |
| **Security** | Row-level security, encryption in transit (HTTPS) and at rest, least-privilege keys, no secrets in client code, audit logs for admin access. |
| **Sensitive data** (health, religion, ethnicity, biometrics, sexual life and so on) | Explicit consent and extra protection. Avoid collecting it if you can. |

## Users' rights you must support

Build these as real features, not email-us-and-wait:

- **Access and export**: let a user download their data (JSON or CSV).
- **Correction**: let them edit their profile.
- **Deletion**: an in-app "Delete my account" that removes or anonymises their personal data. App stores also require this.
- **Withdraw consent and object**: unsubscribe and opt-out switches that actually stop the processing.

## BVN, NIN and other identity numbers

- Collect them only when a law or a partner (for example a bank) requires it.
- **Never log them**, and never put them in URLs, analytics events or error reports.
- Store them encrypted, or store only what you need (for example a verification result plus the last 4 digits).
- Show them masked: `*******4321`.

## Data breaches

- The NDPA requires notifying the **NDPC within 72 hours** of becoming aware of a breach that is likely to risk people's rights, and telling affected users without undue delay when the risk is high.
- Before launch, write a one-page plan: who decides, how you find affected users, who contacts the NDPC.

## Other obligations

- **Cross-border transfers**: data sent to servers abroad (most cloud regions) needs adequate protection. Document which providers and regions you use.
- **Registration**: organisations the NDPC classes as data controllers or processors "of major importance" must register with it. Check the current thresholds as you grow.

## Launch checklist

- [ ] Privacy notice in plain English: what you collect, why, how long, who you share with, how to contact you
- [ ] Every form field has a purpose; unused fields removed
- [ ] Consent checkboxes unticked by default, with consent recorded
- [ ] Row-level security on every table; no secret keys in the browser
- [ ] In-app account deletion and data export
- [ ] Identity numbers encrypted, masked and never logged
- [ ] Breach response plan written down
