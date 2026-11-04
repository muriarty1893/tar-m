/** Forum: the website's rules (lib/forum.ts), so the app's forms refuse what the server would. Change both together. */
import type { ForumCategory, ForumSort, TopicInput } from '@/api/types';

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

export function validateReply(body: string): string | null {
  const b = body.trim();
  if (b.length < 2) return 'Bir yanıt yazın.';
  if (b.length > REPLY_MAX) return `Yanıt en fazla ${REPLY_MAX} karakter olabilir.`;
  return null;
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
