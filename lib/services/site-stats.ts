import "server-only";
import { sql } from "@/lib/db";
import {
  countryLabel,
  deviceLabel,
  mergeByLabel,
  osLabel,
  pageLabel,
  pageRef,
  periodRange,
  referrerLabel,
  type PageTitles,
  type StatPeriod,
} from "@/lib/site-stats";

/**
 * Visit statistics from Vercel Web Analytics, read with a Vercel access token kept in
 * `VERCEL_ANALYTICS_TOKEN` (server only). Production traffic only, as in Vercel's own Analytics tab.
 */
const API = "https://api.vercel.com/v1/query/web-analytics/visits";
const PROJECT_ID = process.env.VERCEL_ANALYTICS_PROJECT_ID || "prj_4o3RLI4BMoujAIP3ifg5SWsQiBnL";
const TEAM_ID = process.env.VERCEL_ANALYTICS_TEAM_ID || "team_8wn1Qu1VDGfgPaax2pi5hBGj";

export type StatRow = { label: string; visitors: number; pageviews: number };
export type SiteStats = {
  visitors: number;
  pageviews: number;
  days: { date: string; visitors: number; pageviews: number }[];
  pages: StatRow[];
  referrers: StatRow[];
  countries: StatRow[];
  devices: StatRow[];
  systems: StatRow[];
};
export type SiteStatsResult = { ok: true; stats: SiteStats } | { ok: false; reason: "no-token" | "error" };

type Counts = { visitors?: number; pageviews?: number };

async function query<T>(path: "count" | "aggregate", params: Record<string, string>, token: string): Promise<T> {
  const qs = new URLSearchParams({ projectId: PROJECT_ID, teamId: TEAM_ID, ...params });
  const res = await fetch(`${API}/${path}?${qs}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Vercel Web Analytics ${path} ${params.by ?? ""}: HTTP ${res.status}`);
  return ((await res.json()) as { data: T }).data;
}

const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** Titles for the forum topics, listings, articles and forum sections among the visited pages. */
async function pageTitles(paths: string[]): Promise<PageTitles> {
  const refs = paths.map(pageRef);
  const ids = (kind: string) => [...new Set(refs.flatMap((r) => (r.kind === kind ? [("id" in r ? r.id : "slug" in r ? r.slug : "") as string] : [])))];
  const [topics, listings, articles, categories] = [ids("topic"), ids("listing"), ids("article"), ids("category")];
  const q = sql();
  const [t, l, a, c] = await Promise.all([
    topics.length ? q`select id::text as k, title as v from forum_topics where id = any(${topics}::uuid[])` : [],
    listings.length ? q`select id::text as k, title as v from listings where id = any(${listings}::uuid[])` : [],
    articles.length ? q`select slug as k, title as v from articles where slug = any(${articles}::text[])` : [],
    categories.length ? q`select id as k, name as v from forum_categories where id = any(${categories}::text[])` : [],
  ]);
  const map = (rows: Record<string, unknown>[]) => new Map(rows.map((r) => [String(r.k), String(r.v)]));
  return { topics: map(t), listings: map(l), articles: map(a), categories: map(c) };
}

export async function siteStats(days: StatPeriod, now: Date): Promise<SiteStatsResult> {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  if (!token) return { ok: false, reason: "no-token" };
  const range = periodRange(days, now);
  try {
    type Grouped = Record<string, unknown>[];
    const [total, daily, paths, refs, countries, devices, systems] = await Promise.all([
      query<Counts>("count", range, token),
      query<Grouped>("aggregate", { ...range, by: "day", limit: "100" }, token),
      query<Grouped>("aggregate", { ...range, by: "requestPath", limit: "50" }, token),
      query<Grouped>("aggregate", { ...range, by: "referrerHostname", limit: "20" }, token),
      query<Grouped>("aggregate", { ...range, by: "country", limit: "20" }, token),
      query<Grouped>("aggregate", { ...range, by: "deviceType", limit: "10" }, token),
      query<Grouped>("aggregate", { ...range, by: "osName", limit: "10" }, token),
    ]);
    const rows = (data: Grouped, key: string) => data.map((r) => ({ key: String(r[key] ?? ""), visitors: n(r.visitors), pageviews: n(r.pageviews) }));
    const pathRows = rows(paths, "requestPath").filter((r) => r.key !== "Others");
    let titles: PageTitles = { topics: new Map(), listings: new Map(), articles: new Map(), categories: new Map() };
    try {
      titles = await pageTitles(pathRows.map((r) => r.key));
    } catch (e) {
      console.error("site stats: page titles", e);
    }
    const ranked = (data: Grouped, key: string, label: (k: string) => string) => mergeByLabel(rows(data, key), (r) => (r.key === "Others" ? "Diğer" : label(r.key)));
    return {
      ok: true,
      stats: {
        visitors: n(total.visitors),
        pageviews: n(total.pageviews),
        days: daily.map((r) => ({ date: String(r.timestamp ?? "").slice(0, 10), visitors: n(r.visitors), pageviews: n(r.pageviews) })).filter((d) => d.date),
        pages: mergeByLabel(pathRows, (r) => pageLabel(r.key, titles)).slice(0, 15),
        referrers: ranked(refs, "referrerHostname", referrerLabel).slice(0, 10),
        countries: ranked(countries, "country", countryLabel).slice(0, 10),
        devices: ranked(devices, "deviceType", deviceLabel),
        systems: ranked(systems, "osName", osLabel),
      },
    };
  } catch (e) {
    console.error("site stats", e);
    return { ok: false, reason: "error" };
  }
}
