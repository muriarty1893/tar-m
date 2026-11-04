import { appUserId, handler, json } from "@/lib/app-api";
import { unreadConversations } from "@/lib/chat-data";

/** The bell's badge: chats with messages the person hasn't seen. Signed out: 0. */
export const GET = handler(async (req) => {
  const userId = await appUserId(req);
  return json({ count: userId ? await unreadConversations(userId) : 0 });
});
