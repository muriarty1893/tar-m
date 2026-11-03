"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { getUserId } from "@/lib/auth";
import { sql } from "@/lib/db";
import { LISTINGS_TAG } from "@/lib/market-data";
import { isOwnPhotoUrl, isProvince } from "@/lib/market";

export type ProfileResult = { errors: { name?: string; province?: string }; saved?: boolean };

/** The name other people see, and the home province (the default for listings and fields). */
export async function updateProfile(name: string, province: string, next: string): Promise<ProfileResult> {
  const userId = await getUserId();
  if (!userId) redirect("/giris?redirect_url=%2Fhesabim");
  const clean = String(name ?? "").trim().replace(/\s+/g, " ");
  const errors: ProfileResult["errors"] = {};
  if (clean.length < 2) errors.name = "Adınızı yazın (en az 2 harf).";
  else if (clean.length > 60) errors.name = "Ad en fazla 60 karakter olabilir.";
  if (province && !isProvince(province)) errors.province = "Listeden bir il seçin.";
  if (Object.keys(errors).length) return { errors };
  await sql()`
    insert into profiles (user_id, name, province) values (${userId}, ${clean}, ${province || null})
    on conflict (user_id) do update set name = excluded.name, province = excluded.province, updated_at = now()`;
  updateTag(LISTINGS_TAG);
  // Only our own pages: never an address from elsewhere.
  if (next.startsWith("/") && !next.startsWith("//")) redirect(next);
  refresh();
  return { errors: {}, saved: true };
}

/**
 * Deletes everything: listing photos, then the profile (which removes the listings, favourites, chats,
 * fields, expenses and tasks with it), then the Clerk account.
 */
export async function deleteAccount(confirmed: boolean): Promise<{ error: string } | void> {
  const userId = await getUserId();
  if (!userId) redirect("/giris");
  if (!confirmed) return { error: "Silmek için kutuyu işaretleyin." };
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
  updateTag(LISTINGS_TAG);
  redirect("/?hesap=silindi");
}
