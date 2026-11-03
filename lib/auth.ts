import "server-only";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { iso, sql, str } from "./db";
import { signInHref } from "./sign-in-href";

/**
 * The data access layer for signed-in people. Sign-in itself is Clerk's; the profile (the name other
 * people see, the home province) is ours, in `profiles`, keyed by the Clerk user id.
 */

export type Profile = { userId: string; name: string; province: string; createdAt: string };

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
  createdAt: iso(r.created_at),
});

/** The person's profile, created on first use from their Clerk name. */
export async function ensureProfile(userId: string): Promise<Profile> {
  const rows = await sql()`select user_id, name, province, created_at from profiles where user_id = ${userId}`;
  if (rows[0]) return toProfile(rows[0]);
  const user = await currentUser();
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim().slice(0, 60);
  const created = await sql()`
    insert into profiles (user_id, name) values (${userId}, ${name})
    on conflict (user_id) do update set user_id = excluded.user_id
    returning user_id, name, province, created_at`;
  return toProfile(created[0]);
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

/** Moderators: Clerk user ids in ADMIN_USER_IDS, comma separated. */
export function isAdmin(userId: string | null): boolean {
  if (!userId) return false;
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(userId);
}
