import "server-only";
import { iso, isUuid, sql, str } from "@/lib/db";
import {
  DAILY_TOPIC_LIMIT,
  REPLY_BURST_LIMIT,
  forumReasonLabel,
  isForumReportReason,
  topicSearchText,
  validateReply,
  validateTopic,
  type TopicErrors,
  type TopicInput,
} from "@/lib/forum";

/**
 * The forum's writes, shared by the website's server actions (app/forum/actions.ts) and the mobile
 * app's API. The callers check who is signed in (with a name); admins are told apart by `admin`.
 */

const s = (v: unknown) => (typeof v === "string" ? v : "");

export type CreateTopicOutcome = { ok: true; id: string } | { ok: false; errors: TopicErrors; message?: string };

export async function createTopicFor(userId: string, raw: Partial<Record<keyof TopicInput, unknown>>): Promise<CreateTopicOutcome> {
  const t: TopicInput = { category: s(raw.category), title: s(raw.title).trim().replace(/\s+/g, " "), body: s(raw.body).replace(/\r\n/g, "\n").trim() };
  const errors = validateTopic(t);
  if (Object.keys(errors).length) return { ok: false, errors };
  const recent = await sql()`select count(*) as n from forum_topics where author_id = ${userId} and created_at > now() - interval '24 hours'`;
  if (Number(recent[0].n) >= DAILY_TOPIC_LIMIT) return { ok: false, errors: {}, message: `Bir günde en fazla ${DAILY_TOPIC_LIMIT} konu açabilirsiniz. Yarın yeniden deneyin.` };
  const rows = await sql()`
    insert into forum_topics (author_id, category, title, body, search_text)
    values (${userId}, ${t.category}, ${t.title}, ${t.body}, ${topicSearchText(t.title, t.body)})
    returning id`;
  return { ok: true, id: str(rows[0].id) };
}

/** Recounts a topic's replies and the latest one (after a reply is deleted). */
async function recount(topicId: string) {
  await sql()`
    update forum_topics t set
      reply_count = (select count(*) from forum_replies r where r.topic_id = t.id),
      last_reply_at = (select max(created_at) from forum_replies r where r.topic_id = t.id)
    where t.id = ${topicId}`;
}

export async function replyFor(userId: string, topicId: string, raw: unknown): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isUuid(topicId)) return { ok: false, message: "Konu bulunamadı." };
  const body = s(raw).replace(/\r\n/g, "\n").trim();
  const invalid = validateReply(body);
  if (invalid) return { ok: false, message: invalid };
  const recent = await sql()`select count(*) as n from forum_replies where author_id = ${userId} and created_at > now() - interval '10 minutes'`;
  if (Number(recent[0].n) >= REPLY_BURST_LIMIT) return { ok: false, message: "Çok hızlı yanıt yazdınız; birkaç dakika sonra yeniden deneyin." };
  const rows = await sql()`
    insert into forum_replies (topic_id, author_id, body)
    select id, ${userId}, ${body} from forum_topics where id = ${topicId}
    returning id`;
  if (!rows[0]) return { ok: false, message: "Konu bulunamadı; silinmiş olabilir." };
  await sql()`update forum_topics set reply_count = reply_count + 1, last_reply_at = now() where id = ${topicId}`;
  return { ok: true };
}

/** The author (or an admin) deletes a topic, with its replies. */
export async function deleteTopicFor(userId: string, admin: boolean, topicId: string): Promise<boolean> {
  if (!isUuid(topicId)) return false;
  const rows = admin
    ? await sql()`delete from forum_topics where id = ${topicId} returning id`
    : await sql()`delete from forum_topics where id = ${topicId} and author_id = ${userId} returning id`;
  return rows.length > 0;
}

/** The author (or an admin) deletes a reply. Returns its topic's id. */
export async function deleteReplyFor(userId: string, admin: boolean, replyId: string): Promise<string | null> {
  if (!isUuid(replyId)) return null;
  const rows = admin
    ? await sql()`delete from forum_replies where id = ${replyId} returning topic_id`
    : await sql()`delete from forum_replies where id = ${replyId} and author_id = ${userId} returning topic_id`;
  if (!rows[0]) return null;
  const topicId = str(rows[0].topic_id);
  await recount(topicId);
  return topicId;
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
      coalesce(r.body, t.body) as text, coalesce(pr.name, pt.name) as author_name,
      count(*) as n, max(f.created_at) as last_at, array_agg(f.reason) as reasons, array_agg(f.note) filter (where f.note <> '') as notes
    from forum_reports f
    join forum_topics t on t.id = f.topic_id
    join profiles pt on pt.user_id = t.author_id
    left join forum_replies r on r.id = f.reply_id
    left join profiles pr on pr.user_id = r.author_id
    where f.resolved_at is null
    group by f.topic_id, f.reply_id, t.title, r.body, t.body, pr.name, pt.name
    order by count(*) desc, max(f.created_at) desc
    limit 100`;
  return rows.map((r) => ({
    topicId: str(r.topic_id),
    replyId: r.reply_id ? str(r.reply_id) : null,
    topicTitle: str(r.topic_title),
    text: str(r.text).slice(0, 400),
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
    return replyId ? (await deleteReplyFor(adminId, true, replyId)) !== null : deleteTopicFor(adminId, true, topicId);
  }
  if (raw.action !== "dismiss") return false;
  if (replyId) await sql()`update forum_reports set resolved_at = now() where reply_id = ${replyId} and resolved_at is null`;
  else await sql()`update forum_reports set resolved_at = now() where topic_id = ${topicId} and reply_id is null and resolved_at is null`;
  return true;
}
