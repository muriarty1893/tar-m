import { absolute, body, expireTag, handler, invalid, json, requireAppAdmin } from "@/lib/app-api";
import { NEWS_TAG, listAllArticles } from "@/lib/news-data";
import { saveArticleFor } from "@/lib/services/admin";

/** Every article, drafts first. */
export const GET = handler(async (req) => {
  await requireAppAdmin(req);
  const items = await listAllArticles();
  return json({ items: items.map((a) => ({ ...a, cover: a.cover ? absolute(req, a.cover) : undefined })) });
});

/** A new article: { title, slug, summary, body, cover, date, status }. */
export const POST = handler(async (req) => {
  const adminId = await requireAppAdmin(req);
  const saved = await saveArticleFor(adminId, await body(req));
  if (!saved.saved) return invalid({ errors: saved.errors, message: saved.message });
  expireTag(NEWS_TAG);
  return json({ id: saved.id }, 201);
});
