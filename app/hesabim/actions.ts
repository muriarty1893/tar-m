"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { getUserId } from "@/lib/auth";
import { LISTINGS_TAG } from "@/lib/market-data";
import { deleteAccountFor, updateProfileFor, type ProfileErrors } from "@/lib/services/account";

export type ProfileResult = { errors: ProfileErrors; saved?: boolean };

/** The name other people see, the home province (the default for listings and fields) and the username for mentions. */
export async function updateProfile(name: string, province: string, handle: string, next: string): Promise<ProfileResult> {
  const userId = await getUserId();
  if (!userId) redirect("/giris?redirect_url=%2Fhesabim");
  // An empty box keeps (or makes) the one made from the name.
  const { errors } = await updateProfileFor(userId, name, province, handle.trim() ? handle : undefined);
  if (Object.keys(errors).length) return { errors };
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
  await deleteAccountFor(userId);
  updateTag(LISTINGS_TAG);
  redirect("/?hesap=silindi");
}
