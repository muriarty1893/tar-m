import "server-only";
import { iso, isUuid, sql, str } from "@/lib/db";
import {
  DAILY_TOPIC_LIMIT,
  REPLY_BURST_LIMIT,
  forumReasonLabel,
  isForumPhotoUrl,
  isForumReportReason,
  mentionsIn,
  topicSearchText,
  validateReply,
  validateTopic,
  type TopicErrors,
  type TopicInput,
} from "@/lib/forum";
import { notify, usersByHandle } from "@/lib/services/notifications";
import { forumCategories } from "@/lib/forum-categories";
import { PHOTO_OF_OTHERS, deletePhotosNoLongerUsed, photosOfOthers } from "@/lib/services/photos";

/**
 * The forum's writes, shared by the website's server actions (app/forum/actions.ts) and the mobile
 * app's API. The callers check who is signed in (with a name); admins are told apart by `admin`.
 */

const s = (v: unknown) => (typeof v === "string" ? v : "");
const photoList = (v: unknown) => (Array.isArray(v) ? v.filter((p): p is string => typeof p === "string") : []);

/** Removes forum photos taken off a post, unless another post still shows them (lib/services/photos.ts). */
const dropPhotos = (urls: string[]) => deletePhotosNoLongerUsed(urls, isForumPhotoUrl, "forum");

export type CreateTopicOutcome = { ok: true; id: string } | { ok: false; errors: TopicErrors; message?: string };

const cleanTopic = (raw: Partial<Record<keyof TopicInput, unknown>>): TopicInput => ({
  category: s(raw.category),
  title: s(raw.title).trim().replace(/\s+/g, " "),
  body: s(raw.body).replace(/\r\n/g, "\n").trim(),
  photos: photoList(raw.photos),
});

/** The topic's checks, with its category looked up in the forum's list. */
async function topicErrors(t: TopicInput): Promise<TopicErrors> {
  const cats = await forumCategories();
  return validateTopic(t, (id) => id in cats.byId);
}

export async function createTopicFor(userId: string, raw: Partial<Record<keyof TopicInput, unknown>>): Promise<CreateTopicOutcome> {
  const t = cleanTopic(raw);
  const errors = await topicErrors(t);
  if (Object.keys(errors).length) return { ok: false, errors };
  if (await photosOfOthers(t.photos, userId)) return { ok: false, errors: { photos: PHOTO_OF_OTHERS } };
  const recent = await sql()`select count(*) as n from forum_topics where author_id = ${userId} and created_at > now() - interval '24 hours'`;
  if (Number(recent[0].n) >= DAILY_TOPIC_LIMIT) return { ok: false, errors: {}, message: `Bir günde en fazla ${DAILY_TOPIC_LIMIT} konu açabilirsiniz. Yarın yeniden deneyin.` };
  const rows = await sql()`
    insert into forum_topics (author_id, category, title, body, photos, search_text)
    values (${userId}, ${t.category}, ${t.title}, ${t.body}, ${t.photos}, ${topicSearchText(t.title, t.body)})
    returning id`;
  const id = str(rows[0].id);
  await notify(userId, "mention", await usersByHandle(mentionsIn(t.body)), id, null);
  return { ok: true, id };
}

/**
 * The author (or an admin) changes a topic: its category, title, text and photos. Photos taken off it
 * are deleted. People newly mentioned are not notified again (an edit shouldn't ring anyone twice).
 */
export async function updateTopicFor(userId: string, admin: boolean, topicId: string, raw: Partial<Record<keyof TopicInput, unknown>>): Promise<CreateTopicOutcome> {
  if (!isUuid(topicId)) return { ok: false, errors: {}, message: "Konu bulunamadı." };
  const t = cleanTopic(raw);
  const errors = await topicErrors(t);
  if (Object.keys(errors).length) return { ok: false, errors };
  const found = admin
    ? await sql()`select author_id, photos from forum_topics where id = ${topicId}`
    : await sql()`select author_id, photos from forum_topics where id = ${topicId} and author_id = ${userId}`;
  if (!found[0]) return { ok: false, errors: {}, message: "Bu konuyu düzenleyemezsiniz." };
  // Checked against the author, so an admin editing someone's topic keeps that person's photos.
  if (await photosOfOthers(t.photos, str(found[0].author_id))) return { ok: false, errors: { photos: PHOTO_OF_OTHERS } };
  await sql()`
    update forum_topics set category = ${t.category}, title = ${t.title}, body = ${t.body}, photos = ${t.photos},
      search_text = ${topicSearchText(t.title, t.body)}, edited_at = now()
    where id = ${topicId}`;
  const before = (found[0].photos as string[] | null) ?? [];
  await dropPhotos(before.filter((p) => !t.photos.includes(p)));
  return { ok: true, id: topicId };
}

