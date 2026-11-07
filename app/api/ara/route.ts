import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { suggest } from "@/lib/search-data";

/** The search box's list while typing (?q=buğday): topics, replies, listings and news. */
export async function GET(req: Request) {
  if (!checkRateLimit(`ara:${clientIp(req)}`, 120, 60_000)) return Response.json({ items: [] }, { status: 429 });
  const q = new URL(req.url).searchParams.get("q") ?? "";
  try {
    return Response.json({ items: await suggest(q) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    console.error("search suggestions", err);
    return Response.json({ items: [] }, { status: 500 });
  }
}
