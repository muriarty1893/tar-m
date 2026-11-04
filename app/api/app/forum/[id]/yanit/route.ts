import { appUserId, body, handler, invalid, json, requireNamedProfile } from "@/lib/app-api";
import { getTopic } from "@/lib/forum-data";
import { replyFor } from "@/lib/services/forum";

/**
 * "Yanıt yaz": { body, parentId?, photos? }. `parentId` answers one of the topic's replies (as on X);
 * photos are up to 4 addresses from /api/app/foto?klasor=forum. Answers with the topic as it is now.
 */
export const POST = handler<{ id: string }>(async (req, { id }) => {
  const profile = await requireNamedProfile(req);
  const b = await body(req);
  const r = await replyFor(profile.userId, id, { body: b.body, parentId: b.parentId, photos: b.photos });
  if (!r.ok) return invalid({ error: r.message });
  return json({ topic: await getTopic(id, await appUserId(req)), replyId: r.id }, 201);
});
