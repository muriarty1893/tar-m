import { ApiError, handler, json, requireAppUser } from "@/lib/app-api";
import { isAdmin } from "@/lib/auth";
import { deleteReplyFor } from "@/lib/services/forum";

/** The author (or an admin) deletes a reply. */
export const DELETE = handler<{ id: string }>(async (req, { id }) => {
  const userId = await requireAppUser(req);
  const topicId = await deleteReplyFor(userId, await isAdmin(userId), id);
  if (!topicId) throw new ApiError(404, "Bu yanıtı silemezsiniz.");
  return json({ ok: true, topicId });
});
