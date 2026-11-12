import { remark } from "remark";
import html from "remark-html";
import { fold } from "@/data/demo-market";

/**
 * Haberler: written on /yonetim/haberler and kept in the database (lib/news-data.ts). These are the
 * rules shared by the editor (in the browser) and the server actions that save an article.
 */

/** What an article is: a support (hibe, ödeme), a news item or an announcement. */
export type ArticleKind = "destek" | "haber" | "duyuru";

/** The labels, in the editor's order. */
export const ARTICLE_KINDS: { id: ArticleKind; label: string; hint: string }[] = [
  { id: "destek", label: "Destek", hint: "Hibe, kredi, destek ödemesi, başvuru." },
  { id: "haber", label: "Haber", hint: "Tarım dünyasından bir gelişme." },
  { id: "duyuru", label: "Duyuru", hint: "Son tarih, kayıt, site duyurusu." },
];

export const isArticleKind = (v: unknown): v is ArticleKind => v === "destek" || v === "haber" || v === "duyuru";
export const kindLabel = (k: ArticleKind) => ARTICLE_KINDS.find((x) => x.id === k)?.label ?? "Haber";

/** A published article as the site shows it. */
export type Article = {
  slug: string;
  kind: ArticleKind;
  title: string;
  date: string;
  summary: string;
  cover?: string;
  /** Imported automatically (lib/services/news-import.ts): who published it, and the original. */
  source?: { name: string; url: string };
  html: string;
};

/** An article in a list (no body). */
export type ArticleSummary = Omit<Article, "html">;

export type ArticleStatus = "draft" | "published";

/** What the editor sends. */
export type ArticleInput = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  cover: string;
  date: string;
  status: ArticleStatus;
  kind: ArticleKind;
};

export type ArticleField = keyof ArticleInput;
export type ArticleErrors = Partial<Record<ArticleField, string>>;

export const TITLE_MIN = 5;
export const TITLE_MAX = 140;
export const SUMMARY_MIN = 10;
export const SUMMARY_MAX = 300;
export const BODY_MAX = 50_000;
export const SLUG_MAX = 80;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isSlug = (s: string) => SLUG_RE.test(s) && s.length <= SLUG_MAX;

/** "Buğday hasadı başladı!" → "bugday-hasadi-basladi"; "Konya'da" → "konyada" (the apostrophe before a suffix goes). */
export function slugify(title: string) {
  return fold(title)
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/, "");
}

/** A real calendar day in YYYY-MM-DD form. */
export function isDay(value: string) {
  if (!ISO_DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** A cover is one of our own uploads (Vercel Blob, haberler/) or a picture already on the site ("/demo/…"). */
export const isCover = (url: string) =>
  /^\/[\w./-]+\.(webp|jpe?g|png|avif)$/i.test(url) || /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/haberler\/[\w./-]+$/i.test(url);

export function validateArticle(a: ArticleInput): ArticleErrors {
  const e: ArticleErrors = {};
  const title = a.title.trim();
  if (title.length < TITLE_MIN) e.title = `Başlık en az ${TITLE_MIN} karakter olmalı.`;
  else if (title.length > TITLE_MAX) e.title = `Başlık en fazla ${TITLE_MAX} karakter olabilir.`;
  if (!isSlug(a.slug)) e.slug = "Adres yalnızca küçük harf, rakam ve tire içermeli (ör. bugday-hasadi-basladi).";
  const summary = a.summary.trim();
  if (summary.length < SUMMARY_MIN) e.summary = `Özeti yazın (en az ${SUMMARY_MIN} karakter); listede ve paylaşım önizlemesinde görünür.`;
  else if (summary.length > SUMMARY_MAX) e.summary = `Özet en fazla ${SUMMARY_MAX} karakter olabilir.`;
  if (a.status === "published" && !a.body.trim()) e.body = "Yayınlamadan önce haberin metnini yazın.";
  if (a.body.length > BODY_MAX) e.body = "Metin çok uzun.";
  if (a.cover && !isCover(a.cover)) e.cover = "Kapak fotoğrafı yüklenemedi; kaldırıp yeniden ekleyin.";
  if (!isDay(a.date)) e.date = "Tarihi seçin.";
  if (a.status !== "draft" && a.status !== "published") e.status = "Durumu seçin.";
  if (!isArticleKind(a.kind)) e.kind = "Türünü seçin: Destek, Haber ya da Duyuru.";
  return e;
}

/** The editor's order, for the error summary. */
export const ARTICLE_FIELD_ORDER: ArticleField[] = ["title", "slug", "summary", "date", "cover", "body", "kind", "status"];

/** Markdown to HTML. remark-html sanitizes, so raw HTML or scripts in the text are dropped. */
export function renderMarkdown(markdown: string) {
  return String(remark().use(html).processSync(markdown));
}

/** The article's share (Open Graph) image: its cover, or the site share image for WhatsApp previews. */
export function shareImage(cover: string | undefined): string | { url: string; width: number; height: number } {
  return cover ?? { url: "/opengraph-image", width: 1200, height: 630 };
}
