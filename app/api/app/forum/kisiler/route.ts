import { handler, json, requireAppUser } from "@/lib/app-api";
import { mentionSuggestions } from "@/lib/forum-data";

/** "@ah…" while writing: up to six people to mention (?q=ah&konu=<topic id>), the topic's own first. */
export const GET = handler(async (req) => {
  const userId = await requireAppUser(req);
  const url = new URL(req.url);
  return json({ items: await mentionSuggestions(url.searchParams.get("q") ?? "", url.searchParams.get("konu"), userId) });
});
