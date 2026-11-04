import "server-only";
import { del } from "@vercel/blob";
import { iso, isUuid, sql, str } from "@/lib/db";
import { validateArticle, type ArticleErrors, type ArticleInput } from "@/lib/news";
import { REPORT_REASONS } from "@/lib/market";

/**
 * The admin dashboard's reads and writes (news, reports), shared by /yonetim (app/yonetim/actions.ts)
 * and the mobile app's API. The callers check that the person is an admin.
 */

export type ModerateAction = "remove" | "dismiss";
export const isModerateAction = (s: unknown): s is ModerateAction => s === "remove" || s === "dismiss";

/** A moderator removes the reported listing, or dismisses its reports. Either way they are closed. Returns whether the listing was removed. */
export async function moderateFor(listingId: string, action: ModerateAction): Promise<boolean> {
  if (!isUuid(listingId) || !isModerateAction(action)) return false;
  if (action === "remove") await sql()`update listings set status = 'removed', updated_at = now() where id = ${listingId}`;
  await sql()`update reports set resolved_at = now() where listing_id = ${listingId} and resolved_at is null`;
  return action === "remove";
}

export type SaveArticleOutcome = { errors: ArticleErrors; message?: string; saved?: boolean; id?: string; created?: boolean };

const s = (v: unknown) => (typeof v === "string" ? v : "");

/** The editor's values, tidied the way they are saved. */
export function cleanArticle(raw: Partial<Record<keyof ArticleInput, unknown>>): ArticleInput {
  return {
    title: s(raw.title).trim().replace(/\s+/g, " "),
    slug: s(raw.slug).trim(),
    summary: s(raw.summary).trim(),
    body: s(raw.body).replace(/\r\n/g, "\n"),
    cover: s(raw.cover).trim(),
    date: s(raw.date),
    status: raw.status === "published" ? "published" : "draft",
  };
}

const isOwnCover = (url: string | null | undefined) => !!url && url.includes(".blob.vercel-storage.com/haberler/");

/** Saves a new article or changes to `id`. Published ones show on /haberler (and in the app) at once. */
export async function saveArticleFor(adminId: string, raw: Partial<Record<keyof ArticleInput, unknown>>, id?: string): Promise<SaveArticleOutcome> {
  const a = cleanArticle(raw);
  const errors = validateArticle(a);
  if (Object.keys(errors).length) return { errors };

  const taken = await sql()`select id from articles where slug = ${a.slug} and (${id ?? null}::uuid is null or id <> ${id ?? null}::uuid)`;
  if (taken.length) return { errors: { slug: "Bu adres başka bir haberde kullanılıyor; değiştirin." } };

  if (id) {
    if (!isUuid(id)) return { errors: {}, message: "Haber bulunamadı." };
    const before = await sql()`select cover from articles where id = ${id}`;
    if (!before[0]) return { errors: {}, message: "Haber bulunamadı." };
    await sql()`
      update articles set slug = ${a.slug}, title = ${a.title}, summary = ${a.summary}, body = ${a.body}, cover = ${a.cover || null},
        published_on = ${a.date}, status = ${a.status}, updated_at = now()
      where id = ${id}`;
    // A replaced or removed cover upload is deleted from Blob storage.
    const old = before[0].cover as string | null;
    if (old && old !== a.cover && isOwnCover(old)) await del(old).catch(() => {});
    return { errors: {}, saved: true, id };
  }

  const rows = await sql()`
    insert into articles (slug, title, summary, body, cover, published_on, status, author_id)
    values (${a.slug}, ${a.title}, ${a.summary}, ${a.body}, ${a.cover || null}, ${a.date}, ${a.status}, ${adminId})
    returning id`;
  return { errors: {}, saved: true, id: String(rows[0].id), created: true };
}

export async function deleteArticleFor(id: string): Promise<boolean> {
  if (!isUuid(id)) return false;
  const rows = await sql()`delete from articles where id = ${id} returning cover`;
  const cover = rows[0]?.cover as string | null | undefined;
  if (isOwnCover(cover)) await del(cover!).catch(() => {});
  return rows.length > 0;
}

export type AdminCounts = { published: number; drafts: number; reports: number; forumReports: number; listings: number; people: number };

/** The dashboard's numbers. */
export async function adminCounts(): Promise<AdminCounts> {
  const [c] = await sql()`
    select
      (select count(*) from articles where status = 'published') as published,
      (select count(*) from articles where status = 'draft') as drafts,
      (select count(distinct listing_id) from reports where resolved_at is null) as reports,
      (select count(distinct (topic_id, reply_id)) from forum_reports where resolved_at is null) as forum_reports,
      (select count(*) from listings where status = 'active') as listings,
      (select count(*) from profiles) as people`;
  return { published: Number(c.published), drafts: Number(c.drafts), reports: Number(c.reports), forumReports: Number(c.forum_reports), listings: Number(c.listings), people: Number(c.people) };
}

export type ReportedListing = {
  id: string;
  title: string;
  status: string;
  sellerName: string;
  count: number;
  lastAt: string;
  reasons: string[];
  notes: string[];
};

export const reasonLabel = (id: string) => REPORT_REASONS.find((r) => r.id === id)?.label ?? id;

/** Open reports, the most reported listing first. `reasons` are labels, not ids. */
export async function openReports(): Promise<ReportedListing[]> {
  const rows = await sql()`
    select l.id, l.title, l.status, p.name as seller_name, count(r.id) as n, max(r.created_at) as last_at,
      array_agg(r.reason) as reasons, array_agg(r.note) filter (where r.note <> '') as notes
    from reports r join listings l on l.id = r.listing_id join profiles p on p.user_id = l.seller_id
    where r.resolved_at is null
    group by l.id, l.title, l.status, p.name
    order by count(r.id) desc, max(r.created_at) desc
    limit 100`;
  return rows.map((r) => ({
    id: str(r.id),
    title: str(r.title),
    status: str(r.status),
    sellerName: str(r.seller_name),
    count: Number(r.n),
    lastAt: iso(r.last_at),
    reasons: [...new Set((r.reasons as string[] | null) ?? [])].map(reasonLabel),
    notes: (r.notes as string[] | null) ?? [],
  }));
}
