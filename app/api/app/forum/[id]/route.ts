import { ApiError, appUserId, handler, json, requireAppUser } from "@/lib/app-api";
import { isAdmin } from "@/lib/auth";
import { getTopic } from "@/lib/forum-data";
import { deleteTopicFor } from "@/lib/services/forum";

/** A topic with its replies; `admin` says whether the viewer may delete any post. */
export const GET = handler<{ id: string }>(async (req, { id }) => {
  const userId = await appUserId(req);
  const topic = await getTopic(id, userId);
  if (!topic) throw new ApiError(404, "Konu bulunamadı; silinmiş olabilir.");
  return json({ topic, admin: await isAdmin(userId) });
});

/** The author (or an admin) deletes the topic, with its replies. */
export const DELETE = handler<{ id: string }>(async (req, { id }) => {
  const userId = await requireAppUser(req);
  if (!(await deleteTopicFor(userId, await isAdmin(userId), id))) throw new ApiError(404, "Bu konuyu silemezsiniz.");
  return json({ ok: true });
});
