import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { iso, sql, str } from "@/lib/db";
import { fold } from "@/data/demo-market";
import { photosOf } from "@/lib/avatars";

/**
 * Yönetim → Üyeler: everyone with a profile, and suspension. A suspended member can sign in and read,
 * but not post, reply, list, edit or message (checked in the services that write: assertCanPost).
 */

export const SUSPENDED_MESSAGE = "Hesabınız yöneticiler tarafından askıya alındı; şu an paylaşım yapamazsınız.";

/** Null if `userId` may post; otherwise the message to show them. */
export async function suspendedMessage(userId: string): Promise<string | null> {
  const rows = await sql()`select suspended_at from profiles where user_id = ${userId}`;
  return rows[0]?.suspended_at ? SUSPENDED_MESSAGE : null;
}

const listEnv = (name: string) =>
  (process.env[name] ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/** Whether someone else's account is an admin's (ADMIN_USER_IDS, or a verified ADMIN_EMAILS address). */
export async function isAdminAccount(userId: string): Promise<boolean> {
  if (listEnv("ADMIN_USER_IDS").includes(userId.toLowerCase())) return true;
  const emails = listEnv("ADMIN_EMAILS");
  if (!emails.length || !userId.startsWith("user_")) return false;
  try {
    const user = await (await clerkClient()).users.getUser(userId);
    return user.emailAddresses.some((e) => e.verification?.status === "verified" && emails.includes(e.emailAddress.toLowerCase()));
  } catch {
    return false;
  }
}

export type Member = {
  userId: string;
  name: string;
  handle: string | null;
  province: string;
  photo: string | null;
  joinedAt: string;
  topics: number;
  replies: number;
  listings: number;
  suspendedAt: string | null;
  suspendedReason: string;
  /** In ADMIN_USER_IDS (admins only by e-mail aren't marked here). */
  admin: boolean;
  /** Sample members from `npm run demo:seed`. */
  demo: boolean;
};

export const MEMBERS_PAGE = 50;

export type MemberFilter = "tumu" | "askida" | "gercek";

/** Members matching a name or username, newest first; `askida` only suspended, `gercek` no samples. */
export async function listMembers(q: string, filter: MemberFilter, page: number): Promise<{ items: Member[]; total: number }> {
  const params: unknown[] = [];
  const p = (v: unknown) => (params.push(v), `$${params.length}`);
  const where = ["true"];
  const words = fold(q).split(/\s+/).filter(Boolean).slice(0, 4);
  for (const w of words) {
    const like = p(`%${w.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
    where.push(`(lower(translate(m.name, 'ÇĞİIÖŞÜÂÎÛçğıöşüâîû', 'cgiiosuaiucgiosuaiu')) like ${like} or coalesce(m.handle, '') like ${like})`);
  }
  if (filter === "askida") where.push("m.suspended_at is not null");
  if (filter === "gercek") where.push("m.user_id not like 'demo\\_%'");
  const rows = await sql().query(
    `select m.user_id, m.name, m.handle, m.province, m.created_at, m.suspended_at, m.suspended_reason, count(*) over () as total,
       (select count(*) from forum_topics t where t.author_id = m.user_id) as topics,
       (select count(*) from forum_replies r where r.author_id = m.user_id and r.deleted_at is null) as replies,
       (select count(*) from listings l where l.seller_id = m.user_id and l.status <> 'removed') as listings
     from profiles m
     where ${where.join(" and ")}
     order by m.created_at desc
     limit ${MEMBERS_PAGE} offset ${(Math.max(1, page) - 1) * MEMBERS_PAGE}`,
    params,
  );
  const admins = listEnv("ADMIN_USER_IDS");
  const photos = await photosOf(rows.map((r) => str(r.user_id)));
  return {
    total: rows.length ? Number(rows[0].total) : 0,
    items: rows.map((r) => {
      const userId = str(r.user_id);
      return {
        userId,
        name: str(r.name) || "(adsız)",
        handle: r.handle ? str(r.handle) : null,
        province: str(r.province),
        photo: photos[userId] ?? null,
        joinedAt: iso(r.created_at),
        topics: Number(r.topics),
        replies: Number(r.replies),
        listings: Number(r.listings),
        suspendedAt: r.suspended_at ? iso(r.suspended_at) : null,
        suspendedReason: str(r.suspended_reason),
        admin: admins.includes(userId.toLowerCase()),
        demo: userId.startsWith("demo_"),
      };
    }),
  };
}

export async function memberName(userId: string): Promise<string | null> {
  const rows = await sql()`select name from profiles where user_id = ${userId}`;
  return rows[0] ? str(rows[0].name) || "(adsız)" : null;
}

/** Suspends (with an optional reason shown to admins) or lifts it. Admins can't be suspended. */
export async function setSuspendedFor(targetId: string, suspended: boolean, reason = ""): Promise<{ ok: true; name: string } | { ok: false; message: string }> {
  const name = await memberName(targetId);
  if (name === null) return { ok: false, message: "Üye bulunamadı." };
  if (suspended && (await isAdminAccount(targetId))) return { ok: false, message: "Yöneticiler askıya alınamaz." };
  const clean = reason.replace(/\s+/g, " ").trim().slice(0, 300) || null;
  if (suspended) await sql()`update profiles set suspended_at = coalesce(suspended_at, now()), suspended_reason = ${clean}, updated_at = now() where user_id = ${targetId}`;
  else await sql()`update profiles set suspended_at = null, suspended_reason = null, updated_at = now() where user_id = ${targetId}`;
  return { ok: true, name };
}
