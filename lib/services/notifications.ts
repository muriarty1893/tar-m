import "server-only";
import { iso, sql, str } from "@/lib/db";

/**
 * "Bildirimler": someone answered your topic or your reply, or mentioned you (@kullanıcıadı).
 * Shared by the website (/bildirimler, the bell in the header) and the app's API.
 */

export type NotificationKind = "reply" | "mention";

export type Notification = {
  id: string;
  kind: NotificationKind;
  actorName: string;
  actorHandle: string | null;
  topicId: string;
  topicTitle: string;
  replyId: string | null;
  /** The start of the reply or topic text. */
  excerpt: string;
  createdAt: string;
  read: boolean;
};

/** Tells these people (never the actor), at most once per post each. */
export async function notify(actorId: string, kind: NotificationKind, userIds: string[], topicId: string, replyId: string | null) {
  const to = [...new Set(userIds)].filter((u) => u && u !== actorId);
  if (!to.length) return;
  await sql()`
    insert into notifications (user_id, actor_id, kind, topic_id, reply_id)
    select u, ${actorId}, ${kind}, ${topicId}, ${replyId} from unnest(${to}::text[]) as u
    on conflict do nothing`;
}

/** Who these usernames belong to (only people who exist). */
export async function usersByHandle(handles: string[]): Promise<string[]> {
  if (!handles.length) return [];
  const rows = await sql()`select user_id from profiles where handle = any(${handles}::text[])`;
  return rows.map((r) => str(r.user_id));
}

const EXCERPT = 140;
const short = (s: string) => {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > EXCERPT ? `${t.slice(0, EXCERPT - 1).trimEnd()}…` : t;
};

/** The latest 50, newest first. */
export async function listNotifications(userId: string): Promise<Notification[]> {
  const rows = await sql()`
    select n.id, n.kind, n.topic_id, n.reply_id, n.created_at, n.read_at,
      a.name as actor_name, a.handle as actor_handle, t.title as topic_title,
      coalesce(r.body, t.body) as text, r.photos as reply_photos
    from notifications n
    join profiles a on a.user_id = n.actor_id
    join forum_topics t on t.id = n.topic_id
    left join forum_replies r on r.id = n.reply_id
    where n.user_id = ${userId} and (n.reply_id is null or r.deleted_at is null)
    order by n.created_at desc
    limit 50`;
  return rows.map((r) => {
    const text = short(str(r.text));
    const photos = (r.reply_photos as string[] | null) ?? [];
    return {
      id: str(r.id),
      kind: str(r.kind) as NotificationKind,
      actorName: str(r.actor_name) || "Kullanıcı",
      actorHandle: r.actor_handle ? str(r.actor_handle) : null,
      topicId: str(r.topic_id),
      topicTitle: str(r.topic_title),
      replyId: r.reply_id ? str(r.reply_id) : null,
      excerpt: text || (photos.length ? "Fotoğraf" : ""),
      createdAt: iso(r.created_at),
      read: r.read_at !== null,
    };
  });
}

export async function unreadNotifications(userId: string): Promise<number> {
  const rows = await sql()`select count(*) as n from notifications where user_id = ${userId} and read_at is null`;
  return Number(rows[0]?.n ?? 0);
}

export async function markNotificationsRead(userId: string) {
  await sql()`update notifications set read_at = now() where user_id = ${userId} and read_at is null`;
}
