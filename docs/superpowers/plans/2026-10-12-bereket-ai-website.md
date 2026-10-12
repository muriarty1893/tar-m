# Bereket AI Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the Turkish-language Bereket AI marketing site (landing, demo, news, weather, waitlist, partner pages) on Vercel's free tier.

**Architecture:** Next.js App Router site, mostly static. News comes from Markdown files read at build time. Weather is fetched from Open-Meteo through one module. Two API routes validate and forward form submissions to a Google Apps Script endpoint that writes to Google Sheets. The demo is scripted data behind a swappable shape.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, zod, gray-matter + remark/remark-html, Vitest, Playwright, npm.

**Spec:** `docs/superpowers/specs/2026-10-12-bereket-ai-website-design.md`

## Global Constraints

- All visible text is Turkish; `<html lang="tr">`.
- Brand name "Bereket AI" appears only via `config/site.ts` (`siteConfig.name`).
- Colors: deep field green (primary), wheat/gold (accent), warm off-white background, soil-brown text; dark mode follows system setting. Body text 18px or larger.
- Fonts must support ş ğ ı İ ç ö ü (Inter or Nunito via `next/font`).
- Waitlist CTA label: "Erken erişim için kaydol".
- Demo disclaimer, verbatim: "Örnek gösterim — gerçek uygulamada kendi tarlanızın fotoğrafını yükleyeceksiniz."
- Weather API: Open-Meteo only, no API key, responses cached ~10 minutes.
- Apps Script URL only via env var `APPS_SCRIPT_URL`; never in client code.
- Waitlist form requires a KVKK consent checkbox linking to `/gizlilik`.
- Out of scope: accounts, CMS, multi-language, live AI demo, comments.
- Placeholder images must be clearly marked and listed in `docs/placeholders.md`.

## Review Focus

- Turkish casing: province search and news slugs must handle İ/ı/Ş/Ğ (searching "istanbul", "ISPARTA", "Şanlıurfa" finds the right province).
- Weather API returns partial/null fields or fails: widget shows the retry message, never `NaN` or a blank area.
- Geolocation denied or unavailable: widget falls back to Ankara.
- Form input: whitespace-only name, uppercase email, missing consent, oversized message (>2000 chars), honeypot filled: each handled per spec, with no crash.
- News: future-dated article, two articles with the same date, article without a cover image: list and page still render, with deterministic order.
- Apps Script endpoint returns non-200 or times out: API route returns an error the form can show, input is preserved.

---

### Task 1: Scaffold, config, layout, test tooling

**Files:**
- Create: Next.js project at repo root, `config/site.ts`, `components/Header.tsx`, `components/Footer.tsx`, `docs/placeholders.md`, `vitest.config.ts`, `playwright.config.ts`, `.env.example`
- Modify: `app/layout.tsx`, `app/globals.css`
- Test: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `siteConfig: { name: string; tagline: string; contactEmail: string; ctaLabel: string; nav: { label: string; href: string }[] }` exported from `config/site.ts`. Tailwind theme tokens `primary`, `accent`, `surface`, `ink` (with dark variants). `<Header/>` and `<Footer/>` used by the layout.

- [ ] **Step 1:** `git init`, add `.gitignore` (node_modules, .next, .env*.local), then scaffold with `npx create-next-app@latest` (TypeScript, Tailwind, App Router, no src dir, npm). If it refuses because `docs/` exists, scaffold in a temp dir and move the files in.
- [ ] **Step 2:** Install `zod gray-matter remark remark-html` and dev `vitest @playwright/test`; add `npm test` (vitest run) and `npm run e2e` (playwright test) scripts.
- [ ] **Step 3:** Write failing e2e test `home page has Turkish lang, brand name and CTA`: loads `/`, asserts `html[lang=tr]`, the header contains `siteConfig.name`, and a link with text "Erken erişim için kaydol" exists. Run `npm run e2e`; expect FAIL.
- [ ] **Step 4:** Implement `config/site.ts`, theme tokens in `app/globals.css`/Tailwind config, font via `next/font`, `Header` (nav from `siteConfig.nav`, mobile menu), `Footer` (contact email, links to `/gizlilik`, `/sss`), root layout with `lang="tr"`, and a stub `app/page.tsx` containing the CTA link to `#kayit`.
- [ ] **Step 5:** Run `npm run e2e`; expect PASS. Run `npm run build`; expect success.
- [ ] **Step 6:** Commit: `feat: scaffold Next.js site with theme, layout and test tooling`.

### Task 2: News (content loader, list, article pages)

**Files:**
- Create: `lib/news.ts`, `content/haberler/ornek-1.md` (+2 more samples), `app/haberler/page.tsx`, `app/haberler/[slug]/page.tsx`, `components/NewsCard.tsx`
- Test: `tests/unit/news.test.ts`

