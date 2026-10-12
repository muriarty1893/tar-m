# Placeholders to replace before launch

| What | Where | Replace with |
|---|---|---|
| Logo (Phosphor "Grains" icon in a leaf shape + wordmark) | `components/Logo.tsx` | Real logo (SVG) |
| Contact email `iletisim@bereketai.com` | `config/site.ts` | A mailbox you actually read |
| Favicon | `app/favicon.ico` | Icon from the real logo |
| Demo field photos (4 illustrated SVGs, labelled "Örnek görsel") | `public/demo/bugday-pas.svg`, `kuru-misir.svg`, `aycicegi.svg`, `zeytin.svg` | Real field photos (keep the 4:3 ratio; update `imageSrc` in `data/demo-scenarios.ts` if the extension changes) |
| Demo agronomic text (diagnoses, suggestions, success rates) | `data/demo-scenarios.ts` | Text reviewed by an agronomist |
| Hero phone mockup (built from demo data) | `components/Hero.tsx` | Real app screenshot once the app exists |
| KVKK text: data controller, cross-border transfer basis, retention period (in [brackets]) | `app/gizlilik/page.tsx` | Lawyer-reviewed text; then remove the "Taslak" note |
| Partner page "Pazar ve fırsat" (qualitative, no figures) | `app/is-birligi/page.tsx` | Sourced figures (e.g. TÜİK, Tarım ve Orman Bakanlığı) if you want numbers |
| In-app illustrations on the 3D phone (weather hero, quick-action cards) | `public/app/*.svg` | Real photos or final app artwork (WebP, roughly 2× the shown size) |
| Simulated app data on the 3D phone (user name, prices, weather) | `components/phone-app/AppScreen.tsx` | Final app screens; the prices there are illustrative, not live market data |
