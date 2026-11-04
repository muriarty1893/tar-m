"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { getUserId, isAdmin, requireProfile } from "@/lib/auth";
import { isUuid } from "@/lib/db";
import type { TopicErrors, TopicInput } from "@/lib/forum";
import { createTopicFor, deleteReplyFor, deleteTopicFor, replyFor, reportForumFor } from "@/lib/services/forum";

export type TopicResult = { errors: TopicErrors; message?: string };

/** "Konu aç": saves the topic and opens it. */
export async function createTopic(raw: TopicInput): Promise<TopicResult> {
  const profile = await requireProfile("/forum/yeni");
  const created = await createTopicFor(profile.userId, raw);
  if (!created.ok) return { errors: created.errors, message: created.message };
  redirect(`/forum/${created.id}?yeni=1`);
}

export async function replyToTopic(topicId: string, body: string): Promise<{ error?: string }> {
  const profile = await requireProfile(`/forum/${topicId}`);
  const r = await replyFor(profile.userId, topicId, body);
  if (!r.ok) return { error: r.message };
  refresh();
  return {};
}

/** The author (or an admin) deletes a topic with its replies. */
export async function deleteTopic(topicId: string) {
  const userId = await getUserId();
  if (!userId || !isUuid(topicId)) return;
  await deleteTopicFor(userId, await isAdmin(userId), topicId);
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
