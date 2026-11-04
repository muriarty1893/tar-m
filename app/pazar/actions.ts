"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { getUserId, isAdmin, requireProfile, signInHref } from "@/lib/auth";
import { isUuid } from "@/lib/db";
import { LISTINGS_TAG } from "@/lib/market-data";
import type { ListingErrors, ListingInput } from "@/lib/market";
import { reportListingFor, saveListingFor, setListingStatusFor, startConversationFor, toggleFavoriteFor } from "@/lib/services/market";

export type SaveListingResult = { errors: ListingErrors; message?: string };

/** Posts a new listing, or saves the owner's changes to `id`. On success it opens the listing. */
export async function saveListing(raw: ListingInput, id?: string): Promise<SaveListingResult> {
  const profile = await requireProfile(id ? `/pazar/ilan/${id}/duzenle` : "/pazar/ilan-ver");
  const saved = await saveListingFor(profile, raw, id);
  if (!saved.ok) return { errors: saved.errors, message: saved.message };
  updateTag(LISTINGS_TAG);
  redirect(saved.created ? `/pazar/ilan/${saved.id}?yeni=1` : `/pazar/ilan/${saved.id}?kaydedildi=1`);
}

/** The owner marks a listing sold, puts it back on sale or removes it. A moderator may remove any listing. */
export async function setListingStatus(id: string, status: "active" | "sold" | "removed") {
  const userId = await getUserId();
  if (!userId || !isUuid(id)) return;
  await setListingStatusFor(userId, status === "removed" && (await isAdmin(userId)), id, status);
  updateTag(LISTINGS_TAG);
  if (status === "removed") redirect("/pazar?gorunum=ilanlarim&kaldirildi=1");
  refresh();
}

/** Hearts or un-hearts a listing; returns whether it's now a favourite. */
export async function toggleFavorite(listingId: string): Promise<{ favorite: boolean } | { signIn: string }> {
  const userId = await getUserId();
  if (!userId) return { signIn: signInHref(`/pazar/ilan/${listingId}`) };
  if (!isUuid(listingId)) return { favorite: false };
  await requireProfile(`/pazar/ilan/${listingId}`);
  return { favorite: await toggleFavoriteFor(userId, listingId) };
}

export async function reportListing(listingId: string, reason: string, note: string): Promise<{ ok: boolean; message?: string }> {
  const profile = await requireProfile(`/pazar/ilan/${listingId}`);
  return reportListingFor(profile.userId, listingId, reason, note);
}

export type StartChatResult = { message: string };

/**
 * A buyer's first message (or offer) on a listing: opens the chat with the seller, or adds to the one
 * they already have, then goes to it.
 */
export async function startConversation(listingId: string, text: string, offer: string): Promise<StartChatResult> {
  if (!isUuid(listingId)) return { message: "İlan bulunamadı." };
  const profile = await requireProfile(`/pazar/ilan/${listingId}`);
  const started = await startConversationFor(profile.userId, listingId, text, offer);
  if (!started.ok) return { message: started.message };
  redirect(`/mesajlar/${started.conversationId}`);
}
