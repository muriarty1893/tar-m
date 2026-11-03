"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { getUserId, isAdmin, requireProfile, signInHref } from "@/lib/auth";
import { isUuid, sql } from "@/lib/db";
import { LISTINGS_TAG } from "@/lib/market-data";
import { underMessageLimit } from "@/lib/chat-data";
import {
  DAILY_LISTING_LIMIT,
  MESSAGE_MAX,
  PRICE_MAX,
  isReportReason,
  normalizeListing,
  parsePrice,
  validateListing,
  type ListingErrors,
  type ListingInput,
} from "@/lib/market";

export type SaveListingResult = { errors: ListingErrors; message?: string };

/** The form's values as plain strings and booleans, whatever the browser sent. */
function clean(input: ListingInput): ListingInput {
  const s = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    title: s(input.title),
    category: s(input.category),
    condition: s(input.condition),
    price: s(input.price),
    unit: s(input.unit),
    quantity: s(input.quantity),
    negotiable: input.negotiable === true,
    province: s(input.province),
    district: s(input.district),
    description: s(input.description),
    photos: Array.isArray(input.photos) ? input.photos.filter((p): p is string => typeof p === "string") : [],
  };
}

/** Posts a new listing, or saves the owner's changes to `id`. On success it opens the listing. */
export async function saveListing(raw: ListingInput, id?: string): Promise<SaveListingResult> {
  const returnTo = id ? `/pazar/ilan/${id}/duzenle` : "/pazar/ilan-ver";
  const profile = await requireProfile(returnTo);
  const input = clean(raw);
  const errors = validateListing(input);
  if (Object.keys(errors).length) return { errors };
  const v = normalizeListing(input);

  if (id) {
    if (!isUuid(id)) return { errors: {}, message: "İlan bulunamadı." };
    const rows = await sql()`
      update listings set title = ${v.title}, category = ${v.category}, condition = ${v.condition}, price = ${v.price},
        unit = ${v.unit}, quantity = ${v.quantity}, negotiable = ${v.negotiable}, province = ${v.province},
        district = ${v.district}, description = ${v.description}, photos = ${v.photos}, search_text = ${v.searchText},
        updated_at = now()
      where id = ${id} and seller_id = ${profile.userId} and status <> 'removed'
      returning id`;
    if (!rows[0]) return { errors: {}, message: "Bu ilanı düzenleyemezsiniz." };
    updateTag(LISTINGS_TAG);
    redirect(`/pazar/ilan/${id}?kaydedildi=1`);
  }

  const recent = await sql()`select count(*) as n from listings where seller_id = ${profile.userId} and created_at > now() - interval '24 hours'`;
  if (Number(recent[0].n) >= DAILY_LISTING_LIMIT) {
    return { errors: {}, message: `Bir günde en fazla ${DAILY_LISTING_LIMIT} ilan verebilirsiniz. Yarın yeniden deneyin.` };
  }
  const rows = await sql()`
    insert into listings (seller_id, title, category, condition, price, unit, quantity, negotiable, province, district, description, photos, search_text)
    values (${profile.userId}, ${v.title}, ${v.category}, ${v.condition}, ${v.price}, ${v.unit}, ${v.quantity}, ${v.negotiable},
      ${v.province}, ${v.district}, ${v.description}, ${v.photos}, ${v.searchText})
    returning id`;
  // Remember the province for the next listing.
  if (!profile.province) await sql()`update profiles set province = ${v.province}, updated_at = now() where user_id = ${profile.userId}`;
  updateTag(LISTINGS_TAG);
  redirect(`/pazar/ilan/${rows[0].id}?yeni=1`);
}

