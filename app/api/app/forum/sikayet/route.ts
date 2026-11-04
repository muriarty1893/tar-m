import { body, handler, invalid, json, requireNamedProfile } from "@/lib/app-api";
import { reportForumFor } from "@/lib/services/forum";

/** "Şikâyet et": { topicId, replyId?, reason, note }. */
export const POST = handler(async (req) => {
  const profile = await requireNamedProfile(req);
  const r = await reportForumFor(profile.userId, await body(req));
  return r.ok ? json({ ok: true }) : invalid({ message: r.message });
});
