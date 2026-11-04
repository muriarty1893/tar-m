import { ApiError, absolute, body, handler, invalid, json, requireNamedProfile } from "@/lib/app-api";
import { isOfferResponse, respondToOfferFor } from "@/lib/services/chat";

/** Answers the other person's waiting offer: { response: "accept" | "reject" | "counter", counter? }. */
export const POST = handler<{ id: string }>(async (req, { id }) => {
  const profile = await requireNamedProfile(req);
  const b = await body(req);
  if (!isOfferResponse(b.response)) throw new ApiError(400, "Geçersiz yanıt.");
  const r = await respondToOfferFor(profile.userId, id, b.response, b.counter);
  if (!("thread" in r)) return invalid({ error: r.error });
  return json({ thread: { ...r.thread, listing: { ...r.thread.listing, photo: absolute(req, r.thread.listing.photo) } } });
});
