import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { day, iso, isUuid, sql, str, type Row } from "./db";
import { isArticleKind, renderMarkdown, type Article, type ArticleStatus, type ArticleSummary } from "./news";

/** Reads for Haberler. Public reads are cached and refreshed when an article is saved (NEWS_TAG). */

export const NEWS_TAG = "news";

const toSummary = (r: Row): ArticleSummary => ({
  slug: str(r.slug),
  kind: isArticleKind(r.kind) ? r.kind : "haber",
  title: str(r.title),
  date: day(r.published_on),
  summary: str(r.summary),
  cover: r.cover ? str(r.cover) : undefined,
  source: r.source_url ? { name: str(r.source_name), url: str(r.source_url) } : undefined,
});

/** Published articles, newest first (same day: by address). */
export async function listPublished(): Promise<ArticleSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(NEWS_TAG);
  if (!process.env.DATABASE_URL) return [];
  const rows = await sql()`
    select slug, kind, title, summary, cover, published_on, source_name, source_url from articles
    where status = 'published' order by published_on desc, slug asc`;
  return rows.map(toSummary);
}

/** One published article, rendered; null for drafts and unknown addresses. */
export async function getPublished(slug: string): Promise<Article | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(NEWS_TAG);
  if (!process.env.DATABASE_URL) return null;
  const rows = await sql()`select slug, kind, title, summary, cover, published_on, source_name, source_url, body from articles where slug = ${slug} and status = 'published'`;
  const r = rows[0];
  return r ? { ...toSummary(r), html: renderMarkdown(str(r.body)) } : null;
}

// ---------------------------------------------------------------- For the dashboard (uncached)

export type AdminArticle = ArticleSummary & {
  id: string;
  body: string;
  status: ArticleStatus;
  updatedAt: string;
};

const toAdmin = (r: Row): AdminArticle => ({
  ...toSummary(r),
  id: str(r.id),
  body: str(r.body),
  status: str(r.status) as ArticleStatus,
  updatedAt: iso(r.updated_at),
});

export async function listAllArticles(): Promise<AdminArticle[]> {
  const rows = await sql()`select * from articles order by (status = 'draft') desc, published_on desc, updated_at desc`;
  return rows.map(toAdmin);
}

export async function getArticleById(id: string): Promise<AdminArticle | null> {
  if (!isUuid(id)) return null;
  const rows = await sql()`select * from articles where id = ${id}`;
  return rows[0] ? toAdmin(rows[0]) : null;
}
