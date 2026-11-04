/**
 * Forum: the rules shared by the website's forms (in the browser), the server and the mobile app
 * (mobile/src/domain/forum.ts repeats them: change both together).
 */
import { fold } from "@/data/demo-market";

export const FORUM_CATEGORIES = [
  { id: "bitki", label: "Bitkisel üretim" },
  { id: "hayvan", label: "Hayvancılık" },
  { id: "makine", label: "Makine ve ekipman" },
  { id: "destek", label: "Destek ve teşvik" },
  { id: "pazar", label: "Fiyat ve pazar" },
  { id: "genel", label: "Genel" },
] as const;

export type ForumCategory = (typeof FORUM_CATEGORIES)[number]["id"];
export const isForumCategory = (s: string): s is ForumCategory => FORUM_CATEGORIES.some((c) => c.id === s);
export const forumCategoryLabel = (id: string) => FORUM_CATEGORIES.find((c) => c.id === id)?.label ?? "Genel";

export const TOPIC_TITLE_MIN = 5;
export const TOPIC_TITLE_MAX = 120;
export const TOPIC_BODY_MIN = 10;
export const TOPIC_BODY_MAX = 5000;
export const REPLY_MIN = 2;
export const REPLY_MAX = 3000;
/** Topics one person may open in 24 hours, and replies in 10 minutes. */
export const DAILY_TOPIC_LIMIT = 5;
export const REPLY_BURST_LIMIT = 30;
export const FORUM_PAGE_SIZE = 20;

/** Photos on a topic or a reply, as on X. */
export const MAX_FORUM_PHOTOS = 4;
/** A photo uploaded to the site's Vercel Blob store under forum/ (by the website or the app). */
export const isForumPhotoUrl = (url: string) => /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/forum\/[\w./-]+$/i.test(url);

function photoError(photos: string[]): string | undefined {
  if (photos.length > MAX_FORUM_PHOTOS) return `En fazla ${MAX_FORUM_PHOTOS} fotoğraf ekleyebilirsiniz.`;
  if (photos.some((p) => !isForumPhotoUrl(p))) return "Fotoğraflardan biri yüklenemedi; kaldırıp yeniden ekleyin.";
  return undefined;
}

export type TopicInput = { category: string; title: string; body: string; photos: string[] };
export type TopicErrors = Partial<Record<keyof TopicInput, string>>;

export function validateTopic(t: TopicInput): TopicErrors {
  const e: TopicErrors = {};
  if (!isForumCategory(t.category)) e.category = "Bir konu türü seçin.";
  const title = t.title.trim();
  if (title.length < TOPIC_TITLE_MIN) e.title = `Başlık en az ${TOPIC_TITLE_MIN} karakter olmalı.`;
  else if (title.length > TOPIC_TITLE_MAX) e.title = `Başlık en fazla ${TOPIC_TITLE_MAX} karakter olabilir.`;
  const body = t.body.trim();
  if (body.length < TOPIC_BODY_MIN) e.body = `Sorunuzu ya da anlatmak istediğinizi yazın (en az ${TOPIC_BODY_MIN} karakter).`;
  else if (body.length > TOPIC_BODY_MAX) e.body = `Metin en fazla ${TOPIC_BODY_MAX} karakter olabilir.`;
  const photos = photoError(t.photos);
  if (photos) e.photos = photos;
  return e;
}

/** A reply needs a few words, or a photo. */
export function validateReply(body: string, photos: string[] = []): string | null {
  const b = body.trim();
  if (b.length > REPLY_MAX) return `Yanıt en fazla ${REPLY_MAX} karakter olabilir.`;
  if (b.length < REPLY_MIN && photos.length === 0) return "Bir yanıt yazın ya da fotoğraf ekleyin.";
  return photoError(photos) ?? null;
}

/**
 * Usernames ("kullanıcı adı"), for mentions: 3–20 lower-case letters, digits or "_", no Turkish
 * letters (so "@ahmet" types the same on every keyboard). Made from the name, changeable in Hesabım.
 */
export const HANDLE_MIN = 3;
export const HANDLE_MAX = 20;
export const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

export function validateHandle(h: string): string | null {
  if (h.length < HANDLE_MIN) return `Kullanıcı adı en az ${HANDLE_MIN} karakter olmalı.`;
  if (h.length > HANDLE_MAX) return `Kullanıcı adı en fazla ${HANDLE_MAX} karakter olabilir.`;
  if (!HANDLE_RE.test(h)) return "Yalnızca küçük harf (Türkçe harfler olmadan), rakam ve alt çizgi (_) kullanın.";
  return null;
}

/** "Mehmet Ali Yılmaz" → "mehmetaliyilmaz" (cut to leave room for a number), "Ö" → "ciftci". */
export function handleFromName(name: string) {
  const base = fold(name).replace(/[^a-z0-9]+/g, "").slice(0, HANDLE_MAX - 4);
  return base.length >= HANDLE_MIN ? base : `ciftci${base}`;
}

/** What someone typed as a username: "@Ahmet " → "ahmet". */
export const cleanHandle = (raw: string) => fold(raw.trim().replace(/^@+/, ""));

const MENTION_RE = /(^|[^a-z0-9_@])@([a-z0-9_]{3,20})(?![a-z0-9_])/gi;
/** At most this many people are told about one post. */
export const MENTION_LIMIT = 10;

