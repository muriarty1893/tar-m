# Çiftçi Destek: where everything is (handover, 22 Nov 2026)

Paste this whole file into a new Claude Code session opened in `C:\Users\murat\Desktop\projects\tarım` to pick up where we left off.

## Links
| What | Where |
|---|---|
| Live site | https://www.ciftcidestek.com.tr (the bare domain redirects here). The old address https://tar-m-flame.vercel.app still works. |
| Admin panel | https://www.ciftcidestek.com.tr/yonetim (tabs: Genel, Haftalık rapor, İstatistikler, Üyeler, Haberler, Forum, Şikâyetler, Reklam, Kayıtlar) |
| Code | GitHub `muriarty1893/tar-m`, branch `main`. Every push to main deploys to production. |
| Hosting | https://vercel.com/murat-eker-s-projects/tar-m (Deployments, Analytics, Settings → Environment Variables, Domains) |
| DNS records | Vercel → Domains → ciftcidestek.com.tr. Registrar: hosting.com.tr (Nezih's account; nameservers only, no record editor). |
| Sign-in (Clerk) | Vercel → Integrations → Clerk → Open in Clerk. App `ciftci-destek-auth`; make sure the top says **production**. |
| Google login | https://console.cloud.google.com, project "ciftci destek" (OAuth client used by Clerk) |
| Email | iletisim@ciftcidestek.com.tr: https://mail.zoho.eu (Zoho Mail Free, EU) |
| AdSense | https://adsense.google.com, publisher `ca-pub-2700840139246145` |
| Database | Neon Postgres (through Vercel Storage), shared by local and production |

## Done
- Domain on Vercel DNS with HTTPS; www is the main address.
- Contact email moved to `iletisim@ciftcidestek.com.tr` on Zoho (MX, SPF, DKIM, DMARC records in Vercel).
- Clerk production is live, with Google sign-in on custom credentials. Murat's old content was remapped with `npm run users:remap -- --apply`.
- Vercel Web Analytics is on. Yönetim → İstatistikler and Haftalık rapor read it through `VERCEL_ANALYTICS_TOKEN` (Production, sensitive; a full-access Vercel token that expires around Nov 2027).
- The forum ♥ now creates the member's profile first; the statistics totals now include today.
- **AdSense is on and under review** (checkpoint 22 Nov, commit `367bef0` and later). `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-2700840139246145` is set in Vercel Production. The live site serves the `google-adsense-account` meta tag and `/ads.txt`. The consent box was tested in a browser: Reddet loads nothing, Kabul et loads AdSense, the footer's "Reklam tercihleri" reopens it, and the sign-in page shows no box. In AdSense the site is verified, the payment info is filled in, and it says "Siteniz reklam yayını için hazırlanıyor".
- 23 Nov: Pazar copies sahibinden.com's layout (showcase, results table, listing page, 4-step İlan ver), in the site's colours.
- 23 Nov: **Ads use the site's own strips** (`components/ads/AdStrip.tsx`, 320×100 on phones, 728×90 wider; home, Pazar results, news and forum posts) filled by the display unit `NEXT_PUBLIC_ADSENSE_SLOT=8736089655` (Production). In AdSense, Auto ads is on with only Sabit (anchor) and side rails; Vinyet and in-page Banner are off. **Ads now show to every visitor** (owner's choice): Kabul et → personalised, otherwise non-personalised; the banner and /gizlilik say so. KVKK risk noted to the owner.
- 23 Nov: **Form messages are saved in the database** (`submissions` table) and read in **Yönetim → Başvurular** (İş birliği, Sorular, "Bizi nereden duydunuz?" counts); the dashboard shows the unread count. The Google Sheets / Apps Script route was never connected, so 8 earlier submissions (Oct 15 – Nov 23) were lost.

## Open, in order
1. **Next.js security upgrade.** `next build` reported that 16.4.4 "is affected by a known security vulnerability". Run `npx next upgrade --agent=security` on its own branch or worktree, then tsc, vitest and a full `next build` with `NEXT_PUBLIC_ADSENSE_CLIENT` set, and merge on the user's yes. It's in `docs/deploy.md` too.
2. **Nezih** signs up again at /kayit with nezihkarakoc01@hotmail.com, then run `npm run users:remap` (preview), then `-- --apply` after the user says yes.
3. **Wait for AdSense approval** (email, or AdSense → Siteler shows "Hazır"). Then check on a phone that the ad strips fill (don't click them). If it's rejected (usually "low-value content"), do item 4 and reapply.
4. Before launch, and ideally before Google's review: `npm run demo:remove` (asks first, since it writes to the live database); replace the sample prices on /fiyatlar and the sample sponsor strip; get a lawyer's review of the /gizlilik KVKK text. See `docs/deploy.md` for the full pre-launch list.
5. **Vercel Hobby is non-commercial.** Plan on Vercel Pro (~$20/month) before ads actually earn money.
6. Delete the "test" news post and the old "erken erişim" article in Yönetim → Haberler. If the article goes, update the redirect in `next.config.ts` and `tests/e2e/seo.spec.ts`.
7. Later: the mobile app needs Clerk → Native applications turned on (Android `tr.com.ciftcidestek.app`, redirect `ciftcidestek://`). Then the vercel.app copy can be kept out of Google (noindex). Optionally, AdSense → Gizlilik ve mesajlaşma → Avrupa düzenlemeleri for EU visitors.

## Starting on another computer (or the Claude Code CLI)
Everything above lives in Git, so it works anywhere. Secrets and logins don't travel; set them up once per computer:
```powershell
git clone https://github.com/muriarty1893/tar-m.git
cd tar-m
npm ci
npm i -g vercel
vercel login
vercel link --yes --project tar-m --scope murat-eker-s-projects
vercel env pull .env.local --environment=development
vercel env pull --environment=production .env.production.local
```
Use Node 24 (what Vercel runs). Then start Claude Code in that folder (`claude`) and say: "Read docs/handover.md and continue." The notes Claude keeps on this computer don't carry over, but this file has everything needed. Pushing to `main` deploys to production, so you only need the local setup for running scripts (like the remap) or testing locally.

## Good to know
- If the site won't open at home but works on a VPN, that's the provider's DNS cache. It clears within about a day; using DNS 1.1.1.1 fixes it immediately.
- Local keys: `vercel env pull .env.local` and `vercel env pull --environment=production .env.production.local` (the Vercel CLI is installed and logged in).
- If the dev server gets stuck, delete `.next/dev` and restart it. A Turbopack Google-font error in `next dev` happens here; `next build` is the reliable check.
- Never paste secrets (keys, the Client Secret, tokens) into a chat. Put them straight into Vercel or Clerk.
