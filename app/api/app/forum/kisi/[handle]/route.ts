import { ApiError, handler, json } from "@/lib/app-api";
import { listTopics, forumProfile } from "@/lib/forum-data";
import { connection } from "next/server";

/** @ahmet's forum page: who they are, how much they wrote, and their latest 20 topics. Public. */
export const GET = handler<{ handle: string }>(async (_req, { handle }) => {
  await connection();
  const profile = await forumProfile(handle);
  if (!profile) throw new ApiError(404, "Bu kullanıcı bulunamadı.");
  const { items } = await listTopics({ q: "", kategori: "tumu", sirala: "yeni", sayfa: 1 }, profile.userId);
  return json({ profile: { handle: profile.handle, name: profile.name, memberSince: profile.memberSince, topicCount: profile.topicCount, replyCount: profile.replyCount }, topics: items });
});
