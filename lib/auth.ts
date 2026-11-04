import "server-only";
import { notFound, redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { iso, sql, str } from "./db";
import { signInHref } from "./sign-in-href";
import { assignHandle } from "./services/handles";

/**
 * The data access layer for signed-in people. Sign-in itself is Clerk's; the profile (the name other
 * people see, the home province) is ours, in `profiles`, keyed by the Clerk user id.
 */

/** `handle`: the username for mentions ("ahmet"); null until the person has a name. */
export type Profile = { userId: string; name: string; province: string; handle: string | null; createdAt: string };

export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

export { signInHref };

export async function requireUserId(returnTo: string): Promise<string> {
  const userId = await getUserId();
  if (!userId) redirect(signInHref(returnTo));
  return userId;
}

const toProfile = (r: Record<string, unknown>): Profile => ({
  userId: str(r.user_id),
  name: str(r.name),
  province: str(r.province),
  handle: r.handle ? str(r.handle) : null,
  createdAt: iso(r.created_at),
});

/** The person's profile, created on first use from their Clerk name, with a username once it has a name. */
export async function ensureProfile(userId: string): Promise<Profile> {
  const rows = await sql()`select user_id, name, province, handle, created_at from profiles where user_id = ${userId}`;
  if (rows[0]) {
    const profile = toProfile(rows[0]);
    if (profile.name && !profile.handle) profile.handle = await assignHandle(userId, profile.name);
    return profile;
  }
  const user = await currentUser();
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim().slice(0, 60);
  const created = await sql()`
    insert into profiles (user_id, name) values (${userId}, ${name})
    on conflict (user_id) do update set user_id = excluded.user_id
    returning user_id, name, province, handle, created_at`;
  const profile = toProfile(created[0]);
  if (profile.name && !profile.handle) profile.handle = await assignHandle(userId, profile.name);
  return profile;
}

/**
 * For anything other people will see (listings, messages): signed in, with a name. Without a name
 * the person is sent to Hesabım first, then back.
 */
export async function requireProfile(returnTo: string): Promise<Profile> {
  const userId = await requireUserId(returnTo);
  const profile = await ensureProfile(userId);
  if (!profile.name) redirect(`/hesabim?devam=${encodeURIComponent(returnTo)}`);
  return profile;
}

const listEnv = (name: string) =>
  (process.env[name] ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/**
 * Admins (news, reports): Clerk user ids in ADMIN_USER_IDS, or verified e-mail addresses in
 * ADMIN_EMAILS, both comma separated.
 */
export async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  if (listEnv("ADMIN_USER_IDS").includes(userId.toLowerCase())) return true;
  const emails = listEnv("ADMIN_EMAILS");
  if (!emails.length) return false;
  const user = await currentUser();
  if (!user || user.id !== userId) return false;
  return user.emailAddresses.some((e) => e.verification?.status === "verified" && emails.includes(e.emailAddress.toLowerCase()));
}

/** For /yonetim: the admin's user id; anyone else gets sign-in (signed out) or a 404 (signed in). */
export async function requireAdmin(returnTo: string): Promise<string> {
  const userId = await requireUserId(returnTo);
  if (!(await isAdmin(userId))) notFound();
  return userId;
}
