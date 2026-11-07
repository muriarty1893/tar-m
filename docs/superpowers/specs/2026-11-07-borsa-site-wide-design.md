# Borsa look on every page (2026-11-07)

The phone home took design 17 (Borsa) on 2026-11-06. Now the whole website follows it.

## The user's choices

- **Every page, every screen size.** The desktop home stops being the marketing landing page: it
  becomes a wide version of the Borsa portal (search, sponsor, reklam, news ticker, hava + Pazar,
  forum). The landing's hero, tools strip, pricing, question section and partner call-to-action go.
- **Dense lists, comfortable forms.** Lists, tables, menus and boxes are compact like the home
  (13–14 px, meta 12 px). Forms, article text and topic text stay comfortable (16 px; inputs never
  below 16 px so phones don't zoom).
- **Borsa colours.** Blue `#1d4ed8` for links, tabs and normal buttons; red `#dc2626` for the main
  "create" buttons (Konu aç, İlan ver, Yayınla, Soru sor…); green `#15803d` only for good signs.
- The phone app (mobile/) is not touched.

## Design system (ui-ux-pro-max: Minimalism & Swiss, density 8/10, Fira Sans + Fira Code)

| Token | Value |
|---|---|
| page (`--background`) | `#f1f3f5` |
| boxes (`--card`, `--surface`, popovers) | `#ffffff` |
| text / muted text | `#111827` / `#4b5563` |
| lines (`--border`) / field borders (`--input`) | `#dfe3e8` / `#b6bdc7` |
| primary (links, tabs, buttons, focus ring) | `#1d4ed8`, tint `#eef3fe` |
| create (new `--create`) | `#dc2626`, hover `#b91c1c` |
| good (new `--good`, `--good-soft`) | `#15803d`, `#dcfce7` |
| corners | 6 px boxes, 6 px buttons |
| shadows | hairline only (`0 1px 2px` 4 %); sheets and menus keep a soft lift |
| type | Fira Sans everywhere (headings too, normal tracking); Fira Code for figures (`font-borsa-mono`) |
| base size | 16 px (was 18 px); body line-height 1.5 |

Section title bars (`--bar`) turn from dark green to white rows with a hairline under them, bold
dark text and a red action, as on the home's forum box.

## Shared pieces

- **Top bar:** white with a hairline. Phones: logo, name, Mesajlar/Bildirimler, account. Desktop:
  the same plus a plain text menu (active page blue with a 2 px underline), no pill animation.
- **Bottom tab bar (phones):** white, hairline on top, active tab blue.
- **PageHero** (SSS, Haberler, Hakkımızda, Gizlilik, Kaynaklar, İş birliği): a compact white title
  band like ToolHeader, no field photo.
- **ToolHeader:** compact title band; actions on the right.
- **Buttons:** 44 px default (36 px small), 15 px text; new `create` variant (red); outline is a 1 px line.
- **Footer:** white, hairline, small links.
- **Clerk sign-in:** blue, Fira Sans, 6 px corners.

## Desktop home (≥ 1280 px)

One page, `max-w-6xl`, same order as the phone:
search → sponsor and reklam side by side → ticker → hava and Pazar side by side (hava shows 6 days,
Pazar the 5 newest ads) → forum, with the forum's sections listed beside the topics.

## Pages

Every page gets the tokens; these get hand passes: forum (index, category, topic, new/edit),
Pazar (list, filters, card, listing, ilan ver/edit, kurallar), Hava, Takvim, Tarlalarım, Fiyatlar,
Haberler (list, article), Mesajlar, Bildirimler, Hesabım, Giriş/Kayıt, SSS, Hakkımızda, Gizlilik,
Kaynaklar, İş birliği, Yönetim (overview, haberler, forum, şikayetler).

## Checks

Type-check, lint, unit tests, the e2e suite (tests for removed landing parts go with them), axe
on every page, and a look at every page at 390 px and 1440 px.
