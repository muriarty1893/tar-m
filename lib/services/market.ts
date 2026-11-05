import "server-only";
import { isUuid, sql } from "@/lib/db";
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
import type { Profile } from "@/lib/auth";

/**
 * Pazar's writes, shared by the website's server actions (app/pazar/actions.ts) and the mobile app's
 * API (app/api/app/…). The callers check who is signed in and refresh caches; these do the rest.
 */

/** The form's values as plain strings and booleans, whatever the browser or the app sent. */
export function cleanListing(input: Partial<Record<keyof ListingInput, unknown>>): ListingInput {
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

export type SaveListingOutcome = { ok: true; id: string; created: boolean } | { ok: false; errors: ListingErrors; message?: string };

/** Posts a new listing, or saves the owner's (or, with `admin`, a moderator's) changes to `id`. */
export async function saveListingFor(profile: Profile, raw: Partial<Record<keyof ListingInput, unknown>>, id?: string, admin = false): Promise<SaveListingOutcome> {
  const input = cleanListing(raw);
  const errors = validateListing(input);
  if (Object.keys(errors).length) return { ok: false, errors };
  const v = normalizeListing(input);

  if (id) {
    if (!isUuid(id)) return { ok: false, errors: {}, message: "İlan bulunamadı." };
    const rows = await sql()`
      update listings set title = ${v.title}, category = ${v.category}, condition = ${v.condition}, price = ${v.price},
        unit = ${v.unit}, quantity = ${v.quantity}, negotiable = ${v.negotiable}, province = ${v.province},
        district = ${v.district}, description = ${v.description}, photos = ${v.photos}, search_text = ${v.searchText},
        updated_at = now()
      where id = ${id} and ((seller_id = ${profile.userId} and status <> 'removed') or ${admin}::boolean)
      returning id`;
    if (!rows[0]) return { ok: false, errors: {}, message: "Bu ilanı düzenleyemezsiniz." };
    return { ok: true, id, created: false };
  }

  const recent = await sql()`select count(*) as n from listings where seller_id = ${profile.userId} and created_at > now() - interval '24 hours'`;
  if (Number(recent[0].n) >= DAILY_LISTING_LIMIT) {
    return { ok: false, errors: {}, message: `Bir günde en fazla ${DAILY_LISTING_LIMIT} ilan verebilirsiniz. Yarın yeniden deneyin.` };
  }
  const rows = await sql()`
    insert into listings (seller_id, title, category, condition, price, unit, quantity, negotiable, province, district, description, photos, search_text)
    values (${profile.userId}, ${v.title}, ${v.category}, ${v.condition}, ${v.price}, ${v.unit}, ${v.quantity}, ${v.negotiable},
      ${v.province}, ${v.district}, ${v.description}, ${v.photos}, ${v.searchText})
    returning id`;
  // Remember the province for the next listing.
  if (!profile.province) await sql()`update profiles set province = ${v.province}, updated_at = now() where user_id = ${profile.userId}`;
  return { ok: true, id: String(rows[0].id), created: true };
}

export type ListingStatusChange = "active" | "sold" | "removed";
export const isListingStatusChange = (s: unknown): s is ListingStatusChange => s === "active" || s === "sold" || s === "removed";

/**
 * The owner marks a listing sold, puts it back on sale or removes it. With `admin`, a moderator may do
 * any of these to any listing, including putting a removed one back on sale.
 */
export async function setListingStatusFor(userId: string, admin: boolean, id: string, status: ListingStatusChange): Promise<boolean> {
  if (!isUuid(id) || !isListingStatusChange(status)) return false;
  const rows = admin
    ? await sql()`update listings set status = ${status}, updated_at = now() where id = ${id} returning id`
    : await sql()`update listings set status = ${status}, updated_at = now() where id = ${id} and seller_id = ${userId} and status <> 'removed' returning id`;
  return rows.length > 0;
}

/** Hearts or un-hearts a listing; returns whether it's now a favourite. */
export async function toggleFavoriteFor(userId: string, listingId: string): Promise<boolean> {
  if (!isUuid(listingId)) return false;
  const removed = await sql()`delete from favorites where user_id = ${userId} and listing_id = ${listingId} returning listing_id`;
  if (removed.length) return false;
  const added = await sql()`insert into favorites (user_id, listing_id) select ${userId}, id from listings where id = ${listingId} and status <> 'removed' on conflict do nothing returning listing_id`;
  return added.length > 0;
}

export async function reportListingFor(userId: string, listingId: string, reason: string, note: string): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(listingId) || !isReportReason(reason)) return { ok: false, message: "Bir neden seçin." };
  const today = await sql()`select count(*) as n from reports where reporter_id = ${userId} and created_at > now() - interval '24 hours'`;
  if (Number(today[0].n) >= 20) return { ok: false, message: "Bugün çok fazla şikâyet gönderdiniz; yarın yeniden deneyin." };
  await sql()`
    insert into reports (listing_id, reporter_id, reason, note)
    select id, ${userId}, ${reason}, ${String(note ?? "").trim().slice(0, 500)} from listings where id = ${listingId} and seller_id <> ${userId}
    on conflict (listing_id, reporter_id) do update set reason = excluded.reason, note = excluded.note, created_at = now(), resolved_at = null`;
  return { ok: true };
}

