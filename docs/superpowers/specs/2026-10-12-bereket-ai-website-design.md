# Bereket AI — Official Website Design

Date: 2026-10-12
Status: Draft, awaiting user review

## 1. Purpose and context

Bereket AI is a planned Turkish-language mobile app for farmers. A farmer sends a photo of their field; an AI returns suggestions, a success-rate estimate, and general farming help. The app does not exist yet.

This spec covers the **official website** that introduces the app. It has three goals, in priority order:

1. **Show the product** (credibility): interactive demo, feature overview.
2. **Collect interest**: farmer waitlist.
3. **Pitch to partners**: investors, cooperatives, agricultural chambers, pilot farms.

Audience: mainly farmers (mostly on phones, varying tech comfort), secondarily partners/investors.

Constraints: free hosting on Vercel, no custom domain yet (`*.vercel.app`), all visible text in Turkish, no backend of our own.

## 2. Decisions made

| Topic | Decision |
|---|---|
| Name | Bereket AI (kept in one config file; changeable) |
| Stack | Next.js (App Router) + Tailwind CSS, deployed on Vercel free tier |
| News | Manual: Markdown files in the repo, no feeds, no CMS |
| Weather | Open-Meteo (free, no API key), fetched through `lib/weather.ts` |
| Forms | Next.js API routes forwarding to a Google Apps Script endpoint that writes to Google Sheets |
| Demo | Scripted, no AI backend; data shaped so a live model can replace it later |
| Language | Turkish only |

Out of scope for launch: user accounts, CMS, multi-language, live AI demo, comments.

## 3. Architecture and pages

| Route | Content |
|---|---|
| `/` | Hero, How it works (3 steps), Features, Demo showcase, Weather teaser, Latest news (3), Partner CTA, Waitlist form, Footer |
| `/haberler` | News list |
| `/haberler/[slug]` | Article page |
| `/hava` | Full weather page: all 81 provinces, current conditions, 7-day forecast, farming hints |
| `/is-birligi` | Partner page: problem, solution, market, contact form |
| `/sss` | FAQ |
| `/hakkimizda` | About |
| `/gizlilik` | KVKK / privacy page |

### Units and boundaries

- `content/haberler/*.md`: news only. Front-matter: title, date, summary, cover image. Adding an article = adding a file.
- `config/site.ts`: name, tagline, colors, contact links.
- `data/demo-scenarios.ts`: demo photos and pre-written answers. Shape matches what a future live AI would return so the demo UI does not change.
- `lib/weather.ts`: the only code that talks to Open-Meteo. Also holds the weather-to-farming-hint logic (separate pure function, unit tested).
- `app/api/waitlist`, `app/api/partner`: the only code that talks to Google Sheets. Apps Script URL comes from a Vercel environment variable. Each form writes to its own sheet tab.

## 4. Visual design

- **Tone:** warm and trustworthy, not "tech startup."
- **Colors:** deep field green (primary), wheat/gold (accent), warm off-white background, soil-brown text. Dark mode follows system setting.
- **Type:** large readable sans-serif with full Turkish support (ş, ğ, ı, İ), e.g. Inter or Nunito. Body 18px+, large tap targets.
- **Imagery:** clearly marked placeholder images and phone mockups; the build lists every placeholder so real photos can be swapped in.
- **Logo:** placeholder wordmark "Bereket AI" with a wheat-ear icon.
- **Layout:** mobile-first. One CTA ("Erken erişim için kaydol") repeated in hero, mid-page and footer.

## 5. Demo showcase behavior

1. Phone frame shows 3-4 example field photos (e.g. wheat with rust, dry corn field, healthy sunflowers, olive grove with pests).
2. Visitor taps one; ~2s "analyzing" animation.
3. Answer appears: what the AI sees, diagnosis, 2-3 suggestions, success-rate gauge (e.g. "Hasat başarı tahmini: %78").
4. Visible label: "Örnek gösterim — gerçek uygulamada kendi tarlanızın fotoğrafını yükleyeceksiniz."
5. CTA to the waitlist below the demo.

Agronomic content must be reviewed by an agronomist before launch.

## 6. Weather widget

Defaults to the visitor's approximate city when location is allowed, otherwise Ankara. Shows temperature, rain chance, wind, and one plain-language farming hint (frost, heavy rain, spraying window). Responses cached ~10 minutes.

## 7. Error handling

- **Weather failure/slow:** friendly Turkish message with retry; rest of page unaffected.
- **Form failure:** preserve input, show Turkish error, offer contact email as fallback. Duplicate emails accepted silently.
- **Spam:** honeypot field plus per-IP rate limit in the API route; bots receive a fake success.
- **Invalid news Markdown:** build fails on bad front-matter so broken articles never ship.
- **Privacy:** waitlist form has a required KVKK consent checkbox linking to `/gizlilik`. Draft text provided; a lawyer must review it.

## 8. SEO, performance, accessibility

- `lang="tr"`, per-page titles/descriptions, Open Graph images (WhatsApp/social sharing), generated sitemap, article metadata.
- Optimized images, lazy-loaded demo and weather code, target Lighthouse 90+ on mobile.
- Keyboard navigation, alt text, sufficient contrast.

## 9. Testing

- Unit tests: weather-to-hint logic, form validation.
- Build check: validate all news Markdown front-matter.
- Playwright smoke tests: landing loads, demo flow works, waitlist submits (mocked endpoint), pages render at phone viewport.
- Manual pass on a real phone before launch.

## 10. Deploy

- GitHub repo connected to Vercel; push to `main` deploys, branches get preview URLs.
- Env var: Apps Script URL.
- Later domain: attach in the Vercel dashboard, no code changes.
- Owner setup: Google Sheet + Apps Script (script and instructions to be provided), Vercel and GitHub accounts.

## 11. Risks

- Vercel free tier is for non-commercial use; lead collection may count as commercial. Check current terms.
- Demo agronomy needs expert review.
- Name availability (trademark and domain) not yet checked.
- KVKK text needs legal review.