**Interfaces:**
- Produces:
  - `type Article = { slug: string; title: string; date: string; summary: string; cover?: string; html: string }`
  - `getAllArticles(dir?: string): Promise<Article[]>` sorted newest first, ties broken by slug ascending; throws `Error` naming the file when front-matter lacks `title`, `date` (valid ISO date) or `summary`.
  - `getArticle(slug: string, dir?: string): Promise<Article | null>`
  - `<NewsCard article={Article}/>` (reused by the landing page, Task 6).

- [ ] **Step 1:** Write failing tests against fixture dirs under `tests/fixtures/news-*`: sorted newest first; same-date tie sorted by slug; missing `title` throws with the file name in the message; invalid date throws; missing `cover` is allowed; unknown slug returns `null`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/news.test.ts`; expect FAIL.
- [ ] **Step 3:** Implement `lib/news.ts` with gray-matter for front-matter and remark-html for the body. Default `dir` is `content/haberler`. Slug is the filename without `.md`.
- [ ] **Step 4:** Run the tests; expect PASS.
- [ ] **Step 5:** Write three realistic Turkish sample articles (clearly marked as samples in the front-matter summary), then implement `/haberler` (grid of `NewsCard`, empty-state text "Henüz haber yok.") and `/haberler/[slug]` using `generateStaticParams`, `generateMetadata` (title, description, OG), and `notFound()` for unknown slugs.
- [ ] **Step 6:** Add e2e: `/haberler` lists the sample articles and clicking one opens its page. Run `npm run build && npm run e2e`; expect PASS.
- [ ] **Step 7:** Commit: `feat: add manual news section with validated markdown`.

### Task 3: Weather (module, hints, widget, /hava)

**Files:**
- Create: `lib/weather.ts`, `data/provinces.ts`, `components/WeatherWidget.tsx`, `app/hava/page.tsx`
- Test: `tests/unit/weather.test.ts`, `tests/unit/provinces.test.ts`

**Interfaces:**
- Produces:
  - `type DailyForecast = { date: string; min: number; max: number; rainProb: number; rainMm: number; windMax: number }`
  - `type Forecast = { current: { temp: number; wind: number; code: number }; daily: DailyForecast[] }`
  - `type FarmingHint = { kind: 'frost' | 'rain' | 'spray' | 'normal'; text: string }`
  - `fetchForecast(lat: number, lon: number, fetchImpl?: typeof fetch): Promise<Forecast>` calls Open-Meteo `forecast` with `current` and 7 `daily` days, `timezone=auto`; throws on non-200 or on missing/non-finite numeric fields; Next fetch option `revalidate: 600`.
  - `farmingHint(day: DailyForecast): FarmingHint`
  - `provinces: { name: string; lat: number; lon: number }[]` (all 81, Turkish names) and `findProvinces(query: string): Province[]` (Turkish-locale case-insensitive, diacritic-insensitive match).
  - `<WeatherWidget compact?: boolean/>` client component, default city Ankara.

Hint rules (first match wins; these thresholds are a launch default for expert review):
1. `frost` if `min <= 0` → "Don riski var: hassas ürünleri koruyun."
2. `rain` if `rainMm >= 20` or `rainProb >= 80` → "Yoğun yağış bekleniyor: ilaçlama ve sulamayı erteleyin."
3. `spray` if `windMax < 15` and `rainProb < 20` → "İlaçlama için uygun bir gün."
4. else `normal` → "Tarla işleri için genel koşullar normal."

- [ ] **Step 1:** Write failing tests: `farmingHint` returns each kind at its boundary (min 0 → frost, min 0.1 → not frost, rainMm 20 → rain, rainProb 79 vs 80, windMax 14.9 vs 15 with rainProb 19 vs 20) with the exact strings above; precedence (frost + rain → frost); `fetchForecast` with an injected fake fetch parses a fixture response, throws on HTTP 500, throws when a `daily` temperature is `null`; `findProvinces("istanbul")`, `("ISPARTA")`, `("sanliurfa")` each return the correct province; `provinces.length === 81`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/weather.test.ts tests/unit/provinces.test.ts`; expect FAIL.
- [ ] **Step 3:** Implement `lib/weather.ts` and `data/provinces.ts`. Use `toLocaleLowerCase('tr')` plus an ASCII-fold map for matching.
- [ ] **Step 4:** Run the tests; expect PASS.
- [ ] **Step 5:** Implement `WeatherWidget`: on mount, if `navigator.geolocation` yields a position, pick the nearest province; on denial/error/timeout use Ankara. Shows temp, rain chance, wind and today's hint. On fetch error show "Hava durumu şu an alınamadı" with a "Tekrar dene" button. Implement `/hava` with a province search box (`findProvinces`), current conditions, a 7-day list and per-day hints.
- [ ] **Step 6:** Add e2e with Playwright route-mocking of `api.open-meteo.com`: widget shows mocked temperature; with the mock returning 500, the error message and retry button appear. Run `npm run e2e`; expect PASS.
- [ ] **Step 7:** Commit: `feat: add weather module, farming hints, widget and /hava page`.

