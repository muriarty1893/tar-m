import { connection } from "next/server";
import { expireTag } from "@/lib/app-api";
import { NEWS_TAG } from "@/lib/news-data";
import { importNews } from "@/lib/services/news-import";

/** A run over every news source can take a minute: pages are fetched one at a time, with pauses. */
export const maxDuration = 300;

/**
 * Vercel Cron (vercel.json), once a day: new TKDK and Ministry items onto Haberler. Vercel sends
 * `Authorization: Bearer $CRON_SECRET`; anyone else is turned away.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Yetkisiz." }, { status: 401 });
  }
  await connection();
  const reports = await importNews();
  if (reports.some((r) => r.added.length)) expireTag(NEWS_TAG);
  for (const r of reports) if (r.errors.length) console.error(`[haberler] ${r.source}:`, r.errors.join(" | "));
  return Response.json({ reports });
}