/** The author (or an admin) changes a reply's text; its photos stay. Returns the topic's id. */
export async function updateReplyFor(userId: string, admin: boolean, replyId: string, rawBody: unknown): Promise<{ ok: true; topicId: string } | { ok: false; message: string }> {
  if (!isUuid(replyId)) return { ok: false, message: "Yanıt bulunamadı." };
  const found = admin
    ? await sql()`select topic_id, photos from forum_replies where id = ${replyId} and deleted_at is null`
    : await sql()`select topic_id, photos from forum_replies where id = ${replyId} and author_id = ${userId} and deleted_at is null`;
  if (!found[0]) return { ok: false, message: "Bu yanıtı düzenleyemezsiniz." };
  const body = s(rawBody).replace(/\r\n/g, "\n").trim();
  const invalid = validateReply(body, (found[0].photos as string[] | null) ?? []);
  if (invalid) return { ok: false, message: invalid };
  await sql()`update forum_replies set body = ${body}, edited_at = now() where id = ${replyId}`;
  return { ok: true, topicId: str(found[0].topic_id) };
}

/** Recounts a topic's replies (not the deleted ones) and the latest one. */
async function recount(topicId: string) {
  await sql()`
    update forum_topics t set
      reply_count = (select count(*) from forum_replies r where r.topic_id = t.id and r.deleted_at is null),
      last_reply_at = (select max(created_at) from forum_replies r where r.topic_id = t.id and r.deleted_at is null)
    where t.id = ${topicId}`;
}

export type ReplyInput = { body?: unknown; parentId?: unknown; photos?: unknown };

/**
 * A reply to the topic, or (`parentId`) to one of its replies. Tells the person answered (the topic's
 * or the reply's author) and anyone mentioned.
 */
export async function replyFor(userId: string, topicId: string, raw: ReplyInput): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  if (!isUuid(topicId)) return { ok: false, message: "Konu bulunamadı." };
  const body = s(raw.body).replace(/\r\n/g, "\n").trim();
  const photos = photoList(raw.photos);
  const parentId = s(raw.parentId) || null;
  const invalid = validateReply(body, photos);
  if (invalid) return { ok: false, message: invalid };
  if (parentId && !isUuid(parentId)) return { ok: false, message: "Yanıt verdiğiniz yanıt bulunamadı." };
  if (await photosOfOthers(photos, userId)) return { ok: false, message: PHOTO_OF_OTHERS };
  const recent = await sql()`select count(*) as n from forum_replies where author_id = ${userId} and created_at > now() - interval '10 minutes'`;
  if (Number(recent[0].n) >= REPLY_BURST_LIMIT) return { ok: false, message: "Çok hızlı yanıt yazdınız; birkaç dakika sonra yeniden deneyin." };

  const topic = await sql()`select author_id from forum_topics where id = ${topicId}`;
  if (!topic[0]) return { ok: false, message: "Konu bulunamadı; silinmiş olabilir." };
  let answered = str(topic[0].author_id);
  if (parentId) {
    const parent = await sql()`select author_id from forum_replies where id = ${parentId} and topic_id = ${topicId} and deleted_at is null`;
    if (!parent[0]) return { ok: false, message: "Yanıt verdiğiniz yanıt silinmiş; konuya yanıt yazabilirsiniz." };
    answered = str(parent[0].author_id);
  }
  const rows = await sql()`
    insert into forum_replies (topic_id, author_id, body, photos, parent_id)
    values (${topicId}, ${userId}, ${body}, ${photos}, ${parentId})
    returning id`;
  const id = str(rows[0].id);
  await sql()`update forum_topics set reply_count = reply_count + 1, last_reply_at = now() where id = ${topicId}`;
  await notify(userId, "reply", [answered], topicId, id);
  const mentioned = (await usersByHandle(mentionsIn(body))).filter((u) => u !== answered);
  await notify(userId, "mention", mentioned, topicId, id);
  return { ok: true, id };
}

/** The author (or an admin) deletes a topic, with its replies and every photo in them. */
export async function deleteTopicFor(userId: string, admin: boolean, topicId: string): Promise<boolean> {
  if (!isUuid(topicId)) return false;
  const rows = admin
    ? await sql()`delete from forum_topics where id = ${topicId} returning id, photos`
    : await sql()`delete from forum_topics where id = ${topicId} and author_id = ${userId} returning id, photos`;
  if (!rows[0]) return false;
  // The replies went with the topic (on delete cascade); their photos are gathered first below.
  return true;
}

