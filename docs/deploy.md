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

These figures predate the November 2026 rebuild (the portal home on phones, the demo removed); re-measure on a quiet machine or on the Vercel preview before launch. Phones and tablets get the portal home and never load the wide-screen hero's images (they are lazy and hidden below 1280 px).

What keeps the home page fast: the scroll-reveal is CSS (no animation library on load), the hero's intro (GSAP) runs only on wide screens, the Hızlı menü's Sheet code loads on first tap, form validation (zod) loads on first submit, and only the heading font is preloaded.

## Pre-launch checklist

- [ ] **Accounts and Pazar**: see [accounts-and-market.md](accounts-and-market.md): Clerk production instance (needs your own domain), sign-up name fields, `ADMIN_USER_IDS`.

- [ ] **Agronomist review** of the weather hint thresholds (`lib/weather.ts` → `farmingHint`), sample news, and FAQ answers.
- [ ] **KVKK legal review** of `/gizlilik`: fill in the data controller, retention period, and the basis for transferring data abroad (Google Sheets); then remove the "Taslak" note.
- [ ] **Name check**: trademark search for "Çiftçi Destek" (TÜRKPATENT) and domain availability.
- [ ] **Replace placeholders**: see [placeholders.md](placeholders.md) (logo, contact e-mail, favicon).
- [ ] **Replace sample news** (marked "Örnek haber") with real posts on `/yonetim/haberler`, or delete them; the site handles zero articles.
- [ ] **Forms**: submit both forms on the live site and confirm rows appear in the sheet.
- [ ] **Real-phone test**: open the live URL on an actual Android phone (and an iPhone if possible) over mobile data; try the tab bar and Hızlı menü, the forum (open a topic, reply), Pazar, the weather and the question form on /sss.
- [ ] **Share preview**: paste the live URL into WhatsApp and check the preview image and title.
