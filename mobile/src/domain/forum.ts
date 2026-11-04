/** Forum: the website's rules (lib/forum.ts), so the app's forms refuse what the server would. Change both together. */
import type { ForumCategory, ForumSort, TopicInput } from '@/api/types';
import { fold } from '@/domain/text';

export const FORUM_CATEGORIES: { id: ForumCategory; label: string }[] = [
  { id: 'bitki', label: 'Bitkisel üretim' },
  { id: 'hayvan', label: 'Hayvancılık' },
  { id: 'makine', label: 'Makine ve ekipman' },
  { id: 'destek', label: 'Destek ve teşvik' },
  { id: 'pazar', label: 'Fiyat ve pazar' },
  { id: 'genel', label: 'Genel' },
];

export const forumCategoryLabel = (id: string) => FORUM_CATEGORIES.find((c) => c.id === id)?.label ?? 'Genel';

/** Each kind of topic's accent (the label always says it too). */
export const CATEGORY_TONES: Record<ForumCategory, { bg: string; fg: string }> = {
  bitki: { bg: '#d1fae5', fg: '#065f46' },
  hayvan: { bg: '#fef3c7', fg: '#92400e' },
  makine: { bg: '#e0f2fe', fg: '#075985' },
  destek: { bg: '#ede9fe', fg: '#5b21b6' },
  pazar: { bg: '#ffe4e6', fg: '#9f1239' },
  genel: { bg: '#e2e8f0', fg: '#1e293b' },
};

export const FORUM_SORTS: { id: ForumSort; label: string }[] = [
  { id: 'yeni', label: 'Son açılan' },
  { id: 'aktif', label: 'Son yanıt' },
  { id: 'populer', label: 'En çok yanıt' },
];

export const TOPIC_TITLE_MAX = 120;
export const TOPIC_BODY_MAX = 5000;
export const REPLY_MAX = 3000;

export type TopicErrors = Partial<Record<keyof TopicInput, string>>;

export function validateTopic(t: TopicInput): TopicErrors {
  const e: TopicErrors = {};
  if (!FORUM_CATEGORIES.some((c) => c.id === t.category)) e.category = 'Bir konu türü seçin.';
  const title = t.title.trim();
  if (title.length < 5) e.title = 'Başlık en az 5 karakter olmalı.';
  else if (title.length > TOPIC_TITLE_MAX) e.title = `Başlık en fazla ${TOPIC_TITLE_MAX} karakter olabilir.`;
  const body = t.body.trim();
  if (body.length < 10) e.body = 'Sorunuzu ya da anlatmak istediğinizi yazın (en az 10 karakter).';
  else if (body.length > TOPIC_BODY_MAX) e.body = `Metin en fazla ${TOPIC_BODY_MAX} karakter olabilir.`;
  return e;
}

/** Photos on a topic or a reply, as on X. */
export const MAX_FORUM_PHOTOS = 4;

/** A reply needs a few words, or a photo. */
export function validateReply(body: string, photoCount = 0): string | null {
  const b = body.trim();
  if (b.length > REPLY_MAX) return `Yanıt en fazla ${REPLY_MAX} karakter olabilir.`;
  if (b.length < 2 && photoCount === 0) return 'Bir yanıt yazın ya da fotoğraf ekleyin.';
  return null;
}

/** Usernames: 3–20 lower-case letters (no Turkish ones), digits or "_" (the website's lib/forum.ts). */
export const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

export function validateHandle(h: string): string | null {
  if (h.length < 3) return 'Kullanıcı adı en az 3 karakter olmalı.';
  if (h.length > 20) return 'Kullanıcı adı en fazla 20 karakter olabilir.';
  if (!HANDLE_RE.test(h)) return 'Yalnızca küçük harf (Türkçe harfler olmadan), rakam ve alt çizgi (_) kullanın.';
  return null;
}

/** What someone typed as a username: "@Ahmet " → "ahmet". */
export const cleanHandle = (raw: string) => fold(raw.trim().replace(/^@+/, ''));

const MENTION_RE = /(^|[^a-z0-9_@])@([a-z0-9_]{3,20})(?![a-z0-9_])/gi;

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
  const m = /(^|[^a-z0-9_@])@([a-z0-9_]{0,20})$/i.exec(text.slice(0, cursor));
  if (!m) return null;
  return { query: m[2].toLowerCase(), start: cursor - m[2].length - 1 };
}

/** Puts "@handle " in place of the @word being typed. Returns the new text and cursor. */
export function insertMention(text: string, at: { start: number }, cursor: number, handle: string) {
  return { text: `${text.slice(0, at.start)}@${handle} ${text.slice(cursor)}`, cursor: at.start + handle.length + 2 };
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
  const children = new Map<string, { reply: R; parent: R }[]>();
  for (const r of replies) {
    if (!r.parentId || !byId.has(r.parentId)) continue;
    const root = rootOf(r);
    children.set(root.id, [...(children.get(root.id) ?? []), { reply: r, parent: byId.get(r.parentId)! }]);
  }
  const byTime = (a: { createdAt: string }, b: { createdAt: string }) => a.createdAt.localeCompare(b.createdAt);
  return replies
    .filter((r) => !r.parentId || !byId.has(r.parentId))
    .sort(byTime)
    .map((reply) => ({ reply, children: (children.get(reply.id) ?? []).sort((a, b) => byTime(a.reply, b.reply)) }));
}

export const FORUM_REPORT_REASONS = [
  { id: 'spam', label: 'Reklam ya da istenmeyen içerik' },
  { id: 'hakaret', label: 'Hakaret, taciz ya da nefret söylemi' },
  { id: 'yaniltici', label: 'Yanıltıcı ya da tehlikeli bilgi' },
  { id: 'uygunsuz', label: 'Uygunsuz içerik' },
  { id: 'diger', label: 'Başka bir neden' },
] as const;

/** "3 yanıt", "Yanıt yok" */
export const repliesLabel = (n: number) => (n ? `${n} yanıt` : 'Yanıt yok');
