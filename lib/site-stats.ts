/**
 * Readable Turkish labels for the visit statistics (Yönetim → İstatistikler): pages, where visitors
 * came from, devices and countries, as Vercel Web Analytics reports them. Pure functions, no I/O.
 */

export const STAT_PERIODS = [7, 30, 90] as const;
export type StatPeriod = (typeof STAT_PERIODS)[number];

/** `?gun=30` → 30; anything else → 7. */
export function parsePeriod(v: string | undefined): StatPeriod {
  const n = Number(v);
  return (STAT_PERIODS as readonly number[]).includes(n) ? (n as StatPeriod) : 7;
}

/**
 * The window for the last `days` days, today included: from 00:00 UTC `days - 1` days ago to the end
 * of today (next 00:00 UTC). It must end at midnight: Vercel's count query rounds `until` down to the
 * day, so ending at "now" would leave today out of the totals. `today` is "YYYY-MM-DD", for dropping
 * days after it from the daily breakdown. Vercel counts days in UTC, so a visit between 00:00 and
 * 03:00 Türkiye time falls on the day before.
 */
export function periodRange(days: StatPeriod, now: Date): { since: string; until: string; today: string } {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  return {
    since: new Date(Date.UTC(y, m, d - (days - 1))).toISOString(),
    until: new Date(Date.UTC(y, m, d + 1)).toISOString(),
    today: new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10),
  };
}

const STATIC_PAGES: Record<string, string> = {
  "/": "Ana sayfa",
  "/pazar": "Pazar",
  "/pazar/ilan-ver": "İlan ver",
  "/pazar/kurallar": "Pazar kuralları",
  "/fiyatlar": "Fiyatlar",
  "/hava": "Hava durumu",
  "/takvim": "Takvim",
  "/tarlalarim": "Tarlalarım",
  "/haberler": "Destek & Haber",
  "/forum": "Forum",
  "/forum/yeni": "Forum: yeni konu",
  "/is-birligi": "İş birliği",
  "/sss": "SSS",
  "/hakkimizda": "Hakkımızda",
  "/gizlilik": "Gizlilik ve KVKK",
  "/kaynaklar": "Görsel kaynakları",
  "/giris": "Giriş",
  "/kayit": "Kayıt",
  "/hesabim": "Hesabım",
  "/mesajlar": "Mesajlar",
  "/bildirimler": "Bildirimler",
};

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

/** What a page address points at, so its title can be looked up. */
export type PageRef =
  | { kind: "static"; label: string }
  | { kind: "topic"; id: string }
  | { kind: "listing"; id: string }
  | { kind: "article"; slug: string }
  | { kind: "category"; id: string }
  | { kind: "person"; handle: string }
  | { kind: "admin" }
  | { kind: "other" };

export function pageRef(path: string): PageRef {
  const p = path.length > 1 ? path.replace(/\/+$/, "") : path;
  if (STATIC_PAGES[p]) return { kind: "static", label: STATIC_PAGES[p] };
  let m: RegExpMatchArray | null;
  if ((m = p.match(new RegExp(`^/forum/(${UUID})$`, "i")))) return { kind: "topic", id: m[1].toLowerCase() };
  if ((m = p.match(new RegExp(`^/pazar/ilan/(${UUID})$`, "i")))) return { kind: "listing", id: m[1].toLowerCase() };
  if ((m = p.match(/^\/haberler\/([a-z0-9]+(?:-[a-z0-9]+)*)$/))) return { kind: "article", slug: m[1] };
  if ((m = p.match(/^\/forum\/k\/([a-z0-9]+(?:-[a-z0-9]+)*)$/))) return { kind: "category", id: m[1] };
  if ((m = p.match(/^\/forum\/kisi\/([^/]+)$/))) return { kind: "person", handle: decodeURIComponent(m[1]) };
  if (p === "/yonetim" || p.startsWith("/yonetim/")) return { kind: "admin" };
  return { kind: "other" };
}

