import "server-only";
import { iso, isUuid, sql, str, type Row } from "./db";
import { FORUM_PAGE_SIZE, HANDLE_RE, type ForumQuery } from "./forum";
import { shownViews } from "./forum-views";
import { fold } from "@/data/demo-market";

/** Reads for the forum. Writes are in lib/services/forum.ts. */

export type TopicCard = {
  id: string;
  title: string;
  /** A category id (lib/forum-categories.ts); the label comes from the category list. */
  category: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  /** The author's username for mentions ("ahmet"), when they have one. */
  authorHandle: string | null;
  createdAt: string;
  replyCount: number;
  likeCount: number;
  /** Real opens plus the made-up ones (lib/forum-views.ts). */
  viewCount: number;
  lastReplyAt: string | null;
  /** Who wrote the latest reply still standing (in lists only). */
  lastReplyBy: string | null;
  /** The first photo, for the list. */
  photo: string | null;
  photoCount: number;
  /** When the author or an admin last changed it. */
  editedAt: string | null;
};

const EXCERPT = 160;

const toCard = (r: Row, now: Date): TopicCard => {
  const body = str(r.body).replace(/\s+/g, " ").trim();
  const photos = (r.photos as string[] | null) ?? [];
  const createdAt = iso(r.created_at);
  return {
    id: str(r.id),
    title: str(r.title),
    category: str(r.category),
    excerpt: body.length > EXCERPT ? `${body.slice(0, EXCERPT - 1).trimEnd()}…` : body,
    authorId: str(r.author_id),
    authorName: str(r.author_name) || "Kullanıcı",
    authorHandle: r.author_handle ? str(r.author_handle) : null,
    createdAt,
    replyCount: Number(r.reply_count ?? 0),
    likeCount: Number(r.like_count ?? 0),
    viewCount: shownViews(str(r.id), Number(r.view_count ?? 0), new Date(createdAt), now),
    lastReplyAt: r.last_reply_at ? iso(r.last_reply_at) : null,
    lastReplyBy: r.last_reply_by ? str(r.last_reply_by) : null,
    photo: photos[0] ?? null,
    photoCount: photos.length,
    editedAt: r.edited_at ? iso(r.edited_at) : null,
  };
};

/** One page of topics for these filters (and, with `authorId`, one person's). */
export async function listTopics(q: ForumQuery, authorId?: string): Promise<{ items: TopicCard[]; total: number }> {
  const params: unknown[] = [];
  const p = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };
  const where: string[] = ["true"];
  if (authorId) where.push(`t.author_id = ${p(authorId)}`);
  // A section brings its sub-categories' topics with it.
  if (q.kategori !== "tumu") {
    const k = p(q.kategori);
    where.push(`t.category in (select id from forum_categories where id = ${k} or parent_id = ${k})`);
  }
  const words = fold(q.q).split(/\s+/).filter(Boolean).slice(0, 6);
  for (const w of words) where.push(`t.search_text like ${p(`%${w.replace(/[\\%_]/g, (c) => `\\${c}`)}%`)}`);
  const order =
    q.sirala === "aktif"
      ? "coalesce(t.last_reply_at, t.created_at) desc"
      : q.sirala === "populer"
        ? "t.reply_count desc, coalesce(t.last_reply_at, t.created_at) desc"
        : "t.created_at desc";
  const rows = await sql().query(
    `select t.id, t.title, t.category, t.body, t.photos, t.author_id, t.created_at, t.reply_count, t.like_count, t.view_count, t.last_reply_at, t.edited_at,
       p.name as author_name, p.handle as author_handle, count(*) over () as total,
       (select lp.name from forum_replies lr join profiles lp on lp.user_id = lr.author_id
        where lr.topic_id = t.id and lr.deleted_at is null order by lr.created_at desc limit 1) as last_reply_by
     from forum_topics t join profiles p on p.user_id = t.author_id
     where ${where.join(" and ")}
     order by ${order}
     limit ${FORUM_PAGE_SIZE} offset ${(q.sayfa - 1) * FORUM_PAGE_SIZE}`,
    params,
  );
  // The time is read after the database answers, as Cache Components requires.
  const now = new Date();
  return { items: rows.map((r) => toCard(r, now)), total: rows.length ? Number(rows[0].total) : 0 };
}

export type ForumReply = {
  id: string;
  /** The reply this one answers; null when it answers the topic. */
  parentId: string | null;
  body: string;
  photos: string[];
  authorId: string;
  authorName: string;
  authorHandle: string | null;
  createdAt: string;
  likeCount: number;
  liked: boolean;
  mine: boolean;
  reported: boolean;
  /** "Bu yanıt silindi": kept because others answered it; no text, photos or author. */
  deleted: boolean;
  editedAt: string | null;
};

export type TopicDetail = TopicCard & {
  body: string;
  photos: string[];
  liked: boolean;
  mine: boolean;
  /** Whether the viewer has already reported the topic. */
  reported: boolean;
  replies: ForumReply[];
};

