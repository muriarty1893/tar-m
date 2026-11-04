import { connection } from "next/server";
import { ApiError, absolute, handler, json } from "@/lib/app-api";
import { getPublished } from "@/lib/news-data";
import { isSlug } from "@/lib/news";

/** One published article, its text as sanitized HTML (remark-html). */
export const GET = handler<{ slug: string }>(async (req, { slug }) => {
  await connection();
  const article = isSlug(slug) ? await getPublished(slug) : null;
  if (!article) throw new ApiError(404, "Haber bulunamadı.");
  return json({ article: { ...article, cover: article.cover ? absolute(req, article.cover) : undefined } });
});
