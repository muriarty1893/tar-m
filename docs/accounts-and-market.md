# Accounts, Pazar, Mesajlar, Takvim and Tarlalarım

The website's tools that work for real, without AI: the farmers' market and its chats, crop prices,
the farm calendar and fields with expenses. The AI photo scan is **not** on the website: the 3D
phone on the home page stays a scripted demo, and the copy calls the scan "yakında".

## Pages

| Page | What it does | Account |
| --- | --- | --- |
| `/pazar` | Listings: search (Turkish letters folded, "traktor" finds "Traktör"), categories, province, sort, Favorilerim / İlanlarım | to post, favourite, message |
| `/pazar/ilan/[id]` | A listing: photos, facts, seller (name, member since, listing count), "Mesaj yaz" / "Teklif ver"; on your own: edit, mark sold, remove; "İlanı şikâyet et" | to contact |
| `/pazar/ilan-ver`, `/pazar/ilan/[id]/duzenle` | The listing form: up to 5 photos (shrunk in the browser to 1600 px WebP, uploaded to Vercel Blob), checks on blur and on submit with an error summary | yes |
| `/pazar/kurallar` | Market rules and safety | no |
| `/mesajlar`, `/mesajlar/[id]` | Inbox (Tümü / Alıyorum / Satıyorum, unread counts) and the chat: messages, offers, counter-offers, accept / turn down, "Görüldü". The open chat polls every 4 s; the header's badge every 30 s | yes |
| `/fiyatlar` | Crop prices with search, groups, sorting. **Sample data**, marked "Örnek veriler" | no |
| `/takvim` | Month view, the day's tasks (tick, delete), add a task (kind, date, time, field), upcoming tasks | yes |
| `/tarlalarim`, `/tarlalarim/[id]` | Fields (crop, stage, area, place, expected yield), season totals, expenses by kind, cost per dönüm, the field's tasks | yes |
| `/hava` | Unchanged: 7-day forecast, farming hints, "Konumumu kullan" | no |
| `/hesabim` | Name shown to others, home province, Clerk's e-mail/password settings, sign out, **delete account** (deletes everything, KVKK) | yes |
| `/yonetim` | Moderators only: reported listings, remove or dismiss | admin |
| `/giris`, `/kayit` | Clerk sign-in and sign-up, in Turkish | – |

Offers: the buyer offers; the seller accepts, turns down or counters; the buyer answers a counter the
same way. A new offer replaces the sender's waiting one and counters the other side's. An accepted
offer shows "Anlaştınız" to both. The site takes no payment.

## Services (all connected to the `tar-m` Vercel project)

| Service | For | Env vars | Region |
| --- | --- | --- | --- |
| Clerk (Vercel Marketplace) | sign-in, sign-up, sessions | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | – |
| Neon Postgres (Vercel Marketplace) `ciftci-destek-db` | profiles, listings, favourites, chats, reports, fields, expenses, tasks | `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, … | Frankfurt (fra1) |
| Vercel Blob `ciftci-destek-photos` (public) | listing photos, under `ilanlar/` | `BLOB_READ_WRITE_TOKEN` | Frankfurt (fra1) |

All three are on free plans. Locally, `vercel env pull .env.local` brings the keys.

## Database

The schema is `db/schema.sql` (every statement idempotent). Apply it with:

```bash
npm run db:migrate
```

Queries are plain SQL through `@neondatabase/serverless` (`lib/db.ts`); reads are in
`lib/market-data.ts`, `lib/chat-data.ts`, `lib/farm-data.ts`; writes are server actions in
`app/*/actions.ts`. Every query is scoped to the signed-in person. Rules shared by the forms and the
server (validation, offer rules, the URL filters) are in `lib/market.ts` and `lib/farm.ts`, with unit
tests in `tests/unit/market.test.ts` and `tests/unit/farm.test.ts`.

Limits against abuse: 10 listings a day, 60 messages per 10 minutes, 20 reports a day per person;
photos only from our own Blob store, images only, 8 MB at most.

## Moderators

Set `ADMIN_USER_IDS` in Vercel (Settings → Environment Variables, Production and Preview) to the
Clerk user ids of the moderators, comma separated (`user_…`; find yours in the Clerk dashboard under
Users, after signing up on the site). Redeploy. Moderators see "Yönetim: şikâyetler" on /hesabim and
can remove any listing.

## Before a real launch

- **Clerk production instance.** The connected Clerk instance uses *development* keys (`pk_test_…`):
  it works on `tar-m-flame.vercel.app`, but shows "Development mode" under the sign-in form and has
  development limits. Clerk's production instances need a domain you own (not `*.vercel.app`). Once
  the domain is bought: Clerk dashboard → create the production instance → add the domain's DNS
  records → put the production keys in Vercel → redeploy.
- **Sign-up fields.** In the Clerk dashboard (User & authentication), turn on "First and last name"
  so new people give their name at sign-up; until then the site asks for it on /hesabim before the
  first listing or message.
- **KVKK review** of `/gizlilik` (it now lists Clerk, Neon and Vercel Blob as processors).
- **Prices.** `/fiyatlar` shows sample prices until a real source is connected.
- **Notifications.** There are no e-mail or SMS alerts for new messages yet; people see the unread
  badge when they visit.
