# Placeholders to replace before launch

| What | Where | Replace with |
|---|---|---|
| Logo (Phosphor "Grains" icon in a leaf shape + wordmark) | `components/Logo.tsx` | Real logo (SVG) |
| Contact email `iletisim@bereketai.com` | `config/site.ts` | A mailbox you actually read |
| Favicon | `app/favicon.ico` | Icon from the real logo |
| Hero image (a 3D phone render showing the site's mobile home, with sample forum topics) | `public/hero/phone.webp` | A real device photo, or a fresh screen after design changes (see `docs/3d-model.md`) |
| Sponsor banner (sample: sukocu.com, marked "ÖRNEK") | `components/home/AdSlots.tsx` | The real sponsor, with a link to their site |
| KVKK text: data controller, cross-border transfer basis, retention period (in [brackets]) | `app/gizlilik/page.tsx` | Lawyer-reviewed text; then remove the "Taslak" note |
| Partner page "Pazar ve fırsat" (qualitative, no figures) | `app/is-birligi/page.tsx` | Sourced figures (e.g. TÜİK, Tarım ve Orman Bakanlığı) if you want numbers |
| In-app photos on the 3D phone (weather card, quick-action cards; Commons, credited) | `public/app/*.webp` | Final app artwork |
| Simulated app data on the 3D phone (user name, prices, weather) | `components/phone-app/AppScreen.tsx` | Final app screens; the prices there are illustrative, not live market data |
