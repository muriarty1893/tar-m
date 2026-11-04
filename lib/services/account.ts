import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { sql } from "@/lib/db";
import { isOwnPhotoUrl, isProvince } from "@/lib/market";

/** Hesabım's writes, shared by the website's server actions (app/hesabim/actions.ts) and the mobile app's API. */

export type ProfileErrors = { name?: string; province?: string };

/** The name other people see, and the home province (the default for listings and fields). */
export async function updateProfileFor(userId: string, name: unknown, province: unknown): Promise<{ errors: ProfileErrors }> {
  const clean = String(name ?? "").trim().replace(/\s+/g, " ");
  const place = typeof province === "string" ? province : "";
  const errors: ProfileErrors = {};
  if (clean.length < 2) errors.name = "Adınızı yazın (en az 2 harf).";
  else if (clean.length > 60) errors.name = "Ad en fazla 60 karakter olabilir.";
  if (place && !isProvince(place)) errors.province = "Listeden bir il seçin.";
  if (Object.keys(errors).length) return { errors };
  await sql()`
    insert into profiles (user_id, name, province) values (${userId}, ${clean}, ${place || null})
    on conflict (user_id) do update set name = excluded.name, province = excluded.province, updated_at = now()`;
  return { errors: {} };
}

/**
 * Deletes everything: listing photos, then the profile (which removes the listings, favourites, chats,
 * fields, expenses and tasks with it), then the Clerk account.
 */
export async function deleteAccountFor(userId: string) {
  const rows = await sql()`select photos from listings where seller_id = ${userId}`;
  const photos = rows.flatMap((r) => (r.photos as string[] | null) ?? []).filter(isOwnPhotoUrl);
  if (photos.length) {
    try {
      await del(photos);
    } catch (err) {
      console.error("deleteAccount: photos", err);
    }
  }
  await sql()`delete from profiles where user_id = ${userId}`;
  const clerk = await clerkClient();
  await clerk.users.deleteUser(userId);
}
