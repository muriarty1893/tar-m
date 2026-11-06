import { isUuid, sql } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

/**
 * A topic page was opened: +1 to its real view count. The page sends this once per topic per browser
 * session (components/forum/CountView.tsx); an IP gets 120 a minute at most, so a script can't run
 * the count up. Answers 204 either way: there's nothing for the page to show.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (isUuid(id) && checkRateLimit(`view:${clientIp(req)}`, 120, 60_000)) {
    await sql()`update forum_topics set view_count = view_count + 1 where id = ${id}`.catch((err) => console.error("view count", err));
  }
  return new Response(null, { status: 204 });
}
