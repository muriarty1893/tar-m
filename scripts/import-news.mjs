// Imports Markdown articles (content/haberler/*.md, front matter: title, date, summary, cover) into
// the `articles` table as published news. An article whose slug already exists is left alone.
// Run with `npm run news:import`. After importing, edit news on /yonetim/haberler.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run `vercel env pull .env.local` first.");
  process.exit(1);
}
const sql = neon(url);
const dir = path.join(process.cwd(), "content", "haberler");
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".md")) : [];
let added = 0;
for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"), {});
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
  const rows = await sql`
    insert into articles (slug, title, summary, body, cover, published_on, status)
    values (${slug}, ${String(data.title).trim()}, ${String(data.summary).trim()}, ${content.trim()}, ${data.cover ?? null}, ${date}, 'published')
    on conflict (slug) do nothing returning id`;
  if (rows.length) added++;
  console.log(`${rows.length ? "imported" : "exists  "} ${slug}`);
}
console.log(`${added} of ${files.length} imported.`);