/** A new offer replaces the sender's waiting one and counters the other side's. */
export async function placeOffer(conversationId: string, userId: string, amount: number) {
  await sql()`update messages set offer_status = 'withdrawn' where conversation_id = ${conversationId} and offer_status = 'pending' and sender_id = ${userId}`;
  await sql()`update messages set offer_status = 'countered' where conversation_id = ${conversationId} and offer_status = 'pending'`;
  await sql()`insert into messages (conversation_id, sender_id, offer_amount, offer_status) values (${conversationId}, ${userId}, ${amount}, 'pending')`;
}

export type StartConversationOutcome = { ok: true; conversationId: string } | { ok: false; message: string };

/**
 * A buyer's first message (or offer) on a listing: opens the chat with the seller, or adds to the one
 * they already have.
 */
export async function startConversationFor(userId: string, listingId: string, text: unknown, offer: unknown): Promise<StartConversationOutcome> {
  if (!isUuid(listingId)) return { ok: false, message: "İlan bulunamadı." };
  const body = String(text ?? "").trim();
  const offerText = String(offer ?? "").trim();
  const isOffer = Boolean(offerText);
  const amount = isOffer ? parsePrice(offerText) : NaN;
  if (isOffer && !(amount > 0 && amount <= PRICE_MAX)) return { ok: false, message: "Geçerli bir teklif tutarı girin." };
  if (!isOffer && !body) return { ok: false, message: "Bir mesaj yazın." };
  if (body.length > MESSAGE_MAX) return { ok: false, message: `Mesaj en fazla ${MESSAGE_MAX} karakter olabilir.` };

  if (!(await underMessageLimit(userId))) return { ok: false, message: "Çok hızlı mesaj gönderdiniz; birkaç dakika sonra yeniden deneyin." };

  const listing = (await sql()`select seller_id, status from listings where id = ${listingId}`)[0];
  if (!listing || listing.status === "removed") return { ok: false, message: "Bu ilan artık yayında değil." };
  if (listing.seller_id === userId) return { ok: false, message: "Kendi ilanınıza mesaj gönderemezsiniz." };

  const conv = await sql()`
    insert into conversations (listing_id, buyer_id, seller_id) values (${listingId}, ${userId}, ${listing.seller_id})
    on conflict (listing_id, buyer_id) do update set listing_id = excluded.listing_id
    returning id`;
  const conversationId = String(conv[0].id);
  if (isOffer) await placeOffer(conversationId, userId, amount);
  if (body) await sql()`insert into messages (conversation_id, sender_id, body) values (${conversationId}, ${userId}, ${body})`;
  await sql()`update conversations set last_message_at = now(), buyer_read_at = now() where id = ${conversationId}`;
  return { ok: true, conversationId };
}
