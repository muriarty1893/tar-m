"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { getUserId, isAdmin, requireProfile, signInHref } from "@/lib/auth";
import { isUuid } from "@/lib/db";
import type { TopicErrors, TopicInput } from "@/lib/forum";
import { createTopicFor, deleteReplyFor, deleteTopicWithPhotos, replyFor, reportForumFor, toggleLikeFor, updateReplyFor, updateTopicFor } from "@/lib/services/forum";

export type TopicResult = { errors: TopicErrors; message?: string };

/** "Konu aç": saves the topic and opens it. */
export async function createTopic(raw: TopicInput): Promise<TopicResult> {
  const profile = await requireProfile("/forum/yeni");
  const created = await createTopicFor(profile.userId, raw);
  if (!created.ok) return { errors: created.errors, message: created.message };
  redirect(`/forum/${created.id}?yeni=1`);
}

/** The author (or an admin) saves changes to a topic, then opens it. */
export async function updateTopic(topicId: string, raw: TopicInput): Promise<TopicResult> {
  const profile = await requireProfile(`/forum/${topicId}/duzenle`);
  const saved = await updateTopicFor(profile.userId, await isAdmin(profile.userId), topicId, raw);
  if (!saved.ok) return { errors: saved.errors, message: saved.message };
  redirect(`/forum/${topicId}?kaydedildi=1`);
}

/** The author (or an admin) changes a reply's text. */
export async function editReply(replyId: string, body: string): Promise<{ error?: string }> {
  const userId = await getUserId();
  if (!userId) return { error: "Oturumunuz kapanmış; yeniden giriş yapın." };
  const r = await updateReplyFor(userId, await isAdmin(userId), replyId, body);
  if (!r.ok) return { error: r.message };
  refresh();
  return {};
}

/** A reply to the topic, or (`parentId`) to one of its replies, with up to 4 photos. */
export async function replyToTopic(topicId: string, input: { body: string; parentId: string | null; photos: string[] }): Promise<{ error?: string; id?: string }> {
  const profile = await requireProfile(`/forum/${topicId}`);
  const r = await replyFor(profile.userId, topicId, input);
  if (!r.ok) return { error: r.message };
  refresh();
  return { id: r.id };
}

/** The author (or an admin) deletes a topic with its replies and photos. */
export async function deleteTopic(topicId: string) {
  const userId = await getUserId();
  if (!userId || !isUuid(topicId)) return;
  await deleteTopicWithPhotos(userId, await isAdmin(userId), topicId);
  redirect("/forum?silindi=1");
}

export async function deleteReply(replyId: string) {
  const userId = await getUserId();
  if (!userId || !isUuid(replyId)) return;
  await deleteReplyFor(userId, await isAdmin(userId), replyId);
  refresh();
}

export async function reportPost(topicId: string, replyId: string | null, reason: string, note: string): Promise<{ ok: boolean; message?: string }> {
  const profile = await requireProfile(`/forum/${topicId}`);
  return reportForumFor(profile.userId, { topicId, replyId, reason, note });
}

/** ♥ on a topic or a reply. Signed out: where to sign in. */
export async function toggleLike(topicId: string, replyId: string | null): Promise<{ liked: boolean; count: number } | { signIn: string } | { error: string }> {
  const userId = await getUserId();
  if (!userId) return { signIn: signInHref(`/forum/${topicId}`) };
  const r = await toggleLikeFor(userId, topicId, replyId);
  return r ?? { error: "Beğenilemedi; içerik silinmiş olabilir." };
}
