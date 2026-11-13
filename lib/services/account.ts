import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { deletePhotosNoLongerUsed } from "@/lib/services/photos";
import { sql } from "@/lib/db";
import { cleanHandle, isForumPhotoUrl, validateHandle } from "@/lib/forum";
import { isOwnPhotoUrl, isProvince } from "@/lib/market";
import { assignHandle, handleFree } from "@/lib/services/handles";

/** Hesabım's writes, shared by the website's server actions (app/hesabim/actions.ts) and the mobile app's API. */

export type ProfileErrors = { name?: string; province?: string; handle?: string };

/**
 * The name other people see, the home province (the default for listings and fields) and, when
 * given, the username for mentions. Without one, a username is made from the name.
 */
export async function updateProfileFor(userId: string, name: unknown, province: unknown, handle?: unknown): Promise<{ errors: ProfileErrors }> {
  const clean = String(name ?? "").trim().replace(/\s+/g, " ");
  const place = typeof province === "string" ? province : "";
  const username = typeof handle === "string" ? cleanHandle(handle) : null;
  const errors: ProfileErrors = {};
  if (clean.length < 2) errors.name = "Adınızı yazın (en az 2 harf).";
  else if (clean.length > 60) errors.name = "Ad en fazla 60 karakter olabilir.";
  if (place && !isProvince(place)) errors.province = "Listeden bir il seçin.";
  if (username !== null) {
    const invalid = validateHandle(username);
    if (invalid) errors.handle = invalid;
    else if (!(await handleFree(userId, username))) errors.handle = `@${username} başkasına ait; başka bir kullanıcı adı deneyin.`;
  }
  if (Object.keys(errors).length) return { errors };
  try {
    await sql()`
      insert into profiles (user_id, name, province, handle) values (${userId}, ${clean}, ${place || null}, ${username})
      on conflict (user_id) do update set name = excluded.name, province = excluded.province,
        handle = coalesce(excluded.handle, profiles.handle), updated_at = now()`;
  } catch {
    // Taken at the same moment (the unique index).
    return { errors: { handle: `@${username} başkasına ait; başka bir kullanıcı adı deneyin.` } };
  }
  if (username === null) await assignHandle(userId, clean);
  return { errors: {} };
}

/**
 * Deletes everything: the profile (which removes the listings, posts, favourites, chats, fields,
 * expenses and tasks with it), then their photos that nothing else shows, then the Clerk account.
 */
export async function deleteAccountFor(userId: string) {
  const rows = await sql()`
    select photos from listings where seller_id = ${userId}
    union all select photos from forum_topics where author_id = ${userId}
    union all select photos from forum_replies where author_id = ${userId}`;
  const photos = rows.flatMap((r) => (r.photos as string[] | null) ?? []);
  await sql()`delete from profiles where user_id = ${userId}`;
  await deletePhotosNoLongerUsed(photos, (p) => isOwnPhotoUrl(p) || isForumPhotoUrl(p), "deleteAccount");
  // Sample members ("demo_…") have no Clerk account.
  if (!userId.startsWith("user_")) return;
  const clerk = await clerkClient();
  await clerk.users.deleteUser(userId);
}
