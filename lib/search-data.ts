import "server-only";
import { day, iso, sql, str, type Row } from "./db";
import { fold } from "@/data/demo-market";
import { categoryName } from "./forum";
import { forumCategories } from "./forum-categories";
import { placeLabel, priceLabel } from "./market";
import { formatTrDate } from "./format";
import { isArticleKind, kindLabel, type ArticleSummary } from "./news";
import { MAX_QUERY, MIN_QUERY, type Suggestion } from "./search";

/**
 * Searches for the search box and /ara: forum topics, replies, Pazar listings and news. Words are
 * folded ("traktor" finds "Traktör") and all of them must match. Topics and listings keep a folded
 * search_text; replies and news are folded in the query.
 */

/** Folds text in SQL the way fold() does: İ→i first (Postgres lowercases it to i + a dot), then the Turkish letters. */
const folded = (expr: string) => `translate(lower(translate(${expr}, 'İ', 'i')), 'çğıöşüâîû', 'cgiosuaiu')`;

/** Up to five folded words, with LIKE's wildcards escaped. */
export function searchWords(q: string) {
  return fold(q.slice(0, MAX_QUERY))
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((w) => `%${w.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
}

/** `column like $1 and column like $2 …`, with the words added to params. */
function allWords(column: string, words: string[], params: unknown[]) {
  return words.map((w) => (params.push(w), `${column} like $${params.length}`)).join(" and ");
}

export type ReplyHit = { id: string; topicId: string; topicTitle: string; authorName: string; snippet: string; createdAt: string };

/** Replies that contain every word, newest first, with the part of the text around the first word. */
export async function searchReplies(q: string, limit: number): Promise<ReplyHit[]> {
  const words = searchWords(q);
  if (!words.length) return [];
  const params: unknown[] = [];
  const rows = await sql().query(
    `select r.id, r.topic_id, r.body, r.created_at, t.title as topic_title, p.name as author_name
     from forum_replies r join forum_topics t on t.id = r.topic_id join profiles p on p.user_id = r.author_id
     where r.deleted_at is null and ${allWords(folded("r.body"), words, params)}
     order by r.created_at desc limit ${Math.min(limit, 20)}`,
    params,
  );
  const first = fold(q).split(/\s+/).find(Boolean) ?? "";
  return rows.map((r: Row) => ({
    id: str(r.id),
    topicId: str(r.topic_id),
    topicTitle: str(r.topic_title),
    authorName: str(r.author_name) || "Kullanıcı",
    snippet: snippet(str(r.body), first),
    createdAt: iso(r.created_at),
  }));
}

/** About 90 characters of `text` around `word` (folded positions match the text's, letter for letter). */
function snippet(text: string, word: string) {
  const plain = text.replace(/\s+/g, " ").trim();
  const at = Math.max(0, fold(plain).indexOf(word));
  const start = Math.max(0, at - 30);
  const end = Math.min(plain.length, start + 90);
  return `${start > 0 ? "…" : ""}${plain.slice(start, end).trim()}${end < plain.length ? "…" : ""}`;
}

/** Published articles whose title or summary contains every word, newest first. */
export async function searchNews(q: string, limit: number): Promise<ArticleSummary[]> {
  const words = searchWords(q);
  if (!words.length) return [];
  const params: unknown[] = [];
  const rows = await sql().query(
    `select slug, kind, title, summary, cover, published_on from articles
     where status = 'published' and ${allWords(folded("title || ' ' || summary"), words, params)}
     order by published_on desc, slug limit ${Math.min(limit, 20)}`,
    params,
  );
  return rows.map((r: Row) => ({
    slug: str(r.slug),
    kind: isArticleKind(r.kind) ? r.kind : "haber",
    title: str(r.title),
    date: day(r.published_on),
    summary: str(r.summary),
    cover: r.cover ? str(r.cover) : undefined,
  }));
}

/** What the search box lists while you type: a few of each kind, topics first. */
export async function suggest(q: string): Promise<Suggestion[]> {
  const term = q.trim();
  const words = searchWords(term);
  if (term.length < MIN_QUERY || !words.length) return [];
  const tp: unknown[] = [];
  const lp: unknown[] = [];
  const [cats, topics, replies, listings, news] = await Promise.all([
    forumCategories(),
    sql().query(
      `select id, title, category, reply_count from forum_topics where ${allWords("search_text", words, tp)} order by coalesce(last_reply_at, created_at) desc limit 4`,
      tp,
    ),
    searchReplies(term, 3),
    sql().query(
      `select id, title, price, unit, province, district from listings where status = 'active' and ${allWords("search_text", words, lp)} order by created_at desc limit 4`,
      lp,
    ),
    searchNews(term, 2),
  ]);
  return [
    ...topics.map((t: Row): Suggestion => {
      const n = Number(t.reply_count ?? 0);
      return { kind: "konu", key: `konu-${str(t.id)}`, title: str(t.title), detail: `${categoryName(cats, str(t.category))} · ${n ? `${n} yanıt` : "yanıt yok"}`, href: `/forum/${str(t.id)}` };
    }),
    ...replies.map((r): Suggestion => ({ kind: "yanit", key: `yanit-${r.id}`, title: r.snippet, detail: `${r.authorName} · “${r.topicTitle}”`, href: `/forum/${r.topicId}#yanit-${r.id}` })),
    ...listings.map((l: Row): Suggestion => ({
      kind: "ilan",
      key: `ilan-${str(l.id)}`,
      title: str(l.title),
      detail: `${priceLabel(Number(l.price), l.unit ? str(l.unit) : null)} · ${placeLabel(str(l.province), str(l.district))}`,
      href: `/pazar/ilan/${str(l.id)}`,
    })),
    ...news.map((a): Suggestion => ({ kind: "haber", key: `haber-${a.slug}`, title: a.title, detail: `${kindLabel(a.kind)} · ${formatTrDate(a.date)}`, href: `/haberler/${a.slug}` })),
  ];
}
