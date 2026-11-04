import { ApiError, absolute, appUserId, body, expireTag, handler, invalid, json, requireAppUser, requireNamedProfile } from "@/lib/app-api";
import { isAdmin } from "@/lib/auth";
import { LISTINGS_TAG, getListing } from "@/lib/market-data";
import { isListingStatusChange, saveListingFor, setListingStatusFor } from "@/lib/services/market";

/** A listing. Removed ones only for their owner and admins, as on the website. */
export const GET = handler<{ id: string }>(async (req, { id }) => {
  const userId = await appUserId(req);
  const listing = await getListing(id, userId);
  const mine = Boolean(userId && listing?.sellerId === userId);
  const admin = await isAdmin(userId);
  if (!listing || (listing.status === "removed" && !mine && !admin)) throw new ApiError(404, "İlan bulunamadı.");
  return json({
    listing: { ...listing, photo: absolute(req, listing.photo), photos: listing.photos.map((p) => absolute(req, p)), mine },
    admin,
  });
});

/** The owner's changes. */
export const PUT = handler<{ id: string }>(async (req, { id }) => {
  const profile = await requireNamedProfile(req);
  const saved = await saveListingFor(profile, await body(req), id);
  if (!saved.ok) return invalid({ errors: saved.errors, message: saved.message });
  expireTag(LISTINGS_TAG);
  return json({ id: saved.id });
});

/** { status: "sold" | "active" | "removed" }: the owner's (or, to remove, an admin's). */
export const PATCH = handler<{ id: string }>(async (req, { id }) => {
  const userId = await requireAppUser(req);
  const { status } = await body(req);
  if (!isListingStatusChange(status)) throw new ApiError(400, "Geçersiz durum.");
  const changed = await setListingStatusFor(userId, status === "removed" && (await isAdmin(userId)), id, status);
  if (!changed) throw new ApiError(404, "Bu ilanı değiştiremezsiniz.");
  expireTag(LISTINGS_TAG);
  return json({ ok: true });
});
