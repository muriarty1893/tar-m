import "server-only";
import { sql } from "@/lib/db";
import { countVisits, siteStats, type StatRow } from "@/lib/services/site-stats";
import { weekWindows, type WeekWindows } from "@/lib/weekly-report";

export type Pair = { now: number; prev: number };
export type WeeklyReport = {
  week: WeekWindows;
  /** Null when the statistics token is missing or Vercel can't be reached. */
  visits: { visitors: Pair; pageviews: Pair; topReferrer: StatRow | null; phoneShare: number | null; topPage: StatRow | null; topTopic: StatRow | null } | null;
  members: Pair;
  topics: Pair;
  replies: Pair;
  listings: Pair;
  chats: Pair;
  /** Open complaints right now, not per week. */
  openReports: number;
};

/** The last 7 days against the 7 before; sample content (`demo_…`) left out. */
export async function weeklyReport(now: Date): Promise<WeeklyReport> {
  const week = weekWindows(now);
  const { thisStart, thisEnd, prevStart } = week;
  const q = sql();
  const pair = (r: Record<string, unknown> | undefined): Pair => ({ now: Number(r?.now ?? 0), prev: Number(r?.prev ?? 0) });
  // Rows from sample members (`demo_…`); the backslash makes `_` literal in LIKE.
  const demo = "demo\\_%";
  const per = `count(*) filter (where created_at >= $1) as now, count(*) filter (where created_at < $1) as prev`;
  const inWeeks = `created_at >= $2 and created_at < $3`;
  const counts = (table: "profiles" | "forum_topics" | "forum_replies" | "listings" | "conversations", owner: string) =>
    q.query(`select ${per} from ${table} where ${inWeeks} and ${owner} not like $4`, [thisStart, prevStart, thisEnd, demo]);

  const [members, topics, replies, listings, chats, open, visitsNow, visitsPrev, stats] = await Promise.all([
    counts("profiles", "user_id"),
    counts("forum_topics", "author_id"),
    counts("forum_replies", "author_id"),
    counts("listings", "seller_id"),
    counts("conversations", "buyer_id"),
    q`select (select count(*) from reports where resolved_at is null) + (select count(*) from forum_reports where resolved_at is null) as n`,
    countVisits(thisStart, thisEnd),
    countVisits(prevStart, thisStart),
    siteStats(7, now),
  ]);

  let visits: WeeklyReport["visits"] = null;
  if (visitsNow && visitsPrev && stats.ok) {
    const s = stats.stats;
    const devices = s.devices.reduce((sum, r) => sum + r.visitors, 0);
    const phone = s.devices.find((r) => r.label === "Telefon")?.visitors ?? 0;
    visits = {
      visitors: { now: visitsNow.visitors, prev: visitsPrev.visitors },
      pageviews: { now: visitsNow.pageviews, prev: visitsPrev.pageviews },
      topReferrer: s.referrers.find((r) => r.label !== "Sitenin kendisi") ?? null,
      phoneShare: devices ? Math.round((phone / devices) * 100) : null,
      topPage: s.pages.find((r) => r.label !== "Yönetim paneli") ?? null,
      topTopic: s.pages.find((r) => r.label.startsWith("Forum: ") && r.label !== "Forum: yeni konu" && r.label !== "Forum: silinmiş konu") ?? null,
    };
  }

  return {
    week,
    visits,
    members: pair(members[0]),
    topics: pair(topics[0]),
    replies: pair(replies[0]),
    listings: pair(listings[0]),
    chats: pair(chats[0]),
    openReports: Number(open[0]?.n ?? 0),
  };
}
