"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { getUserId, isAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/db";
import { LISTINGS_TAG } from "@/lib/market-data";
import { NEWS_TAG } from "@/lib/news-data";
import { renderMarkdown, type ArticleErrors, type ArticleInput } from "@/lib/news";
import { deleteArticleFor, moderateFor, saveArticleFor } from "@/lib/services/admin";
import { moderateForumFor } from "@/lib/services/forum";
import { importNews } from "@/lib/services/news-import";
import {
  FORUM_CATS_TAG,
  createCategoryFor,
  deleteCategoryFor,
  moveCategoryFor,
  updateCategoryFor,
  type CategoryErrors,
  type CategoryInput,
} from "@/lib/forum-categories";

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

/** A moderator removes a reported forum topic or reply, or closes its reports. */
export async function moderateForum(topicId: string, replyId: string | null, action: "remove" | "dismiss") {
  const userId = await adminId();
  if (!userId) return;
  await moderateForumFor(userId, { topicId, replyId, action });
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

/** "Kaynaklardan şimdi çek": the daily import (TKDK, the Ministry), run now. Says what it added. */
export async function importNewsNow(): Promise<{ ok: boolean; message: string }> {
  if (!(await adminId())) return { ok: false, message: "Bu işlem için yönetici olmanız gerekiyor." };
  const reports = await importNews();
  const added = reports.reduce((n, r) => n + r.added.length, 0);
  if (added) updateTag(NEWS_TAG);
  const failed = reports.filter((r) => r.errors.length).map((r) => r.source);
  const parts = [added ? `${added} yeni haber yayımlandı.` : "Yeni haber yok."];
  if (failed.length) parts.push(`Okunamayan: ${failed.join(", ")} (sonraki çekişte yeniden denenecek).`);
  if (added) refresh();
  return { ok: failed.length === 0, message: parts.join(" ") };
}

/** The editor's "Önizleme": the text as it will look on the site. */
export async function previewMarkdown(markdown: string): Promise<string> {
  if (!(await adminId())) return "";
  return renderMarkdown(String(markdown ?? "").slice(0, 50_000));
}

// ---------------------------------------------------------------- Forum categories (/yonetim/forum)

export type CategoryResult = { errors?: CategoryErrors };

const notAdmin: CategoryResult = { errors: { form: "Bu işlem için yönetici olmanız gerekiyor." } };

/** A new section (no `parentId`) or a sub-category under one. */
export async function createForumCategory(raw: CategoryInput): Promise<CategoryResult> {
  if (!(await adminId())) return notAdmin;
  const errors = await createCategoryFor(raw);
  if (errors) return { errors };
  updateTag(FORUM_CATS_TAG);
  refresh();
  return {};
}

export async function updateForumCategory(id: string, raw: CategoryInput): Promise<CategoryResult> {
  if (!(await adminId())) return notAdmin;
  const errors = await updateCategoryFor(String(id), raw);
  if (errors) return { errors };
  updateTag(FORUM_CATS_TAG);
  refresh();
  return {};
}

export async function moveForumCategory(id: string, direction: "up" | "down") {
  if (!(await adminId())) return;
  await moveCategoryFor(String(id), direction === "up" ? "up" : "down");
  updateTag(FORUM_CATS_TAG);
  refresh();
}

/** Deletes a category; its topics move to `moveTo` first. */
export async function deleteForumCategory(id: string, moveTo: string): Promise<{ error?: string }> {
  if (!(await adminId())) return { error: "Bu işlem için yönetici olmanız gerekiyor." };
  const error = await deleteCategoryFor(String(id), String(moveTo ?? ""));
  if (error) return { error };
  updateTag(FORUM_CATS_TAG);
  refresh();
  return {};
}
