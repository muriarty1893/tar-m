import { ApiError, body, handler, json, requireAppAdmin } from "@/lib/app-api";
import { moderateForumFor, openForumReports } from "@/lib/services/forum";

/** Reported forum posts, the most reported first. */
export const GET = handler(async (req) => {
  await requireAppAdmin(req);
  return json({ items: await openForumReports() });
});

/** { topicId, replyId?, action: "remove" | "dismiss" }. */
export const POST = handler(async (req) => {
  const adminId = await requireAppAdmin(req);
  if (!(await moderateForumFor(adminId, await body(req)))) throw new ApiError(400, "Yapılamadı; içerik silinmiş olabilir.");
  return json({ ok: true });
});
