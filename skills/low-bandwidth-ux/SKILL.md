---
name: low-bandwidth-ux
description: Use when building a web app for users in Nigeria or other places where mobile data is expensive and connections are slow or patchy - page weight, images, loading states, retries, offline tolerance and cheap Android phones.
---

# Building for expensive data and slow networks

Most Nigerian users browse on mid-range Android phones, pay for data by the megabyte and lose signal often. A 5 MB page costs them real money. Design for that from the start.

## Budget

- **First load under ~500 KB** (HTML + CSS + JS + images, compressed). Check it in DevTools › Network with "Disable cache" on.
- **Test on "Slow 4G" or "3G" throttling** and a 4× CPU slowdown, not only on your laptop's Wi-Fi.

## Rules

1. **Render on the server; ship less JavaScript.** Prefer server components and plain HTML forms. Every client library is data the user pays for.
2. **One request per user action.** Batch writes. For example, save a whole quiz session at the end instead of after every answer.
3. **Images:** serve WebP/AVIF at the size shown (`next/image` with `sizes`), lazy-load below the fold, and never autoplay video.
4. **Fonts:** use the system font stack or one subset web font. Icon fonts are a heavy way to show a few icons.
5. **Make retries safe.** Networks drop mid-request. Give every write an idempotency key or a unique reference so a retry can't charge twice or create duplicates.
6. **Keep what the user typed.** If a submit fails, the form must still hold their input. Never clear it on error.
7. **Show progress honestly.** For uploads and long tasks, show a progress bar with steps, not an endless spinner.
8. **Cache static assets for a long time** (hashed filenames + `Cache-Control: immutable`), so repeat visits cost almost nothing.
9. **Let people start without signing up.** Sign-up costs a round trip and an OTP SMS. Ask only when there's something to save.

## Quick wins checklist

- [ ] First load under 500 KB; tested on throttled 3G
- [ ] No autoplay video; images sized and lazy-loaded
- [ ] Writes are idempotent and batched
- [ ] Failed submits keep the user's input
- [ ] Core flow works without an account
- [ ] Text readable at 360 px wide; tap targets at least 44 px

## Beyond the web

For users with feature phones or no data, consider **USSD** or **WhatsApp** for the core action (check a balance, confirm an order), with the web app for everything else.
