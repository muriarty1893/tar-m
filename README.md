# Bereket AI — website

The official website for Bereket AI, a Turkish AI farming assistant app (in development). It has a landing page, a scripted demo, news, an 81-province weather page with farming hints, a waitlist, and a partner page. All visible text is Turkish.

Built with Next.js 16 (App Router, Cache Components) and Tailwind CSS 4. Deployed on Vercel.

**Design:** "Organik Doğa" — palette and style from the UI UX Pro Max design database (Agriculture/Farm Tech, Organic Biophilic), Space Grotesk + DM Sans, light and dark mode. Components: [shadcn/ui](https://ui.shadcn.com) (in `components/ui/`), adapted [Magic UI](https://magicui.design) pieces (in `components/magicui/`), and [Phosphor](https://phosphoricons.com) icons. All free and MIT/OFL licensed. Design spec: `docs/superpowers/specs/2026-10-12-bereket-ai-redesign-design.md`.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in values, see docs/apps-script.md
npm run dev                  # http://localhost:3000
```

The site works without the env vars; only form submissions fail (visitors see an error with the contact e-mail).

## Tests

```bash
npm test          # unit tests (Vitest)
npm run e2e       # end-to-end tests (Playwright; builds and starts the site on port 3100)
npm run lint
```

First run of the e2e tests: `npx playwright install chromium`.

## Everyday edits

| To change… | Edit |
|---|---|
| Name, tagline, contact e-mail, menu | `config/site.ts` |
| Colors, radius, shadows | `app/globals.css` (`:root` tokens, light and dark) |
| News | add a Markdown file to `content/haberler/` (see below) |
| Demo examples | `data/demo-scenarios.ts` and images in `public/demo/` |
| FAQ / About / Privacy | `app/sss/page.tsx`, `app/hakkimizda/page.tsx`, `app/gizlilik/page.tsx` |
| Weather hint rules | `lib/weather.ts` → `farmingHint` |

### Adding a news article

Create `content/haberler/<slug>.md`. The filename is the URL: lowercase letters, digits and dashes only, e.g. `bugday-hasadi-basladi.md`.

```markdown
---
title: Buğday hasadı başladı
date: 2026-10-20
summary: Bir-iki cümlelik özet; listede ve paylaşım önizlemesinde görünür.
cover: /images/haber/bugday.jpg   # optional; put the image under public/
---

Yazının gövdesi **Markdown** ile.
```

Commit and push; Vercel redeploys. If a file is invalid (missing title, wrong date format, bad filename), the build fails with a Turkish message naming the file, so a broken article never goes live.

## Docs

- [docs/deploy.md](docs/deploy.md): Vercel setup, domain, and the pre-launch checklist
- [docs/apps-script.md](docs/apps-script.md): connecting the forms to Google Sheets
- [docs/placeholders.md](docs/placeholders.md): everything to replace before launch
- [docs/superpowers/specs/](docs/superpowers/specs/): the design spec
