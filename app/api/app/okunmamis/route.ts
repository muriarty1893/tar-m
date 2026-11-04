import { appUserId, handler, json } from "@/lib/app-api";
import { unreadConversations } from "@/lib/chat-data";
import { unreadNotifications } from "@/lib/services/notifications";

/** The bell's badge: chats with messages the person hasn't seen (`count`), and unseen notifications. Signed out: 0. */
export const GET = handler(async (req) => {
  const userId = await appUserId(req);
  if (!userId) return json({ count: 0, notifications: 0 });
  const [count, notifications] = await Promise.all([unreadConversations(userId), unreadNotifications(userId)]);
  return json({ count, notifications });
});
