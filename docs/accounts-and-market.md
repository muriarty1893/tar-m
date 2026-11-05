# Accounts, Pazar, Mesajlar, Takvim and Tarlalarım

The website's tools that work for real, without AI: the farmers' market and its chats, crop prices,
the farm calendar and fields with expenses. The AI photo scan is **not** on the website, and since
November 2026 the copy doesn't mention it (the scripted demo was removed).

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
| `/forum`, `/forum/[id]`, `/forum/yeni` | The forum, X-style: topics with up to 4 photos, answers to the topic or to a reply (shown as a thread, "@ahmet kişisine yanıt"), @mentions with suggestions while typing, ♥ likes, report, delete (a reply others answered stays as "Bu yanıt silindi") | to write, like |
| `/forum/kisi/[handle]` | A person's forum page (a mention links here): name, @username, member since, their topics | no |
| `/bildirimler` | Answers to your topics and replies, and mentions of you; the bell in the header counts the new ones | yes |
| `/hesabim` | Name shown to others, home province, the username for mentions (made from the name, changeable), Clerk's e-mail/password settings, sign out, **delete account** (deletes everything, KVKK) | yes |
| `/yonetim` | Admin dashboard: overview (news, drafts, reports, listings, people) | admin |
| `/yonetim/haberler` | News: list, new, edit, delete. Draft / published, date, cover photo (uploaded to Blob under `haberler/`), Markdown text with a toolbar (heading, bold, italic, lists, quote, link) and a preview. Saving refreshes /haberler and the home page at once | admin |
| `/yonetim/sikayetler` | Reported listings and forum posts: remove, or dismiss the reports | admin |
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

## The mobile app's API

The mobile app (`mobile/`) uses the same accounts and data through JSON route handlers under
`/api/app/…` (`app/api/app/`). The reads are the pages' own (`lib/*-data.ts`); the writes are shared
with the server actions (`lib/services/market.ts`, `chat.ts`, `farm.ts`, `account.ts`, `admin.ts`), so
the rules, limits and offer logic are the same everywhere. `lib/app-api.ts` has the helpers.

- **Who:** the Clerk session token in `Authorization: Bearer …`, which `clerkMiddleware` reads. Cookies
  alone never sign in here (no CSRF), so any origin may call it (CORS `*`; `proxy.ts` answers the
  preflight). 401 `sign_in` signed out; 409 `name_required` before the first listing or message
  without a name (the app opens Hesabım); 403 `not_admin` on `/api/app/yonetim/…` for non-admins.
- **Answers:** JSON, `Cache-Control: no-store`; a form's errors are 422 `{ errors, message }` with the
  same Turkish messages as the site. Photo paths under `public/` come back as full addresses.
- **Caches:** changes refresh the same tags as the site (`listings`, `news`) with
  `revalidateTag(tag, { expire: 0 })` (route handlers can't use `updateTag`).
- **Photos:** `POST /api/app/foto?klasor=ilanlar|forum|haberler` with the image's bytes (the app shrinks it
  to 1600 px JPEG first): images only (checked by their first bytes), at most 4 MB, stored in Blob
  under `ilanlar/`, `forum/` or (admins) `haberler/`.

| Address | Methods |
| --- | --- |
| `ben` | GET who am I (profile with `handle`, admin, unread), PATCH name/province/handle, DELETE the account (`{ confirm: true }`) |
| `okunmamis` | GET unread chats (`count`) and unseen notifications (`notifications`) |
| `forum`, `forum/[id]`, `…/yanit`, `forum/yanitlar/[id]` | GET topics (as /forum's filters), POST a topic `{ category, title, body, photos }`; GET a topic with its replies, DELETE; POST a reply `{ body, parentId?, photos? }`; DELETE a reply |
| `forum/begen`, `forum/kisiler`, `forum/kisi/[handle]`, `forum/sikayet` | POST ♥ `{ topicId, replyId? }`; GET people to mention (`?q=&konu=`); GET a person's page; POST a report |
| `bildirimler` | GET notifications, POST marks them seen |
| `ilanlar`, `ilanlar/[id]` | GET a page (as /pazar's filters), POST a listing; GET, PUT (owner), PATCH `{ status }` |
| `ilanlar/[id]/favori`, `…/sikayet`, `…/mesaj` | POST: heart, report, first message or offer |
| `mesajlar`, `mesajlar/[id]`, `teklifler/[id]` | GET inbox (`?rol=`); GET a chat, POST `{ text }` or `{ offer }`; POST an answer to an offer |
| `takvim`, `takvim/[id]` | GET a month (`?ay=2026-11`) with the fields, POST a task; PATCH `{ done }`, DELETE |
| `tarlalar`, `tarlalar/[id]`, `…/sinir`, `…/masraf`, `masraflar/[id]` | fields (GET, POST, PUT, DELETE), the map outline (PUT), expenses (POST, DELETE) |
| `haberler`, `haberler/[slug]` | GET published news (an article as sanitized HTML) |
| `yonetim`, `yonetim/haberler`, `…/[id]`, `yonetim/onizleme`, `yonetim/sikayetler`, `…/[id]` | admin: overview, articles (GET, POST, PUT, DELETE), Markdown preview, reports and moderation |

**Field outlines.** `fields.boundary` (jsonb, `[[lat, lng], …]`, 3 to 60 corners, checked by `lib/geo.ts`)
is drawn on the app's "Tarla Haritası"; the website doesn't show it yet.

`tests/unit/geo.test.ts` covers the outline rules. The whole API was checked end to end against a
local server with two Clerk test users (`…+clerk_test@example.com`, code 424242), who then deleted
their accounts through it.

## Admins

Admins run /yonetim (news and reports) and can remove any listing. Two ways to name them, both in
Vercel (Settings → Environment Variables, Production and Preview), comma separated, then redeploy:

- `ADMIN_EMAILS`: e-mail addresses. Only a verified address on the signed-in account counts.
- `ADMIN_USER_IDS`: Clerk user ids (`user_…`, in the Clerk dashboard under Users).

Admins see "Yönetim paneli" on /hesabim, "Haber ekle" on /haberler and "Bu haberi düzenle" on each
article.

## News

News live in the `articles` table (Markdown text). The three original Markdown files were imported
with `npm run news:import`, which still imports any `content/haberler/*.md` (front matter: title,
date, summary, cover) as published articles, skipping addresses that already exist. Public reads
are cached (`lib/news-data.ts`, tag `news`) and refreshed whenever an article is saved or deleted.

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
