import { getUserId } from "@/lib/auth";
import { unreadConversations } from "@/lib/chat-data";
import { unreadNotifications } from "@/lib/services/notifications";

/** The header's badges: chats with unread messages (`count`) and unseen notifications. Signed out: 0. */
export async function GET() {
  const userId = await getUserId();
  const [count, notifications] = userId ? await Promise.all([unreadConversations(userId), unreadNotifications(userId)]) : [0, 0];
  return Response.json({ count, notifications }, { headers: { "Cache-Control": "no-store" } });
}
