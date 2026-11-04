import { ApiError, body, expireTag, handler, invalid, json, requireAppAdmin } from "@/lib/app-api";
import { NEWS_TAG, getArticleById } from "@/lib/news-data";
import { deleteArticleFor, saveArticleFor } from "@/lib/services/admin";

/** An article for the editor (cover as saved, so it round-trips: Blob URL or a /demo/… path). */
export const GET = handler<{ id: string }>(async (req, { id }) => {
  await requireAppAdmin(req);
  const article = await getArticleById(id);
  if (!article) throw new ApiError(404, "Haber bulunamadı.");
  return json({ article });
});

export const PUT = handler<{ id: string }>(async (req, { id }) => {
  const adminId = await requireAppAdmin(req);
  const saved = await saveArticleFor(adminId, await body(req), id);
  if (!saved.saved) return invalid({ errors: saved.errors, message: saved.message });
  expireTag(NEWS_TAG);
  return json({ id });
});

export const DELETE = handler<{ id: string }>(async (req, { id }) => {
  await requireAppAdmin(req);
  if (!(await deleteArticleFor(id))) throw new ApiError(404, "Haber bulunamadı.");
  expireTag(NEWS_TAG);
  return json({ ok: true });
});