### Task 4: Forms and Sheets backend

**Files:**
- Create: `lib/forms.ts`, `lib/rateLimit.ts`, `app/api/waitlist/route.ts`, `app/api/partner/route.ts`, `components/WaitlistForm.tsx`, `components/PartnerForm.tsx`, `docs/apps-script.md`, `docs/apps-script/Code.gs`
- Test: `tests/unit/forms.test.ts`, `tests/unit/api.test.ts`

**Interfaces:**
- Produces:
  - `waitlistSchema` (zod): `name` (trimmed, 2-100), `email` (trimmed, lowercased, valid), `city?` (≤100), `crop?` (≤100), `consent` (must be `true`), `website` (honeypot, any string).
  - `partnerSchema`: `name`, `organization` (2-150), `email`, `phone?`, `type` (`'yatirimci' | 'kooperatif' | 'oda' | 'ciftlik' | 'diger'`), `message` (trimmed, 10-2000), `website` (honeypot).
  - `checkRateLimit(key: string, limit?: number, windowMs?: number): boolean` (true = allowed; in-memory, default 5 per 10 min; best-effort on serverless).
  - `POST /api/waitlist` and `POST /api/partner` take JSON and return `{ ok: true }` (200), `{ ok: false, error: 'validation' }` (400), `{ ok: false, error: 'rate' }` (429) or `{ ok: false, error: 'upstream' }` (502). Honeypot filled → 200 `{ ok: true }` with **no** forward. Forwarding is `fetch(process.env.APPS_SCRIPT_URL, POST JSON)` with `{ sheet: 'waitlist' | 'partner', ...fields, submittedAt }`, 8 s timeout; non-200 or timeout → `upstream`.
  - `<WaitlistForm/>` (anchor id `kayit`) and `<PartnerForm/>`, client components that preserve input on error.

- [ ] **Step 1:** Write failing schema tests: whitespace-only name rejected; `"  Ali@Example.COM "` normalises to `ali@example.com`; `consent: false` rejected; 2001-char message rejected; Turkish names ("Şükrü Çağlar") accepted.
- [ ] **Step 2:** Write failing API tests calling the route handlers with a mocked global `fetch`: valid body forwards once and returns 200; honeypot filled returns 200 and `fetch` is not called; invalid body returns 400; sixth request from the same IP returns 429; mocked upstream 500 and a mocked timeout both return 502; duplicate email submissions both return 200.
- [ ] **Step 3:** Run `npx vitest run tests/unit/forms.test.ts tests/unit/api.test.ts`; expect FAIL.
- [ ] **Step 4:** Implement `lib/forms.ts`, `lib/rateLimit.ts` (key = first `x-forwarded-for` entry) and both routes.
- [ ] **Step 5:** Run the tests; expect PASS.
- [ ] **Step 6:** Implement both form components. Errors: "Bir sorun oluştu, lütfen tekrar deneyin" plus the `siteConfig.contactEmail` fallback; success message "Teşekkürler! Sizi bilgilendireceğiz." The consent label links to `/gizlilik`. Render the honeypot as a visually hidden, `tabIndex=-1`, `autoComplete=off` input.
- [ ] **Step 7:** Write `docs/apps-script/Code.gs` (`doPost` appends a row to the sheet tab named by `sheet`) and `docs/apps-script.md` (step-by-step: create sheet with `waitlist` and `partner` tabs, deploy as web app, set `APPS_SCRIPT_URL` in `.env.local` and Vercel). Add `.env.example`.
- [ ] **Step 8:** Add e2e with the API routes mocked: filling the waitlist form shows the success message; a mocked 502 shows the error and keeps the typed values. Run `npm run e2e`; expect PASS.
- [ ] **Step 9:** Commit: `feat: add waitlist and partner forms with Sheets forwarding`.

### Task 5: Scripted demo showcase

**Files:**
- Create: `data/demo-scenarios.ts`, `components/DemoShowcase.tsx`, `components/SuccessGauge.tsx`, `public/demo/*.svg` (placeholders)
- Test: `tests/unit/demo.test.ts`

**Interfaces:**
- Produces:
  - `type DemoScenario = { id: string; title: string; imageSrc: string; imageAlt: string; seen: string; diagnosis: string; suggestions: string[]; successRate: number }` (`successRate` is 0-100; `suggestions` has 2-3 items). This is also the contract a future live AI must return.
  - `demoScenarios: DemoScenario[]` with exactly 4: wheat with rust, dry corn field, healthy sunflowers, olive grove with pests. Turkish content.
  - `<DemoShowcase/>`: phone frame, thumbnails, ~2 s "Analiz ediliyor…" state, then the answer, the `SuccessGauge`, the verbatim disclaimer from Global Constraints, and a CTA to `#kayit`.

