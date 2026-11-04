import { getUserId } from "@/lib/auth";
import { mentionSuggestions } from "@/lib/forum-data";

/** "@ah…" while writing: up to six people to mention, the topic's own first (?q=ah&konu=<id>). Signed in only. */
export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) return Response.json({ items: [] }, { status: 401 });
  const url = new URL(request.url);
  const items = await mentionSuggestions(url.searchParams.get("q") ?? "", url.searchParams.get("konu"), userId);
  return Response.json({ items }, { headers: { "Cache-Control": "private, no-store" } });
}
