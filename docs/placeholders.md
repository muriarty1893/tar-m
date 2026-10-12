# Placeholders to replace before launch

| What | Where | Replace with |
|---|---|---|
| Logo (wordmark + wheat icon) | `components/Logo.tsx` | Real logo (SVG) |
| Contact email `iletisim@bereketai.com` | `config/site.ts` | A mailbox you actually read |
| Favicon | `app/favicon.ico` | Icon from the real logo |
| Demo field photos (4 illustrated SVGs, labelled "Örnek görsel") | `public/demo/bugday-pas.svg`, `kuru-misir.svg`, `aycicegi.svg`, `zeytin.svg` | Real field photos (keep the 4:3 ratio; update `imageSrc` in `data/demo-scenarios.ts` if the extension changes) |
| Demo agronomic text (diagnoses, suggestions, success rates) | `data/demo-scenarios.ts` | Text reviewed by an agronomist |
