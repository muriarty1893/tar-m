import "server-only";
import { sql, str } from "@/lib/db";
import { siteUrl } from "@/lib/site-url";
import { SOURCES, classify, fitTitle, isOffTopic, slugFor, sourceKey, summarize, type NewsSource } from "@/lib/news-sources";

/**
 * Haberler, automatically (once a day, and on demand in Yönetim → Haberler): new items on TKDK's and
 * the Ministry's home pages are published at once as Destek / Haber / Duyuru, with a short summary
 * and a link to the original. Every link it looks at is remembered in `news_imports`, so nothing is
 * fetched or added twice and an article an admin deletes doesn't come back.
 *
 * Politely: one request at a time with a pause, a name and address in the User-Agent, and at most
 * MAX_NEW_PER_SOURCE article pages a run.
 */

const USER_AGENT = `CiftciDestekBot/1.0 (+${siteUrl})`;
const TIMEOUT_MS = 15_000;
const PAUSE_MS = 800;
const MAX_NEW_PER_SOURCE = 12;
/** Items older than this are recorded but not published (a first run would otherwise backfill years). */
const MAX_AGE_DAYS = 30;

export type SourceReport = { source: string; found: number; added: string[]; skipped: number; errors: string[] };

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html", "Accept-Language": "tr-TR,tr;q=0.9" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function remember(url: string, source: string, articleId: string | null, skipped: string | null) {
  await sql()`
    insert into news_imports (url, source, article_id, skipped) values (${url}, ${source}, ${articleId}, ${skipped})
    on conflict (url) do nothing`;
}

async function importSource(source: NewsSource, now: Date): Promise<SourceReport> {
  const report: SourceReport = { source: source.name, found: 0, added: [], skipped: 0, errors: [] };
  let candidates;
  try {
    candidates = source.links(await fetchPage(source.listUrl));
  } catch (err) {
    report.errors.push(`liste: ${(err as Error).message}`);
    return report;
  }
  report.found = candidates.length;
  if (!candidates.length) {
    // The page answered but had no links we recognise: the site has probably changed its layout.
    report.errors.push("liste: bağlantı bulunamadı (sayfa düzeni değişmiş olabilir)");
    return report;
  }

  const known = await sql()`select url from news_imports where url = any(${candidates.map((c) => c.url)}::text[])`;
  const seen = new Set(known.map((r) => str(r.url)));
  const fresh = candidates.filter((c) => !seen.has(c.url));

  const oldest = new Date(now.getTime() - MAX_AGE_DAYS * 86_400_000).toISOString().slice(0, 10);
  let fetched = 0;
  for (const c of fresh) {
    // The address carries the title's words, so tenders and exams are dropped without a visit.
    if (isOffTopic(new URL(c.url).pathname)) {
      await remember(c.url, source.id, null, "konu dışı");
      report.skipped++;
      continue;
    }
    if (fetched >= MAX_NEW_PER_SOURCE) break;
    if (fetched > 0) await pause(PAUSE_MS);
    fetched++;
    try {
      const a = source.article(await fetchPage(c.url));
      if (!a) {
        report.errors.push(`okunamadı: ${c.url}`);
        continue;
      }
      if (isOffTopic(a.title)) {
        await remember(c.url, source.id, null, "konu dışı");
        report.skipped++;
        continue;
      }
      if (a.date < oldest) {
        await remember(c.url, source.id, null, "eski");
        report.skipped++;
        continue;
      }
      const title = fitTitle(a.title);
      const slug = slugFor(title, source.id, sourceKey(c.url));
      const rows = await sql()`
        insert into articles (slug, kind, title, summary, body, cover, published_on, status, source_name, source_url)
        values (${slug}, ${classify(c.section, title)}, ${title}, ${summarize(a.paragraphs, title)}, '', null, ${a.date}, 'published', ${source.name}, ${c.url})
        on conflict (slug) do nothing
        returning id`;
      await remember(c.url, source.id, rows[0] ? str(rows[0].id) : null, rows[0] ? null : "aynı adres");
      if (rows[0]) report.added.push(title);
    } catch (err) {
      // Not remembered: it's tried again next time.
      report.errors.push((err as Error).message);
    }
  }
  return report;
}

/** One run over every source. Sources are independent: one failing doesn't stop the others. */
export async function importNews(now = new Date()): Promise<SourceReport[]> {
  const reports: SourceReport[] = [];
  for (const source of SOURCES) reports.push(await importSource(source, now));
  return reports;
}
