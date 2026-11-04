import { absolute, handler, json, requireAppAdmin } from "@/lib/app-api";
import { listAllArticles } from "@/lib/news-data";
import { adminCounts } from "@/lib/services/admin";

/** The dashboard's overview: the numbers and the five latest articles. */
export const GET = handler(async (req) => {
  await requireAppAdmin(req);
  const [counts, articles] = await Promise.all([adminCounts(), listAllArticles()]);
  return json({ counts, articles: articles.slice(0, 5).map((a) => ({ ...a, cover: a.cover ? absolute(req, a.cover) : undefined })) });
});