/** Photos in a topic and its replies, read before the topic is deleted. */
export async function topicPhotos(topicId: string): Promise<string[]> {
  if (!isUuid(topicId)) return [];
  const rows = await sql()`
    select photos from forum_topics where id = ${topicId}
    union all select photos from forum_replies where topic_id = ${topicId}`;
  return rows.flatMap((r) => (r.photos as string[] | null) ?? []);
}

/** Deletes a topic and then its photos. */
export async function deleteTopicWithPhotos(userId: string, admin: boolean, topicId: string): Promise<boolean> {
  const photos = await topicPhotos(topicId);
  const ok = await deleteTopicFor(userId, admin, topicId);
  if (ok) await dropPhotos(photos);
  return ok;
}

/**
 * The author (or an admin) deletes a reply. One that others answered stays as "Bu yanıt silindi"
 * (no text, no photos), so the answers under it still read; a deleted one left with no answers goes
 * for good. Returns the topic's id.
 */
export async function deleteReplyFor(userId: string, admin: boolean, replyId: string): Promise<string | null> {
  if (!isUuid(replyId)) return null;
  const found = admin
    ? await sql()`select id, topic_id, parent_id, photos from forum_replies where id = ${replyId} and deleted_at is null`
    : await sql()`select id, topic_id, parent_id, photos from forum_replies where id = ${replyId} and author_id = ${userId} and deleted_at is null`;
  const reply = found[0];
  if (!reply) return null;
  const topicId = str(reply.topic_id);
  const answered = await sql()`select 1 from forum_replies where parent_id = ${replyId} limit 1`;
  if (answered.length) {
    await sql()`update forum_replies set deleted_at = now(), body = '', photos = '{}', like_count = 0 where id = ${replyId}`;
    await sql()`delete from forum_likes where reply_id = ${replyId}`;
    await sql()`delete from notifications where reply_id = ${replyId}`;
    await sql()`update forum_reports set resolved_at = now() where reply_id = ${replyId} and resolved_at is null`;
  } else {
    await sql()`delete from forum_replies where id = ${replyId}`;
    // A "Bu yanıt silindi" left with no answers has nothing to hold up any more.
    let parentId = reply.parent_id ? str(reply.parent_id) : null;
    for (let i = 0; parentId && i < 20; i++) {
      const gone = await sql()`
        delete from forum_replies p where p.id = ${parentId} and p.deleted_at is not null
          and not exists (select 1 from forum_replies c where c.parent_id = p.id)
        returning parent_id`;
      parentId = gone[0]?.parent_id ? str(gone[0].parent_id) : null;
    }
  }
  await dropPhotos((reply.photos as string[] | null) ?? []);
  await recount(topicId);
  return topicId;
}

/** ♥ on a topic or (`replyId`) a reply: on, or off again. Returns the new state and count. */
export async function toggleLikeFor(userId: string, topicId: string, replyId: string | null): Promise<{ liked: boolean; count: number } | null> {
  if (!isUuid(topicId) || (replyId && !isUuid(replyId))) return null;
  const removed = replyId
    ? await sql()`delete from forum_likes where user_id = ${userId} and topic_id = ${topicId} and reply_id = ${replyId} returning 1`
    : await sql()`delete from forum_likes where user_id = ${userId} and topic_id = ${topicId} and reply_id is null returning 1`;
  let liked = false;
  if (!removed.length) {
    const added = replyId
      ? await sql()`
          insert into forum_likes (user_id, topic_id, reply_id)
          select ${userId}, topic_id, id from forum_replies where id = ${replyId} and topic_id = ${topicId} and deleted_at is null
          on conflict do nothing returning 1`
      : await sql()`
          insert into forum_likes (user_id, topic_id) select ${userId}, id from forum_topics where id = ${topicId}
          on conflict do nothing returning 1`;
    if (!added.length) return null;
    liked = true;
  }
  const counted = replyId
    ? await sql()`update forum_replies set like_count = (select count(*) from forum_likes where reply_id = ${replyId}) where id = ${replyId} returning like_count`
    : await sql()`update forum_topics set like_count = (select count(*) from forum_likes where topic_id = ${topicId} and reply_id is null) where id = ${topicId} returning like_count`;
  return { liked, count: Number(counted[0]?.like_count ?? 0) };
}

