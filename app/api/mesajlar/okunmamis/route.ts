import { getUserId } from "@/lib/auth";
import { unreadConversations } from "@/lib/chat-data";

/** The header's unread badge. Signed out: 0. */
export async function GET() {
  const userId = await getUserId();
  const count = userId ? await unreadConversations(userId) : 0;
  return Response.json({ count }, { headers: { "Cache-Control": "no-store" } });
}
