import "server-only";
import { iso, isUuid, sql, str, type Row } from "./db";
import { FORUM_PAGE_SIZE, type ForumCategory, type ForumQuery } from "./forum";
import { fold } from "@/data/demo-market";

/** Reads for the forum. Writes are in lib/services/forum.ts. */

export type TopicCard = {
  id: string;
  title: string;
  category: ForumCategory;
  excerpt: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  replyCount: number;
  lastReplyAt: string | null;
};

const EXCERPT = 160;

const toCard = (r: Row): TopicCard => {
  const body = str(r.body).replace(/\s+/g, " ").trim();
  return {
    id: str(r.id),
    title: str(r.title),
    category: str(r.category) as ForumCategory,
    excerpt: body.length > EXCERPT ? `${body.slice(0, EXCERPT - 1).trimEnd()}…` : body,
    authorId: str(r.author_id),
    authorName: str(r.author_name) || "Kullanıcı",
    createdAt: iso(r.created_at),
    replyCount: Number(r.reply_count ?? 0),
    lastReplyAt: r.last_reply_at ? iso(r.last_reply_at) : null,
  };
};

/** One page of topics for these filters. */
export async function listTopics(q: ForumQuery): Promise<{ items: TopicCard[]; total: number }> {
  const params: unknown[] = [];
  const p = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };
  const where: string[] = ["true"];
  if (q.kategori !== "tumu") where.push(`t.category = ${p(q.kategori)}`);
  const words = fold(q.q).split(/\s+/).filter(Boolean).slice(0, 6);
  for (const w of words) where.push(`t.search_text like ${p(`%${w.replace(/[\\%_]/g, (c) => `\\${c}`)}%`)}`);
  const order =
    q.sirala === "aktif"
      ? "coalesce(t.last_reply_at, t.created_at) desc"
      : q.sirala === "populer"
        ? "t.reply_count desc, coalesce(t.last_reply_at, t.created_at) desc"
        : "t.created_at desc";
  const rows = await sql().query(
    `select t.id, t.title, t.category, t.body, t.author_id, t.created_at, t.reply_count, t.last_reply_at, p.name as author_name,
       count(*) over () as total
     from forum_topics t join profiles p on p.user_id = t.author_id
     where ${where.join(" and ")}
     order by ${order}
     limit ${FORUM_PAGE_SIZE} offset ${(q.sayfa - 1) * FORUM_PAGE_SIZE}`,
    params,
  );
  return { items: rows.map(toCard), total: rows.length ? Number(rows[0].total) : 0 };
}

export type ForumReply = { id: string; body: string; authorId: string; authorName: string; createdAt: string; mine: boolean; reported: boolean };

export type TopicDetail = TopicCard & {
  body: string;
  mine: boolean;
  /** Whether the viewer has already reported the topic. */
  reported: boolean;
  replies: ForumReply[];
};

/** A topic with its replies, oldest first. Null if there's no such topic. */
export async function getTopic(id: string, userId: string | null): Promise<TopicDetail | null> {
  if (!isUuid(id)) return null;
  const rows = await sql()`
    select t.*, p.name as author_name,
      exists (select 1 from forum_reports r where r.topic_id = t.id and r.reply_id is null and r.reporter_id = ${userId}) as reported
    from forum_topics t join profiles p on p.user_id = t.author_id
    where t.id = ${id}`;
  const t = rows[0];
  if (!t) return null;
  const replies = await sql()`
    select r.id, r.body, r.author_id, r.created_at, p.name as author_name,
      exists (select 1 from forum_reports f where f.reply_id = r.id and f.reporter_id = ${userId}) as reported
    from forum_replies r join profiles p on p.user_id = r.author_id
    where r.topic_id = ${id}
    order by r.created_at asc
    limit 500`;
  return {
    ...toCard(t),
    body: str(t.body),
    mine: userId !== null && t.author_id === userId,
    reported: t.reported === true,
    replies: replies.map((r: Row) => ({
      id: str(r.id),
      body: str(r.body),
      authorId: str(r.author_id),
      authorName: str(r.author_name) || "Kullanıcı",
      createdAt: iso(r.created_at),
      mine: userId !== null && r.author_id === userId,
      reported: r.reported === true,
    })),
  };
}
