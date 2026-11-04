import { handler, json, requireAppUser } from "@/lib/app-api";
import { listNotifications, markNotificationsRead } from "@/lib/services/notifications";

/** "Bildirimler": answers to your topics and replies, and mentions of you, newest first. */
export const GET = handler(async (req) => {
  const userId = await requireAppUser(req);
  return json({ items: await listNotifications(userId) });
});

/** Marks them all as seen (the app does this when the screen opens). */
export const POST = handler(async (req) => {
  const userId = await requireAppUser(req);
  await markNotificationsRead(userId);
  return json({ ok: true });
});
