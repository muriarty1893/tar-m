import { ApiError, body, handler, json, requireAppUser } from "@/lib/app-api";
import { toggleLikeFor } from "@/lib/services/forum";

/** ♥: { topicId, replyId? } turns the like on, or off again. Answers { liked, count }. */
export const POST = handler(async (req) => {
  const userId = await requireAppUser(req);
  const b = await body(req);
  const replyId = typeof b.replyId === "string" && b.replyId ? b.replyId : null;
  const r = await toggleLikeFor(userId, typeof b.topicId === "string" ? b.topicId : "", replyId);
  if (!r) throw new ApiError(404, "Beğenilemedi; içerik silinmiş olabilir.");
  return json(r);
});