- [ ] **Step 1:** Write failing data tests: 4 scenarios; unique ids; every `successRate` between 0 and 100; every scenario has 2-3 suggestions; every `imageSrc` file exists under `public/`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/demo.test.ts`; expect FAIL.
- [ ] **Step 3:** Write `demoScenarios` and the placeholder SVGs (each visibly labeled "Örnek görsel"); list them in `docs/placeholders.md`. Mark in a code comment that the agronomic text needs expert review before launch.
- [ ] **Step 4:** Run the tests; expect PASS.
- [ ] **Step 5:** Implement `DemoShowcase` and `SuccessGauge` (accessible: `role="meter"` with aria values; respects `prefers-reduced-motion` by skipping the animation delay's motion, not the result). Switching scenarios mid-analysis cancels the pending timer.
- [ ] **Step 6:** Add e2e: tapping a scenario shows "Analiz ediliyor…" then the diagnosis, gauge and the verbatim disclaimer; tapping a second scenario mid-analysis shows only the second answer. Run `npm run e2e`; expect PASS.
- [ ] **Step 7:** Commit: `feat: add scripted demo showcase`.

### Task 6: Landing page and static pages

**Files:**
- Create: `components/Hero.tsx`, `components/HowItWorks.tsx`, `components/Features.tsx`, `components/PartnerCta.tsx`, `app/is-birligi/page.tsx`, `app/sss/page.tsx`, `app/hakkimizda/page.tsx`, `app/gizlilik/page.tsx`
- Modify: `app/page.tsx`
- Test: `tests/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: `DemoShowcase`, `WeatherWidget`, `NewsCard`/`getAllArticles` (latest 3), `WaitlistForm`, `PartnerForm`, `siteConfig`.
- Produces: the full landing section order from the spec: Hero, How it works (3 steps: photo, AI analysis, advice), Features (crop/disease detection, success-rate estimate, planting and irrigation advice, farming calendar), Demo, Weather teaser, Latest news, Partner CTA, Waitlist, Footer.

- [ ] **Step 1:** Write failing e2e in `tests/e2e/pages.spec.ts`: `/` contains each section heading in order; every route (`/haberler`, `/hava`, `/is-birligi`, `/sss`, `/hakkimizda`, `/gizlilik`) returns 200 with a unique `<title>`; no horizontal scroll at 375 px width on `/`.
- [ ] **Step 2:** Run `npm run e2e`; expect FAIL.
- [ ] **Step 3:** Implement the section components and compose `app/page.tsx`. Hero repeats the CTA; the CTA also appears mid-page and in the footer. Write Turkish copy; the partner page covers problem, solution, market and `PartnerForm`; the FAQ has at least 6 questions; `/gizlilik` is a KVKK draft carrying a visible note "Taslak — hukuki inceleme gereklidir."
- [ ] **Step 4:** Run `npm run build && npm run e2e`; expect PASS.
- [ ] **Step 5:** Commit: `feat: compose landing page and static pages`.

### Task 7: SEO, performance, accessibility, deploy docs

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `docs/deploy.md`, `README.md`
- Modify: `app/layout.tsx` (default metadata, `metadataBase` from `NEXT_PUBLIC_SITE_URL`)
- Test: `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consumes: `getAllArticles` for sitemap entries.
- Produces: `/sitemap.xml` listing all static routes plus every article; `/robots.txt`; a branded default OG image.

- [ ] **Step 1:** Write failing e2e: `/sitemap.xml` contains `/haberler` and each sample article slug; `/` has `og:title`, `og:image` and `meta[name=description]`; an article page has its own title.
- [ ] **Step 2:** Run `npm run e2e`; expect FAIL.
- [ ] **Step 3:** Implement sitemap, robots, OG image and default metadata. `NEXT_PUBLIC_SITE_URL` falls back to `http://localhost:3000`.
- [ ] **Step 4:** Run `npm run e2e`; expect PASS. Run Lighthouse (mobile) against `npm run build && npm start`; target 90+ for Performance, Accessibility, Best Practices and SEO; fix any category below 90 or record the reason in `docs/deploy.md`.
- [ ] **Step 5:** Write `docs/deploy.md` (GitHub repo, Vercel import, env vars `APPS_SCRIPT_URL` and `NEXT_PUBLIC_SITE_URL`, attaching a domain later, Vercel free-tier non-commercial-use warning, pre-launch checklist: agronomist review, KVKK legal review, name/trademark/domain check, replace placeholder images, real-phone test) and a short `README.md`.
- [ ] **Step 6:** Commit: `feat: add SEO metadata, sitemap, OG image and deploy docs`.
