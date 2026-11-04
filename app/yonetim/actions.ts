"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { getUserId, isAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/db";
import { LISTINGS_TAG } from "@/lib/market-data";
import { NEWS_TAG } from "@/lib/news-data";
import { renderMarkdown, type ArticleErrors, type ArticleInput } from "@/lib/news";
import { deleteArticleFor, moderateFor, saveArticleFor } from "@/lib/services/admin";

/** Every action re-checks the admin itself: a server action can be called directly. */
async function adminId() {
  const userId = await getUserId();
  return userId && (await isAdmin(userId)) ? userId : null;
}

/** A moderator removes the reported listing, or dismisses its reports. Either way they are closed. */
export async function moderate(listingId: string, action: "remove" | "dismiss") {
  if (!(await adminId())) return;
  if (await moderateFor(listingId, action)) updateTag(LISTINGS_TAG);
  refresh();
}

export type SaveArticleResult = { errors: ArticleErrors; message?: string; saved?: boolean; id?: string };

/** Saves a new article (then opens it in the editor) or changes to `id`. Published ones show on /haberler at once. */
export async function saveArticle(raw: ArticleInput, id?: string): Promise<SaveArticleResult> {
  const userId = await adminId();
  if (!userId) return { errors: {}, message: "Bu işlem için yönetici olmanız gerekiyor." };
  const { created, ...result } = await saveArticleFor(userId, raw, id);
  if (!result.saved) return result;
  updateTag(NEWS_TAG);
  if (created) redirect(`/yonetim/haberler/${result.id}?kaydedildi=1`);
  return result;
}

export async function deleteArticle(id: string) {
  if (!(await adminId()) || !isUuid(id)) return;
  await deleteArticleFor(id);
  updateTag(NEWS_TAG);
  redirect("/yonetim/haberler?silindi=1");
}

/** The editor's "Önizleme": the text as it will look on the site. */
export async function previewMarkdown(markdown: string): Promise<string> {
  if (!(await adminId())) return "";
  return renderMarkdown(String(markdown ?? "").slice(0, 50_000));
}
