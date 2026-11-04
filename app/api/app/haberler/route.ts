import { connection } from "next/server";
import { absolute, handler, json } from "@/lib/app-api";
import { listPublished } from "@/lib/news-data";

/** Haberler: published articles, newest first (cached; refreshed whenever an article is saved). */
export const GET = handler(async (req) => {
  await connection();
  const items = await listPublished();
  return json({ items: items.map((a) => ({ ...a, cover: a.cover ? absolute(req, a.cover) : undefined })) });
});
