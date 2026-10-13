import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type Article = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  cover?: string;
  html: string;
};

const DEFAULT_DIR = path.join(process.cwd(), "content", "haberler");
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * YAML turns `2026-13-45` into a rolled-over Date, so validate the raw
 * front-matter text: it must be a real calendar day in YYYY-MM-DD form.
 */
function normaliseDate(rawFrontMatter: string): string | null {
  const value = /^date:\s*["']?([^"'\n]*?)["']?\s*$/m.exec(rawFrontMatter)?.[1];
  if (!value || !ISO_DATE_RE.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value ? value : null;
}

function nonEmpty(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

// Reads are synchronous on purpose: with Cache Components, sync fs access is
// prerendered at build time, so news pages stay fully static.
function readArticle(file: string): Article {
  const name = path.basename(file);
  const slug = name.replace(/\.md$/, "");
  const fail = (what: string) => {
    throw new Error(`Haber dosyası geçersiz: ${name} — ${what}`);
  };
  if (!SLUG_RE.test(slug)) {
    fail("dosya adı yalnızca küçük harf, rakam ve tire içermeli (ör. bugday-hasadi.md)");
  }

  // Passing options bypasses gray-matter's cache, whose hits drop `.matter`.
  const parsed = matter(fs.readFileSync(file, "utf8"), {});
  const { data, content } = parsed;
  const title = nonEmpty(data.title) ?? fail("'title' alanı eksik");
  const date = normaliseDate(parsed.matter) ?? fail("'date' alanı eksik veya YYYY-MM-DD biçiminde değil");
  const summary = nonEmpty(data.summary) ?? fail("'summary' alanı eksik");
  const cover = nonEmpty(data.cover) ?? undefined;

  return {
    slug,
    title: title as string,
    date: date as string,
    summary: summary as string,
    cover,
    html: String(remark().use(html).processSync(content)),
  };
}

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(dir, f));
}

export async function getAllArticles(dir: string = DEFAULT_DIR): Promise<Article[]> {
  return listFiles(dir)
    .map(readArticle)
    .sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : a.date < b.date ? 1 : -1));
}

export async function getArticle(slug: string, dir: string = DEFAULT_DIR): Promise<Article | null> {
  if (!SLUG_RE.test(slug)) return null;
  const file = path.join(dir, `${slug}.md`);
  return fs.existsSync(file) ? readArticle(file) : null;
}

/** The article's share (Open Graph) image: its cover, or the site share image for WhatsApp previews. */
export function shareImage(cover: string | undefined): string | { url: string; width: number; height: number } {
  return cover ?? { url: "/opengraph-image", width: 1200, height: 630 };
}
