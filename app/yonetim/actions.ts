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
import { logAdmin } from "@/lib/services/admin-log";
import { deleteAccountFor } from "@/lib/services/account";
import { isAdminAccount, setSuspendedFor, memberName } from "@/lib/services/members";
import { setLockedFor, setPinnedFor } from "@/lib/services/forum";
import { SLOTS_TAG, cleanSlot, isSlotId, saveSlotFor, validateSlot, type SlotErrors, type SlotInput } from "@/lib/site-slots";
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
  const userId = await adminId();
  if (!userId) return;
  if (await moderateFor(userId, listingId, action)) updateTag(LISTINGS_TAG);
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
  const userId = await adminId();
  if (!userId || !isUuid(id)) return;
  await deleteArticleFor(userId, id);
  updateTag(NEWS_TAG);
  redirect("/yonetim/haberler?silindi=1");
}

/** "Kaynaklardan şimdi çek": the daily import (TKDK, the Ministry), run now. Says what it added. */
export async function importNewsNow(): Promise<{ ok: boolean; message: string }> {
  const userId = await adminId();
  if (!userId) return { ok: false, message: "Bu işlem için yönetici olmanız gerekiyor." };
  const reports = await importNews();
  const added = reports.reduce((n, r) => n + r.added.length, 0);
  await logAdmin(userId, "Kaynaklardan haber çekti", "haber-kaynakları", null, `${added} yeni haber`);
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
  const userId = await adminId();
  if (!userId) return notAdmin;
  const errors = await createCategoryFor(raw);
  if (errors) return { errors };
  await logAdmin(userId, "Kategori ekledi", "kategori", null, String(raw.name ?? ""));
  updateTag(FORUM_CATS_TAG);
  refresh();
  return {};
}

export async function updateForumCategory(id: string, raw: CategoryInput): Promise<CategoryResult> {
  const userId = await adminId();
  if (!userId) return notAdmin;
  const errors = await updateCategoryFor(String(id), raw);
  if (errors) return { errors };
  await logAdmin(userId, "Kategoriyi düzenledi", "kategori", String(id), String(raw.name ?? ""));
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
  const userId = await adminId();
  if (!userId) return { error: "Bu işlem için yönetici olmanız gerekiyor." };
  const error = await deleteCategoryFor(String(id), String(moveTo ?? ""));
  if (error) return { error };
  await logAdmin(userId, "Kategoriyi sildi", "kategori", String(id), `Konuları şuraya taşındı: ${String(moveTo ?? "")}`);
  updateTag(FORUM_CATS_TAG);
  refresh();
  return {};
}

// ---------------------------------------------------------------- Üyeler (/yonetim/uyeler)

export type MemberActionResult = { ok: boolean; message: string };

/** Suspends a member (they can't post, reply, list, edit or message) or lifts it. */
export async function setMemberSuspended(targetId: string, suspended: boolean, reason = ""): Promise<MemberActionResult> {
  const userId = await adminId();
  if (!userId) return { ok: false, message: "Bu işlem için yönetici olmanız gerekiyor." };
  if (targetId === userId) return { ok: false, message: "Kendi hesabınızı askıya alamazsınız." };
  const r = await setSuspendedFor(String(targetId), Boolean(suspended), String(reason ?? ""));
  if (!r.ok) return r;
  await logAdmin(userId, suspended ? "Üyeyi askıya aldı" : "Üyenin askısını kaldırdı", "üye", targetId, suspended && reason ? `${r.name}: ${reason}` : r.name);
  refresh();
  return { ok: true, message: suspended ? `${r.name} askıya alındı.` : `${r.name} yeniden paylaşım yapabilir.` };
}

/** Deletes a member's account with everything they wrote (as "Hesabımı sil" does). Not admins, not yourself. */
export async function deleteMember(targetId: string, confirmName: string): Promise<MemberActionResult> {
  const userId = await adminId();
  if (!userId) return { ok: false, message: "Bu işlem için yönetici olmanız gerekiyor." };
  const id = String(targetId);
  if (id === userId) return { ok: false, message: "Kendi hesabınızı Hesabım sayfasından silebilirsiniz." };
  const name = await memberName(id);
  if (name === null) return { ok: false, message: "Üye bulunamadı." };
  if (String(confirmName ?? "").trim().toLocaleLowerCase("tr") !== name.trim().toLocaleLowerCase("tr")) return { ok: false, message: "Onay için üyenin adını aynen yazın." };
  if (await isAdminAccount(id)) return { ok: false, message: "Yönetici hesapları buradan silinemez." };
  await deleteAccountFor(id);
  await logAdmin(userId, "Üyeyi ve paylaşımlarını sildi", "üye", id, name);
  updateTag(LISTINGS_TAG);
  refresh();
  return { ok: true, message: `${name} ve paylaşımları silindi.` };
}

// ---------------------------------------------------------------- Konular: sabitle, kilitle

/** Pins a topic to the top of the forum's lists, or unpins it. */
export async function setTopicPinned(topicId: string, pinned: boolean) {
  const userId = await adminId();
  if (!userId) return;
  const title = await setPinnedFor(String(topicId), Boolean(pinned));
  if (title !== null) await logAdmin(userId, pinned ? "Konuyu sabitledi" : "Konunun sabitlemesini kaldırdı", "konu", topicId, title);
  refresh();
}

/** Closes a topic to new replies, or opens it again. */
export async function setTopicLocked(topicId: string, locked: boolean) {
  const userId = await adminId();
  if (!userId) return;
  const title = await setLockedFor(String(topicId), Boolean(locked));
  if (title !== null) await logAdmin(userId, locked ? "Konuyu yanıtlara kapattı" : "Konuyu yanıtlara açtı", "konu", topicId, title);
  refresh();
}

// ---------------------------------------------------------------- Reklam alanları (/yonetim/reklam)

export type SlotResult = { errors: SlotErrors; message?: string; saved?: boolean };

export async function saveSlot(id: string, raw: Partial<Record<keyof SlotInput, unknown>>): Promise<SlotResult> {
  const userId = await adminId();
  if (!userId) return { errors: {}, message: "Bu işlem için yönetici olmanız gerekiyor." };
  if (!isSlotId(id)) return { errors: {}, message: "Böyle bir alan yok." };
  const v = cleanSlot(raw);
  const errors = validateSlot(id, v);
  if (Object.keys(errors).length) return { errors };
  await saveSlotFor(userId, id, v);
  await logAdmin(userId, v.enabled ? "Reklam alanını güncelledi" : "Reklam alanını kapattı", "reklam", id, [v.name, v.text].filter(Boolean).join(" · "));
  updateTag(SLOTS_TAG);
  refresh();
  return { errors: {}, saved: true };
}
