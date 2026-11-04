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

export type TopicInput = { category: string; title: string; body: string };
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
  return e;
}

export function validateReply(body: string): string | null {
  const b = body.trim();
  if (b.length < REPLY_MIN) return "Bir yanıt yazın.";
  if (b.length > REPLY_MAX) return `Yanıt en fazla ${REPLY_MAX} karakter olabilir.`;
  return null;
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