/** The owner marks a listing sold, puts it back on sale or removes it. A moderator may remove any listing. */
export async function setListingStatus(id: string, status: "active" | "sold" | "removed") {
  const userId = await getUserId();
  if (!userId || !isUuid(id) || !["active", "sold", "removed"].includes(status)) return;
  if (status === "removed" && isAdmin(userId)) {
    await sql()`update listings set status = 'removed', updated_at = now() where id = ${id}`;
  } else {
    await sql()`update listings set status = ${status}, updated_at = now() where id = ${id} and seller_id = ${userId} and status <> 'removed'`;
  }
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
  const removed = await sql()`delete from favorites where user_id = ${userId} and listing_id = ${listingId} returning listing_id`;
  if (removed.length) return { favorite: false };
  await sql()`insert into favorites (user_id, listing_id) select ${userId}, id from listings where id = ${listingId} and status <> 'removed' on conflict do nothing`;
  return { favorite: true };
}

export async function reportListing(listingId: string, reason: string, note: string): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(listingId) || !isReportReason(reason)) return { ok: false, message: "Bir neden seçin." };
  const profile = await requireProfile(`/pazar/ilan/${listingId}`);
  const today = await sql()`select count(*) as n from reports where reporter_id = ${profile.userId} and created_at > now() - interval '24 hours'`;
  if (Number(today[0].n) >= 20) return { ok: false, message: "Bugün çok fazla şikâyet gönderdiniz; yarın yeniden deneyin." };
  await sql()`
    insert into reports (listing_id, reporter_id, reason, note)
    select id, ${profile.userId}, ${reason}, ${String(note ?? "").trim().slice(0, 500)} from listings where id = ${listingId} and seller_id <> ${profile.userId}
    on conflict (listing_id, reporter_id) do update set reason = excluded.reason, note = excluded.note, created_at = now(), resolved_at = null`;
  return { ok: true };
}

export type StartChatResult = { message: string };

/**
 * A buyer's first message (or offer) on a listing: opens the chat with the seller, or adds to the one
 * they already have, then goes to it.
 */
export async function startConversation(listingId: string, text: string, offer: string): Promise<StartChatResult> {
  if (!isUuid(listingId)) return { message: "İlan bulunamadı." };
  const profile = await requireProfile(`/pazar/ilan/${listingId}`);
  const body = String(text ?? "").trim();
  const amount = offer ? parsePrice(String(offer)) : NaN;
  const isOffer = Boolean(offer);
  if (isOffer && !(amount > 0 && amount <= PRICE_MAX)) return { message: "Geçerli bir teklif tutarı girin." };
  if (!isOffer && !body) return { message: "Bir mesaj yazın." };
  if (body.length > MESSAGE_MAX) return { message: `Mesaj en fazla ${MESSAGE_MAX} karakter olabilir.` };

  if (!(await underMessageLimit(profile.userId))) return { message: "Çok hızlı mesaj gönderdiniz; birkaç dakika sonra yeniden deneyin." };

  const listing = (await sql()`select seller_id, status from listings where id = ${listingId}`)[0];
  if (!listing || listing.status === "removed") return { message: "Bu ilan artık yayında değil." };
  if (listing.seller_id === profile.userId) return { message: "Kendi ilanınıza mesaj gönderemezsiniz." };

  const conv = await sql()`
    insert into conversations (listing_id, buyer_id, seller_id) values (${listingId}, ${profile.userId}, ${listing.seller_id})
    on conflict (listing_id, buyer_id) do update set listing_id = excluded.listing_id
    returning id`;
  const conversationId = String(conv[0].id);
  if (isOffer) {
    await sql()`update messages set offer_status = 'withdrawn' where conversation_id = ${conversationId} and offer_status = 'pending' and sender_id = ${profile.userId}`;
    await sql()`update messages set offer_status = 'countered' where conversation_id = ${conversationId} and offer_status = 'pending'`;
    await sql()`insert into messages (conversation_id, sender_id, offer_amount, offer_status) values (${conversationId}, ${profile.userId}, ${amount}, 'pending')`;
  }
  if (body) await sql()`insert into messages (conversation_id, sender_id, body) values (${conversationId}, ${profile.userId}, ${body})`;
  await sql()`update conversations set last_message_at = now(), buyer_read_at = now() where id = ${conversationId}`;
  redirect(`/mesajlar/${conversationId}`);
}
