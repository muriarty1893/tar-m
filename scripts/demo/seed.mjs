// Fills the site with sample content (scripts/demo/content.mjs): members, forum topics with replies
// and likes, Pazar listings and news. `npm run demo:seed` (again: replaces the sample content);
// `npm run demo:remove` deletes all of it. Real members' posts are never touched: sample members'
// ids start with "demo_" (everything they wrote goes with them), sample articles have author_id "demo".
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { LISTINGS, MEMBERS, NEWS, POOL, TOPICS } from "./content.mjs";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run `vercel env pull .env.local` first.");
  process.exit(1);
}
const sql = neon(url);
const remove = process.argv.includes("--remove");

const PREFIX = "demo_";
const DAY = 24 * 60 * 60_000;
const CATEGORY_LABEL = { urun: "Ürün", tohum: "Tohum & Gübre", alet: "Alet", ekipman: "Ekipman", arac: "Araç" };

/** "Traktör" → "traktor", as the site's search text (data/demo-market.ts → fold). */
function fold(s) {
  const plain = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
  return s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase().replace(/[çğıöşüâîû]/g, (c) => plain[c]);
}

/** A repeatable random sequence, so every run writes the same content. */
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = prng(20261107);
const pick = (list) => list[Math.floor(rand() * list.length)];
const between = (a, b) => a + rand() * (b - a);

/** insert into table (cols) values (…), (…) in chunks of 200 rows. */
async function insertMany(table, cols, rows) {
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const params = [];
    const values = chunk.map((row) => `(${row.map((v) => (params.push(v), `$${params.length}`)).join(", ")})`);
    await sql.query(`insert into ${table} (${cols.join(", ")}) values ${values.join(", ")}`, params);
  }
}

async function removeAll() {
  const [articles] = await Promise.all([sql`delete from articles where author_id = 'demo' returning id`]);
  // Everything sample members wrote (topics, replies, likes, listings, notifications) goes with them.
  const people = await sql`delete from profiles where user_id like 'demo\\_%' returning user_id`;
  return { articles: articles.length, members: people.length };
}

async function seed() {
  const now = Date.now();
  const id = (handle) => PREFIX + handle;
  const handles = MEMBERS.map(([h]) => h);
  for (const t of TOPICS) for (const h of [t.a, ...t.r.map((r) => r[0])]) if (!handles.includes(h)) throw new Error(`Unknown member: ${h}`);

  await insertMany(
    "profiles",
    ["user_id", "name", "province", "handle", "created_at", "updated_at"],
    MEMBERS.map(([handle, name, province, months]) => {
      const at = new Date(now - months * 30 * DAY);
      return [id(handle), name, province, handle, at, at];
    }),
  );

  const topicRows = [];
  const replyRows = [];
  const likeRows = [];
  for (const t of TOPICS) {
    const topicId = randomUUID();
    const created = now - t.d * DAY;
    topicRows.push([topicId, id(t.a), t.c, t.t, t.b, t.p ?? [], fold(`${t.t} ${t.b}`), new Date(created)]);

    // Replies: the written ones in order, then short ones from the pools, spread from the topic to now.
    const span = Math.max(Math.min(now - created - 60_000, 6 * DAY), 60_000);
    const total = t.r.length + t.g;
    const times = Array.from({ length: total }, () => created + between(0.04, 1) * span).sort((a, b) => a - b);
    const ids = [];
    const authors = [];
    t.r.forEach(([author, text, parent], i) => {
      ids.push(randomUUID());
      authors.push(author);
      replyRows.push([ids[i], topicId, id(author), text, parent === undefined ? null : ids[parent], new Date(times[i])]);
    });
    const pool = [...(POOL[t.c] ?? []), ...POOL.any];
    for (let i = t.r.length; i < total; i++) {
      let author;
      do author = pick(handles);
      while (author === t.a || author === authors.at(-1));
      ids.push(randomUUID());
      authors.push(author);
      replyRows.push([ids[i], topicId, id(author), pick(pool), null, new Date(times[i])]);
    }

    // Likes: on the topic, and a few on its replies, each from a different member.
    const likers = handles.filter((h) => h !== t.a).sort(() => rand() - 0.5).slice(0, Math.min(t.l, handles.length - 1));
    for (const h of likers) likeRows.push([id(h), topicId, null, new Date(created + between(0.05, 1) * span)]);
    ids.forEach((replyId, i) => {
      const n = rand() < 0.45 ? Math.floor(between(1, 6)) : 0;
      handles.filter((h) => h !== authors[i]).sort(() => rand() - 0.5).slice(0, n).forEach((h) => likeRows.push([id(h), topicId, replyId, new Date(times[i] + 60_000)]));
    });
  }
  await insertMany("forum_topics", ["id", "author_id", "category", "title", "body", "photos", "search_text", "created_at"], topicRows);
  await insertMany("forum_replies", ["id", "topic_id", "author_id", "body", "parent_id", "created_at"], replyRows);
  await insertMany("forum_likes", ["user_id", "topic_id", "reply_id", "created_at"], likeRows);
  await sql`
    update forum_topics t set
      reply_count = (select count(*) from forum_replies r where r.topic_id = t.id and r.deleted_at is null),
      last_reply_at = (select max(created_at) from forum_replies r where r.topic_id = t.id and r.deleted_at is null),
      like_count = (select count(*) from forum_likes l where l.topic_id = t.id and l.reply_id is null)
    where t.author_id like 'demo\\_%'`;
  await sql`update forum_replies r set like_count = (select count(*) from forum_likes l where l.reply_id = r.id) where r.author_id like 'demo\\_%'`;

  await insertMany(
    "listings",
    ["seller_id", "title", "category", "condition", "price", "unit", "quantity", "negotiable", "province", "district", "description", "photos", "status", "search_text", "created_at", "updated_at"],
    LISTINGS.map(([category, title, price, unit, quantity, condition, negotiable, province, district, photo, description, seller, days, status]) => {
      if (!handles.includes(seller)) throw new Error(`Unknown seller: ${seller}`);
      const at = new Date(now - days * DAY);
      const search = fold(`${title} ${description} ${district} ${province} ${CATEGORY_LABEL[category]}`);
      return [id(seller), title, category, condition, price, unit, quantity, negotiable, province, district, description, photo ? [photo] : [], status ?? "active", search, at, at];
    }),
  );

  // News: the date is the Türkiye day; the summary says it's a sample.
  const trDay = (ms) => new Date(ms + 3 * 60 * 60_000).toISOString().slice(0, 10);
  let articles = 0;
  for (const [kind, slug, title, summary, cover, days, body] of NEWS) {
    const rows = await sql`
      insert into articles (slug, title, summary, body, cover, published_on, status, kind, author_id)
      values (${slug}, ${title}, ${`(Örnek haber) ${summary}`}, ${`${body}\n\n_Bu bir örnek haberdir._`}, ${cover}, ${trDay(now - days * DAY)}, 'published', ${kind}, 'demo')
      on conflict (slug) do nothing returning id`;
    articles += rows.length;
  }

  return { members: MEMBERS.length, topics: topicRows.length, replies: replyRows.length, likes: likeRows.length, listings: LISTINGS.length, articles };
}

const removed = await removeAll();
if (remove) {
  console.log(`Removed the sample content: ${removed.members} members (with their topics, replies, likes and listings) and ${removed.articles} articles.`);
} else {
  const added = await seed();
  console.log(`Sample content added: ${added.members} members, ${added.topics} topics, ${added.replies} replies, ${added.likes} likes, ${added.listings} listings, ${added.articles} articles.`);
}
