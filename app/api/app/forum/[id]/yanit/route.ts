import { appUserId, body, handler, invalid, json, requireNamedProfile } from "@/lib/app-api";
import { getTopic } from "@/lib/forum-data";
import { replyFor } from "@/lib/services/forum";

/** "Yanıt yaz": { body }; answers with the topic as it is now. */
export const POST = handler<{ id: string }>(async (req, { id }) => {
  const profile = await requireNamedProfile(req);
  const r = await replyFor(profile.userId, id, (await body(req)).body);
  if (!r.ok) return invalid({ error: r.message });
  return json({ topic: await getTopic(id, await appUserId(req)) }, 201);
});