/** "Şikâyet et" on a topic, or on one of its replies (`replyId`). Not on one's own posts. */
export async function reportForumFor(userId: string, raw: { topicId?: unknown; replyId?: unknown; reason?: unknown; note?: unknown }): Promise<{ ok: boolean; message?: string }> {
  const topicId = s(raw.topicId);
  const replyId = s(raw.replyId) || null;
  const reason = s(raw.reason);
  if (!isUuid(topicId) || (replyId && !isUuid(replyId))) return { ok: false, message: "İçerik bulunamadı." };
  if (!isForumReportReason(reason)) return { ok: false, message: "Bir neden seçin." };
  const today = await sql()`select count(*) as n from forum_reports where reporter_id = ${userId} and created_at > now() - interval '24 hours'`;
  if (Number(today[0].n) >= 20) return { ok: false, message: "Bugün çok fazla şikâyet gönderdiniz; yarın yeniden deneyin." };
  const note = s(raw.note).trim().slice(0, 500);
  const rows = replyId
    ? await sql()`
        insert into forum_reports (topic_id, reply_id, reporter_id, reason, note)
        select topic_id, id, ${userId}, ${reason}, ${note} from forum_replies where id = ${replyId} and topic_id = ${topicId} and author_id <> ${userId}
        on conflict (reporter_id, topic_id, coalesce(reply_id, '00000000-0000-0000-0000-000000000000'::uuid)) do update set reason = excluded.reason, note = excluded.note, created_at = now(), resolved_at = null
        returning id`
    : await sql()`
        insert into forum_reports (topic_id, reporter_id, reason, note)
        select id, ${userId}, ${reason}, ${note} from forum_topics where id = ${topicId} and author_id <> ${userId}
        on conflict (reporter_id, topic_id, coalesce(reply_id, '00000000-0000-0000-0000-000000000000'::uuid)) do update set reason = excluded.reason, note = excluded.note, created_at = now(), resolved_at = null
        returning id`;
  return rows.length ? { ok: true } : { ok: false, message: "Bu içerik şikâyet edilemiyor." };
}

export type ReportedPost = {
  topicId: string;
  replyId: string | null;
  topicTitle: string;
  text: string;
  authorName: string;
  count: number;
  lastAt: string;
  reasons: string[];
  notes: string[];
};

/** Open forum reports, grouped by post, the most reported first. `reasons` are labels. */
export async function openForumReports(): Promise<ReportedPost[]> {
  const rows = await sql()`
    select f.topic_id, f.reply_id, t.title as topic_title,
      coalesce(r.body, t.body) as text, coalesce(r.photos, t.photos) as photos, coalesce(pr.name, pt.name) as author_name,
      count(*) as n, max(f.created_at) as last_at, array_agg(f.reason) as reasons, array_agg(f.note) filter (where f.note <> '') as notes
    from forum_reports f
    join forum_topics t on t.id = f.topic_id
    join profiles pt on pt.user_id = t.author_id
    left join forum_replies r on r.id = f.reply_id
    left join profiles pr on pr.user_id = r.author_id
    where f.resolved_at is null
    group by f.topic_id, f.reply_id, t.title, r.body, t.body, r.photos, t.photos, pr.name, pt.name
    order by count(*) desc, max(f.created_at) desc
    limit 100`;
  return rows.map((r) => ({
    topicId: str(r.topic_id),
    replyId: r.reply_id ? str(r.reply_id) : null,
    topicTitle: str(r.topic_title),
    text: str(r.text).slice(0, 400) || (((r.photos as string[] | null) ?? []).length ? "(Yalnızca fotoğraf)" : ""),
    authorName: str(r.author_name) || "Kullanıcı",
    count: Number(r.n),
    lastAt: iso(r.last_at),
    reasons: [...new Set((r.reasons as string[] | null) ?? [])].map(forumReasonLabel),
    notes: (r.notes as string[] | null) ?? [],
  }));
}

/** A moderator removes the reported post, or closes its reports. */
export async function moderateForumFor(adminId: string, raw: { topicId?: unknown; replyId?: unknown; action?: unknown }): Promise<boolean> {
  const topicId = s(raw.topicId);
  const replyId = s(raw.replyId) || null;
  if (!isUuid(topicId) || (replyId && !isUuid(replyId))) return false;
  if (raw.action === "remove") {
    // Deleting the post deletes its reports with it.
    return replyId ? (await deleteReplyFor(adminId, true, replyId)) !== null : deleteTopicWithPhotos(adminId, true, topicId);
  }
  if (raw.action !== "dismiss") return false;
  if (replyId) await sql()`update forum_reports set resolved_at = now() where reply_id = ${replyId} and resolved_at is null`;
  else await sql()`update forum_reports set resolved_at = now() where topic_id = ${topicId} and reply_id is null and resolved_at is null`;
  return true;
}