/** The usernames mentioned in a text, lower case, each once. */
export function mentionsIn(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(MENTION_RE)) {
    found.add(m[2].toLowerCase());
    if (found.size >= MENTION_LIMIT) break;
  }
  return [...found];
}

/** A text cut into plain parts and mentions, to show "@ahmet" as a link. */
export function splitMentions(text: string): ({ text: string } | { handle: string })[] {
  const parts: ({ text: string } | { handle: string })[] = [];
  let last = 0;
  for (const m of text.matchAll(MENTION_RE)) {
    const at = (m.index ?? 0) + m[1].length;
    if (at > last) parts.push({ text: text.slice(last, at) });
    parts.push({ handle: m[2].toLowerCase() });
    last = at + 1 + m[2].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/** The @word being typed at the cursor ("@ah|" → "ah"), for suggestions; null when not in one. */
export function mentionAtCursor(text: string, cursor: number): { query: string; start: number } | null {
  const before = text.slice(0, cursor);
  const m = /(^|[^a-z0-9_@])@([a-z0-9_]{0,20})$/i.exec(before);
  if (!m) return null;
  return { query: m[2].toLowerCase(), start: cursor - m[2].length - 1 };
}

/** Puts "@handle " in place of the @word being typed. Returns the new text and cursor. */
export function insertMention(text: string, at: { start: number }, cursor: number, handle: string) {
  const next = `${text.slice(0, at.start)}@${handle} ${text.slice(cursor)}`;
  return { text: next, cursor: at.start + handle.length + 2 };
}

type Threadable = { id: string; parentId: string | null; createdAt: string };

/**
 * Replies as X shows a conversation, one level deep: each answer to the topic, then everything that
 * answers it (and answers to those), oldest first, each with the reply it answers.
 */
export function threadReplies<R extends Threadable>(replies: R[]): { reply: R; children: { reply: R; parent: R }[] }[] {
  const byId = new Map(replies.map((r) => [r.id, r]));
  const rootOf = (r: R): R => {
    let cur = r;
    for (let i = 0; i < 50 && cur.parentId && byId.has(cur.parentId); i++) cur = byId.get(cur.parentId)!;
    return cur;
  };
  const roots = replies.filter((r) => !r.parentId || !byId.has(r.parentId));
  const children = new Map<string, { reply: R; parent: R }[]>();
  for (const r of replies) {
    if (!r.parentId || !byId.has(r.parentId)) continue;
    const root = rootOf(r);
    children.set(root.id, [...(children.get(root.id) ?? []), { reply: r, parent: byId.get(r.parentId)! }]);
  }
  const byTime = (a: { createdAt: string }, b: { createdAt: string }) => a.createdAt.localeCompare(b.createdAt);
  return roots.sort(byTime).map((reply) => ({ reply, children: (children.get(reply.id) ?? []).sort((a, b) => byTime(a.reply, b.reply)) }));
}

/** What the forum's search looks through. */
export const topicSearchText = (title: string, body: string) => fold(`${title} ${body}`);

export type ForumSort = "yeni" | "aktif" | "populer";
export const FORUM_SORTS: { id: ForumSort; label: string }[] = [
  { id: "yeni", label: "Son açılan" },
  { id: "aktif", label: "Son yanıt" },
  { id: "populer", label: "En çok yanıt" },
];

export type ForumQuery = { q: string; kategori: ForumCategory | "tumu"; sirala: ForumSort; sayfa: number };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Reads /forum's search params (and the app's); anything unknown falls back to the default. */
export function parseForumQuery(sp: Record<string, string | string[] | undefined>): ForumQuery {
  const kategori = first(sp.kategori);
  const sirala = first(sp.sirala);
  const sayfa = Number.parseInt(first(sp.sayfa), 10);
  return {
    q: first(sp.q).trim().slice(0, 80),
    kategori: isForumCategory(kategori) ? kategori : "tumu",
    sirala: FORUM_SORTS.some((s) => s.id === sirala) ? (sirala as ForumSort) : "yeni",
    sayfa: Number.isFinite(sayfa) && sayfa > 1 ? Math.min(sayfa, 100) : 1,
  };
}

/** /forum with these filters; defaults are left out of the address. */
export function forumHref(q: ForumQuery, change: Partial<ForumQuery> = {}) {
  const next = { ...q, sayfa: 1, ...change };
  const p = new URLSearchParams();
  if (next.q) p.set("q", next.q);
  if (next.kategori !== "tumu") p.set("kategori", next.kategori);
  if (next.sirala !== "yeni") p.set("sirala", next.sirala);
  if (next.sayfa > 1) p.set("sayfa", String(next.sayfa));
  const s = p.toString();
  return s ? `/forum?${s}` : "/forum";
}

export const FORUM_REPORT_REASONS = [
  { id: "spam", label: "Reklam ya da istenmeyen içerik" },
  { id: "hakaret", label: "Hakaret, taciz ya da nefret söylemi" },
  { id: "yaniltici", label: "Yanıltıcı ya da tehlikeli bilgi" },
  { id: "uygunsuz", label: "Uygunsuz içerik" },
  { id: "diger", label: "Başka bir neden" },
] as const;

export type ForumReportReason = (typeof FORUM_REPORT_REASONS)[number]["id"];
export const isForumReportReason = (s: string): s is ForumReportReason => FORUM_REPORT_REASONS.some((r) => r.id === s);
export const forumReasonLabel = (id: string) => FORUM_REPORT_REASONS.find((r) => r.id === id)?.label ?? id;
