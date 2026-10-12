# Placeholders to replace before launch

| What | Where | Replace with |
|---|---|---|
| Logo (Phosphor "Grains" icon in a leaf shape + wordmark) | `components/Logo.tsx` | Real logo (SVG) |
| Contact email `iletisim@bereketai.com` | `config/site.ts` | A mailbox you actually read |
| Favicon | `app/favicon.ico` | Icon from the real logo |
| Demo field photos (real Wikimedia Commons photos, credited under the demo; list in `data/photo-credits.ts`) | `public/demo/*.webp` | Your own field photos if you prefer (4:3, about 800×600 WebP); update `data/demo-scenarios.ts` and `data/photo-credits.ts` |
| Demo agronomic text (diagnoses, suggestions, success rates) | `data/demo-scenarios.ts` | Text reviewed by an agronomist |
| Hero image (a render of the 3D showcase phone on the app's home screen) | `public/hero-app-phone.webp` | A real device photo or a fresh render after app changes (see `docs/3d-model.md`) |
| KVKK text: data controller, cross-border transfer basis, retention period (in [brackets]) | `app/gizlilik/page.tsx` | Lawyer-reviewed text; then remove the "Taslak" note |
| Partner page "Pazar ve fırsat" (qualitative, no figures) | `app/is-birligi/page.tsx` | Sourced figures (e.g. TÜİK, Tarım ve Orman Bakanlığı) if you want numbers |
| In-app photos on the 3D phone (weather card, quick-action cards; Commons, credited) | `public/app/*.webp` | Final app artwork |
| Simulated app data on the 3D phone (user name, prices, weather) | `components/phone-app/AppScreen.tsx` | Final app screens; the prices there are illustrative, not live market data |
