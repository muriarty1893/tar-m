# Borsa home page, forum views and the news ticker (2026-11-06)

The user picked design 17 (Borsa) from /tasarimlar and asked for changes. The /tasarimlar/17 mockup
was updated first (commit 5cbc9e1); this spec covers the real phone home and the data it needs.

## What the user asked for

- Design 17 becomes the phone home page.
- A new thin strip right under "Bu alanda reklam vermek için", a bit thinner than the sponsor and
  reklam strips: "Çiftçi destekleri & haberler", showing news and announcements for farmers.
- A cloud logo on the hava box and a Pazar logo on the Pazar box.
- No "Borsa fiyatları" table.
- The "+ Konu" button is red.
- Reply and view counts at the end of each topic's line, not in table columns.
- View counts grow by themselves: random topics get views at random times, 09:00–24:00 Türkiye time.
  Real topic opens count too, and the fake views are added on top. Modest pace: a new topic gets
  about 30–120 on its first day, then a few a day; old topics wake up now and then.
- Topic and reply counts stay real.
- The news is written by the admins in Yönetim → Haberler, each article labelled Destek, Haber or Duyuru.

## Decisions (mine, flagged to the user at the end)

- **Pazar box:** real Pazar data (active ad count, "+N bugün", the 3 newest ads with their price)
  instead of crop prices, because the only prices on the site are sample data.
- **Desktop:** unchanged. The global header and bottom tab bar are unchanged too; only the home page's
  content takes Borsa's look (grey canvas, white cards, Fira Sans with Fira Code for numbers).
- **Forum rows everywhere:** the reply-count box on the right of every topic row (on /forum too) goes;
  replies and views sit at the end of the meta line. The home uses a denser row, as in the mockup.
- **Search:** says "Forumda ve Pazar’da ara" (the search has no prices), and the "/" key hint is gone (phones).

## Views

- `forum_topics.view_count integer not null default 0` counts real opens: the topic page sends one
  POST to `/api/forum/goruntulenme` per topic per browser session (sessionStorage), rate-limited per IP.
  Opens in the mobile app are not counted (its API stays as it is).
- Shown views = `view_count` + `fakeViews(id, createdAt, now)`, computed when a topic is read; nothing
  fake is stored. `fakeViews` (lib/forum-views.ts) is a pure, deterministic function:
  - The Türkiye day (UTC+3, no DST) from 09:00 to 24:00 is cut into 180 five-minute slots.
  - Each topic has a pull (0.4–1.6) from a hash of its id. A day's budget is
    `75 × pull × noise / (1 + age in days)^1.3` (noise 0.6–1.4 from a hash of id and day), rounded
    up or down at random, so old topics get 0 or 1 on most days.
  - From day 2 on, a 5% chance per day of a wake-up: 3–14 extra views within one hour.
  - Every view lands in a random slot of its day (after the topic went up, on its first day). A view
    counts once its slot has started, so counts jump at random times and only between 09:00 and 24:00.
  - Same inputs, same answer, on every server; it only ever grows with time.
- `TopicCard.viewCount` carries the total; the app's forum API gets the field too (additive).

## News

- `articles.kind text not null default 'haber' check (kind in ('destek','haber','duyuru'))`.
- The article editor gets a "Tür" choice; `cleanArticle` defaults a missing kind to haber, so the
  app's editor keeps working. `/haberler` cards show the label.
- The home ticker shows the newest 8 published articles, each linking to its page; the label links to
  /haberler. The list repeats so the loop has no gap; it pauses on touch, hover or focus, and does not
  move with "reduce motion" (it scrolls by hand). No articles: the strip is not shown.

## Steps

1. `lib/forum-views.ts` + unit tests (written first).
2. Schema: `view_count`, `articles.kind`; run `npm run db:migrate`.
3. Forum data: `viewCount` and the last replier's name in `listTopics`/`getTopic`; view beacon route
   and client component on the topic page; views on the topic page header.
4. TopicRow: counts at the end of the meta line; a dense variant for the home, passed through ForumFeed.
5. News kind: types, validation, editor, NewsCard label, `listPublished` returns kind.
6. Home: Borsa-style MobileHome (search, sponsor, reklam, ticker, hava + Pazar, forum).
7. Check in the browser at 390 px, type-check, lint, unit tests; commit and push.