/** Titles found in the database, by kind; missing ones fall back to a generic name. */
export type PageTitles = { topics: Map<string, string>; listings: Map<string, string>; articles: Map<string, string>; categories: Map<string, string> };

export function pageLabel(path: string, titles: PageTitles): string {
  const ref = pageRef(path);
  switch (ref.kind) {
    case "static":
      return ref.label;
    case "topic":
      return `Forum: ${titles.topics.get(ref.id) ?? "silinmiş konu"}`;
    case "listing":
      return `İlan: ${titles.listings.get(ref.id) ?? "kaldırılmış ilan"}`;
    case "article":
      return `Haber: ${titles.articles.get(ref.slug) ?? ref.slug}`;
    case "category":
      return `Forum bölümü: ${titles.categories.get(ref.id) ?? ref.id}`;
    case "person":
      return `Profil: @${ref.handle}`;
    case "admin":
      return "Yönetim paneli";
    default:
      return path;
  }
}

/** Where visitors came from: the referring site's name, or "Doğrudan" when the browser sent none. */
export function referrerLabel(host: string): string {
  const h = host.trim().toLowerCase().replace(/^www\./, "");
  if (!h) return "Doğrudan (adres yazarak, yer imi ya da uygulamadan)";
  if (/(^|\.)google\.[a-z.]+$/.test(h) || h === "googleapis.com") return "Google";
  if (/(^|\.)(bing\.com)$/.test(h)) return "Bing";
  if (/(^|\.)yandex\.[a-z.]+$/.test(h)) return "Yandex";
  if (/(^|\.)(facebook\.com|fb\.me)$/.test(h)) return "Facebook";
  if (/(^|\.)instagram\.com$/.test(h)) return "Instagram";
  if (/(^|\.)(whatsapp\.com|wa\.me)$/.test(h)) return "WhatsApp";
  if (/(^|\.)(t\.co|x\.com|twitter\.com)$/.test(h)) return "X (Twitter)";
  if (/(^|\.)(youtube\.com|youtu\.be)$/.test(h)) return "YouTube";
  if (/(^|\.)(t\.me|telegram\.org)$/.test(h)) return "Telegram";
  if (/(^|\.)linkedin\.com$/.test(h)) return "LinkedIn";
  if (/(^|\.)ciftcidestek\.com\.tr$/.test(h) || h.endsWith(".vercel.app")) return "Sitenin kendisi";
  return h;
}

export function deviceLabel(type: string): string {
  switch (type.toLowerCase()) {
    case "mobile":
      return "Telefon";
    case "desktop":
      return "Bilgisayar";
    case "tablet":
      return "Tablet";
    default:
      return type || "Bilinmiyor";
  }
}

export function osLabel(name: string): string {
  if (!name) return "Bilinmiyor";
  if (/^ios$/i.test(name)) return "iPhone / iPad (iOS)";
  if (/^mac/i.test(name)) return "Mac";
  return name;
}

let regionNames: Intl.DisplayNames | null = null;

/** "TR" → "Türkiye"; unknown codes as they are. */
export function countryLabel(code: string): string {
  if (!code) return "Bilinmiyor";
  try {
    regionNames ??= new Intl.DisplayNames(["tr"], { type: "region" });
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/** Rows with the same label (two addresses for one page, say) are added together, biggest first. */
export function mergeByLabel<T extends { visitors: number; pageviews: number }>(rows: T[], label: (row: T) => string): { label: string; visitors: number; pageviews: number }[] {
  const out = new Map<string, { label: string; visitors: number; pageviews: number }>();
  for (const r of rows) {
    const key = label(r);
    const cur = out.get(key) ?? { label: key, visitors: 0, pageviews: 0 };
    cur.visitors += r.visitors;
    cur.pageviews += r.pageviews;
    out.set(key, cur);
  }
  return [...out.values()].sort((a, b) => b.visitors - a.visitors || b.pageviews - a.pageviews);
}
