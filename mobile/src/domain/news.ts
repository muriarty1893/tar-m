/** Haberler's editor rules, as on the website (lib/news.ts): the app's editor refuses what the server would. */
import type { ArticleInput } from '@/api/types';

import { fold } from './text';

export const TITLE_MIN = 5;
export const TITLE_MAX = 140;
export const SUMMARY_MIN = 10;
export const SUMMARY_MAX = 300;
export const BODY_MAX = 50_000;
export const SLUG_MAX = 80;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const isSlug = (s: string) => SLUG_RE.test(s) && s.length <= SLUG_MAX;

/** "Buğday hasadı başladı!" → "bugday-hasadi-basladi"; "Konya'da" → "konyada". */
export function slugify(title: string) {
  return fold(title)
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX)
    .replace(/-+$/, '');
}

export function isDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export type ArticleErrors = Partial<Record<keyof ArticleInput, string>>;

export function validateArticle(a: ArticleInput): ArticleErrors {
  const e: ArticleErrors = {};
  const title = a.title.trim();
  if (title.length < TITLE_MIN) e.title = `Başlık en az ${TITLE_MIN} karakter olmalı.`;
  else if (title.length > TITLE_MAX) e.title = `Başlık en fazla ${TITLE_MAX} karakter olabilir.`;
  if (!isSlug(a.slug)) e.slug = 'Adres yalnızca küçük harf, rakam ve tire içermeli (ör. bugday-hasadi-basladi).';
  const summary = a.summary.trim();
  if (summary.length < SUMMARY_MIN) e.summary = `Özeti yazın (en az ${SUMMARY_MIN} karakter); listede ve paylaşım önizlemesinde görünür.`;
  else if (summary.length > SUMMARY_MAX) e.summary = `Özet en fazla ${SUMMARY_MAX} karakter olabilir.`;
  if (a.status === 'published' && !a.body.trim()) e.body = 'Yayınlamadan önce haberin metnini yazın.';
  if (a.body.length > BODY_MAX) e.body = 'Metin çok uzun.';
  if (!isDay(a.date)) e.date = 'Tarihi seçin.';
  return e;
}

export const ARTICLE_FIELD_ORDER: (keyof ArticleInput)[] = ['title', 'slug', 'summary', 'date', 'cover', 'body', 'status'];
export const ARTICLE_FIELD_NAMES: Record<keyof ArticleInput, string> = { title: 'Başlık', slug: 'Adres', summary: 'Özet', date: 'Tarih', cover: 'Kapak', body: 'Metin', status: 'Durum' };

/** The Markdown toolbar: what each button puts around (or before) the selected text. */
export type MarkdownTool = { id: string; label: string; before: string; after?: string; line?: boolean; sample: string };
export const MARKDOWN_TOOLS: MarkdownTool[] = [
  { id: 'h2', label: 'Ara başlık', before: '## ', line: true, sample: 'Ara başlık' },
  { id: 'bold', label: 'Kalın', before: '**', after: '**', sample: 'kalın yazı' },
  { id: 'italic', label: 'İtalik', before: '_', after: '_', sample: 'italik yazı' },
  { id: 'ul', label: 'Madde listesi', before: '- ', line: true, sample: 'Madde' },
  { id: 'ol', label: 'Numaralı liste', before: '1. ', line: true, sample: 'Madde' },
  { id: 'quote', label: 'Alıntı', before: '> ', line: true, sample: 'Alıntı' },
  { id: 'link', label: 'Bağlantı', before: '[', after: '](https://)', sample: 'bağlantı metni' },
];

/**
 * Applies a toolbar button to the text and selection; returns the new text and where the cursor goes.
 * Inline formats wrap the selection (or a sample); line formats apply to the cursor's line.
 */
export function applyTool(text: string, sel: { start: number; end: number }, tool: MarkdownTool) {
  const picked = text.slice(sel.start, sel.end) || tool.sample;
  if (tool.line) {
    const lineStart = text.lastIndexOf('\n', sel.start - 1) + 1;
    const next = text.indexOf('\n', sel.start);
    const lineEnd = next === -1 ? text.length : next;
    // An empty line gets the format and a sample to type over.
    if (!text.slice(lineStart, lineEnd).trim() && sel.start === sel.end) {
      const inserted = tool.before + tool.sample;
      return { text: text.slice(0, lineStart) + inserted + text.slice(lineEnd), selection: { start: lineStart + tool.before.length, end: lineStart + inserted.length } };
    }
    // Otherwise the line the cursor is on becomes the heading, list item or quote.
    return { text: text.slice(0, lineStart) + tool.before + text.slice(lineStart), selection: { start: sel.start + tool.before.length, end: sel.end + tool.before.length } };
  }
  const inserted = `${tool.before}${picked}${tool.after ?? ''}`;
  const next = text.slice(0, sel.start) + inserted + text.slice(sel.end);
  const start = sel.start + tool.before.length;
  return { text: next, selection: { start, end: start + picked.length } };
}