/** A topic with its replies, oldest first. Null if there's no such topic. */
export async function getTopic(id: string, userId: string | null): Promise<TopicDetail | null> {
  if (!isUuid(id)) return null;
  const rows = await sql()`
    select t.*, p.name as author_name, p.handle as author_handle,
      exists (select 1 from forum_reports r where r.topic_id = t.id and r.reply_id is null and r.reporter_id = ${userId}) as reported,
      exists (select 1 from forum_likes l where l.topic_id = t.id and l.reply_id is null and l.user_id = ${userId}) as liked
    from forum_topics t join profiles p on p.user_id = t.author_id
    where t.id = ${id}`;
  const t = rows[0];
  if (!t) return null;
  const replies = await sql()`
    select r.id, r.parent_id, r.body, r.photos, r.author_id, r.created_at, r.like_count, r.deleted_at, r.edited_at,
      p.name as author_name, p.handle as author_handle,
      exists (select 1 from forum_reports f where f.reply_id = r.id and f.reporter_id = ${userId}) as reported,
      exists (select 1 from forum_likes l where l.reply_id = r.id and l.user_id = ${userId}) as liked
    from forum_replies r join profiles p on p.user_id = r.author_id
    where r.topic_id = ${id}
    order by r.created_at asc
    limit 500`;
  return {
    ...toCard(t, new Date()),
    body: str(t.body),
    photos: (t.photos as string[] | null) ?? [],
    liked: t.liked === true,
    mine: userId !== null && t.author_id === userId,
    reported: t.reported === true,
    replies: replies.map((r: Row) => {
      const deleted = r.deleted_at !== null;
      return {
        id: str(r.id),
        parentId: r.parent_id ? str(r.parent_id) : null,
        body: deleted ? "" : str(r.body),
        photos: deleted ? [] : ((r.photos as string[] | null) ?? []),
        authorId: deleted ? "" : str(r.author_id),
        authorName: deleted ? "" : str(r.author_name) || "Kullanıcı",
        authorHandle: deleted || !r.author_handle ? null : str(r.author_handle),
        createdAt: iso(r.created_at),
        likeCount: deleted ? 0 : Number(r.like_count ?? 0),
        liked: !deleted && r.liked === true,
        mine: !deleted && userId !== null && r.author_id === userId,
        reported: r.reported === true,
        deleted,
        editedAt: !deleted && r.edited_at ? iso(r.edited_at) : null,
      };
    }),
  };
}

export type MentionSuggestion = { handle: string; name: string };

/**
 * People to mention for "@ah…": the topic's own people first (its author and repliers), then anyone
 * whose username starts with it or whose name contains it. Six at most.
 */
export async function mentionSuggestions(query: string, topicId: string | null, userId: string | null): Promise<MentionSuggestion[]> {
  const q = fold(query.trim().replace(/^@/, "")).slice(0, 20);
  const safeTopic = topicId && isUuid(topicId) ? topicId : null;
  const like = `${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const rows = await sql()`
    select p.handle, p.name,
      (${safeTopic}::uuid is not null and (
        exists (select 1 from forum_topics t where t.id = ${safeTopic}::uuid and t.author_id = p.user_id)
        or exists (select 1 from forum_replies r where r.topic_id = ${safeTopic}::uuid and r.author_id = p.user_id and r.deleted_at is null)
      )) as here
    from profiles p
    where p.handle is not null and p.name <> '' and p.user_id is distinct from ${userId}
      and (p.handle like ${like} or lower(translate(p.name, 'ÇĞİIÖŞÜÂÎÛçğıöşüâîû', 'cgiiosuaiucgiosuaiu')) like ${`%${q}%`})
    order by here desc, (p.handle like ${like}) desc, p.handle
    limit 6`;
  return rows.map((r) => ({ handle: str(r.handle), name: str(r.name) }));
}

export type ForumProfile = { userId: string; handle: string; name: string; memberSince: string; topicCount: number; replyCount: number };

/** /forum/kisi/ahmet: who @ahmet is, and how much they wrote. Null for an unknown username. */
export async function forumProfile(handle: string): Promise<ForumProfile | null> {
  const h = handle.toLowerCase();
  if (!HANDLE_RE.test(h)) return null;
  const rows = await sql()`
    select p.user_id, p.handle, p.name, p.created_at,
      (select count(*) from forum_topics t where t.author_id = p.user_id) as topics,
      (select count(*) from forum_replies r where r.author_id = p.user_id and r.deleted_at is null) as replies
    from profiles p where p.handle = ${h}`;
  const r = rows[0];
  if (!r) return null;
  return { userId: str(r.user_id), handle: str(r.handle), name: str(r.name) || "Kullanıcı", memberSince: iso(r.created_at), topicCount: Number(r.topics), replyCount: Number(r.replies) };
}
