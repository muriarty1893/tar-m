"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { del } from "@vercel/blob";
import { getUserId, isAdmin } from "@/lib/auth";
import { isUuid, sql } from "@/lib/db";
import { LISTINGS_TAG } from "@/lib/market-data";
import { NEWS_TAG } from "@/lib/news-data";
import { renderMarkdown, validateArticle, type ArticleErrors, type ArticleInput } from "@/lib/news";

/** Every action re-checks the admin itself: a server action can be called directly. */
async function adminId() {
  const userId = await getUserId();
  return userId && (await isAdmin(userId)) ? userId : null;
}

/** A moderator removes the reported listing, or dismisses its reports. Either way they are closed. */
export async function moderate(listingId: string, action: "remove" | "dismiss") {
  if (!(await adminId()) || !isUuid(listingId)) return;
  if (action === "remove") {
    await sql()`update listings set status = 'removed', updated_at = now() where id = ${listingId}`;
    updateTag(LISTINGS_TAG);
  }
  await sql()`update reports set resolved_at = now() where listing_id = ${listingId} and resolved_at is null`;
  refresh();
}

export type SaveArticleResult = { errors: ArticleErrors; message?: string; saved?: boolean; id?: string };

const s = (v: unknown) => (typeof v === "string" ? v : "");

/** Saves a new article (then opens it in the editor) or changes to `id`. Published ones show on /haberler at once. */
export async function saveArticle(raw: ArticleInput, id?: string): Promise<SaveArticleResult> {
  const userId = await adminId();
  if (!userId) return { errors: {}, message: "Bu işlem için yönetici olmanız gerekiyor." };
  const a: ArticleInput = {
    title: s(raw.title).trim().replace(/\s+/g, " "),
    slug: s(raw.slug).trim(),
    summary: s(raw.summary).trim(),
    body: s(raw.body).replace(/\r\n/g, "\n"),
    cover: s(raw.cover).trim(),
    date: s(raw.date),
    status: raw.status === "published" ? "published" : "draft",
  };
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
    if (old && old !== a.cover && old.includes(".blob.vercel-storage.com/haberler/")) await del(old).catch(() => {});
    updateTag(NEWS_TAG);
    return { errors: {}, saved: true, id };
  }

  const rows = await sql()`
    insert into articles (slug, title, summary, body, cover, published_on, status, author_id)
    values (${a.slug}, ${a.title}, ${a.summary}, ${a.body}, ${a.cover || null}, ${a.date}, ${a.status}, ${userId})
    returning id`;
  updateTag(NEWS_TAG);
  redirect(`/yonetim/haberler/${rows[0].id}?kaydedildi=1`);
}

export async function deleteArticle(id: string) {
  if (!(await adminId()) || !isUuid(id)) return;
  const rows = await sql()`delete from articles where id = ${id} returning cover`;
  const cover = rows[0]?.cover as string | null | undefined;
  if (cover?.includes(".blob.vercel-storage.com/haberler/")) await del(cover).catch(() => {});
  updateTag(NEWS_TAG);
  redirect("/yonetim/haberler?silindi=1");
}

/** The editor's "Önizleme": the text as it will look on the site. */
export async function previewMarkdown(markdown: string): Promise<string> {
  if (!(await adminId())) return "";
  return renderMarkdown(String(markdown ?? "").slice(0, 50_000));
}
