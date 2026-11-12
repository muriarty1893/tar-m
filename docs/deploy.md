# Deploying Çiftçi Destek to Vercel (free tier)

## 1. Put the code on GitHub

1. Create an empty repository on <https://github.com/new> (private is fine), e.g. `bereket-ai-web`. Don't add a README.
2. In this folder:

   ```bash
   git remote add origin https://github.com/<your-user>/bereket-ai-web.git
   git push -u origin main
   ```

## 2. Import the project on Vercel

1. Sign in at <https://vercel.com> with GitHub (the free "Hobby" plan).
2. **Add New… → Project**, pick the repository, and keep the detected settings (Framework: Next.js, build `npm run build`).
3. Before clicking **Deploy**, open **Environment Variables** and add:

   | Name | Value | Notes |
   |---|---|---|
   | `APPS_SCRIPT_URL` | your Apps Script `/exec` URL | see [apps-script.md](apps-script.md) |
   | `APPS_SCRIPT_SECRET` | the `SECRET` script property | must match exactly |
   | `NEXT_PUBLIC_SITE_URL` | e.g. `https://bereket-ai.vercel.app` | optional: if omitted, Vercel's production domain is used automatically |

4. Deploy. You get a URL like `https://bereket-ai.vercel.app` (the exact name depends on availability; you can rename it under **Settings → Domains**).

From then on, every push to `main` deploys to production, and every other branch gets its own preview URL.

## 3. Adding a domain later

Buy the domain anywhere. In Vercel: **Settings → Domains → Add**, then set the DNS records Vercel shows. Update `NEXT_PUBLIC_SITE_URL` to the new domain and redeploy. No code changes are needed.

## ⚠️ Vercel free tier and commercial use

Vercel's Hobby plan is for **non-commercial, personal use**. A pre-launch site that collects sign-ups and partner/investor leads for a company may count as commercial. Check the current terms at <https://vercel.com/legal/terms> before relying on it. If it applies, the Pro plan or another host (Netlify, Cloudflare Pages) are the alternatives.

## Lighthouse (mobile) results at handoff

Measured locally against `npm run build && npm start` with Lighthouse 12.8.2, mobile preset, after the Organik Doğa redesign. Scores vary ±5 between runs on the same laptop, so the table shows the range of 3 runs:

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | 90–91 | 100 | 100 | 100 |
| `/hava` | 90–94 | 100 | 100 | 100 |
| `/haberler` | 94–99 | 100 | 100 | 100 |
| `/is-birligi` | 97 | 100 | 100 | 100 |
| `/sss` | 93–94 | 100 | 100 | 100 |

These figures predate the November 2026 rebuild (the Borsa design on every page; the home is the portal on every screen, without the old landing page's hero and pricing); re-measure on a quiet machine or on the Vercel preview before launch.

What keeps the home page fast: no animation library on load, the Hızlı menü's Sheet code loads on first tap, form validation (zod) loads on first submit, and only Fira Sans is preloaded (Fira Code, for figures, loads on use).

## Pre-launch checklist

- [ ] **Custom domain** (do this first; the Clerk switch below needs it). Buy one (e.g. `ciftcidestek.com` or `.com.tr`, a few hundred lira a year), or use one you own. Vercel → **Settings → Domains → Add**, set the DNS records it shows, then set `NEXT_PUBLIC_SITE_URL` to the new address and redeploy (see "Adding a domain later" above). The share previews, sitemap and the news bot's User-Agent all follow `NEXT_PUBLIC_SITE_URL`.
- [ ] **Clerk production keys.** The live site still runs on Clerk *development* keys (`pk_test_…`; every request logs "Clerk … connected to development instances"), which have strict usage limits. Production is free on Clerk's Hobby plan (50,000 monthly retained users as of Feb 2026; check clerk.com/pricing). Steps: Clerk dashboard → create the production instance → add its DNS records to the custom domain → put the new `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in Vercel (and `.env.local`) → redeploy. Know before switching:
  - Production is a separate instance: existing accounts (Murat, Nezih, test accounts) sign up again, and their old profiles, posts and ads must be linked to the new user ids (`profiles.user_id` and the tables that reference it), or they're orphaned.
  - Google sign-in needs its own Google OAuth credentials in production.
  - Update `ADMIN_USER_IDS` in Vercel to the new admin user ids (or rely on `ADMIN_EMAILS`).
- [ ] **Images on news and supports.** Imported items (TKDK, Ministry; `lib/services/news-import.ts`) have no cover, so lists show a newspaper icon. The sources' own photos are left out on purpose (copyright), so pick one of:
  - a set of our own cover images per label (Destek / Haber / Duyuru) or per topic (hayvancılık, bitkisel üretim, IPARD…), chosen by keywords in the title; free-licence photos (Wikimedia Commons, credited on `/kaynaklar`) or made for the site;
  - or permission from TKDK / the Ministry to show their photos, then take the article's main image.
  Hand-written articles can already have a cover (Yönetim → Haberler → editor).
- [ ] **Shared rate limits.** `lib/rateLimit.ts` counts in memory per server instance, so on Vercel the limits on contact forms, photo uploads and view counts reset whenever an instance restarts and aren't shared between instances. Move them to a shared store (e.g. Upstash Redis from the Vercel Marketplace; free at this size).
- [ ] **Accounts and Pazar**: see [accounts-and-market.md](accounts-and-market.md): sign-up name fields, `ADMIN_USER_IDS`.

- [ ] **Agronomist review** of the weather hint thresholds (`lib/weather.ts` → `farmingHint`), sample news, and FAQ answers.
- [ ] **KVKK legal review** of `/gizlilik`: fill in the data controller, retention period, and the basis for transferring data abroad (Google Sheets); then remove the "Taslak" note.
- [ ] **Name check**: trademark search for "Çiftçi Destek" (TÜRKPATENT) and domain availability.
- [ ] **Replace placeholders**: see [placeholders.md](placeholders.md) (logo, contact e-mail, favicon).
- [ ] **Replace sample news** (marked "Örnek haber") with real posts on `/yonetim/haberler`, or delete them; the site handles zero articles.
- [ ] **Forms**: submit both forms on the live site and confirm rows appear in the sheet.
- [ ] **Real-phone test**: open the live URL on an actual Android phone (and an iPhone if possible) over mobile data; try the tab bar and Hızlı menü, the forum (open a topic, reply), Pazar, the weather and the question form on /sss.
- [ ] **Share preview**: paste the live URL into WhatsApp and check the preview image and title.
