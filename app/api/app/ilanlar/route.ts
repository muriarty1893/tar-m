import { absolute, appUserId, body, expireTag, handler, invalid, json, requireNamedProfile } from "@/lib/app-api";
import { parseMarketQuery } from "@/lib/market";
import { LISTINGS_TAG, PAGE_SIZE, listListings } from "@/lib/market-data";
import { saveListingFor } from "@/lib/services/market";

/** Pazar: one page of listings for ?q, kategori, il, sirala, gorunum (tumu | favoriler | ilanlarim), sayfa, as on /pazar. */
export const GET = handler(async (req) => {
  const userId = await appUserId(req);
  const query = parseMarketQuery(Object.fromEntries(new URL(req.url).searchParams));
  const { items, total } = await listListings(query, userId);
  return json({ items: items.map((l) => ({ ...l, photo: absolute(req, l.photo) })), total, page: query.sayfa, pageSize: PAGE_SIZE });
});

/** "İlan ver": the same checks as the website's form. */
export const POST = handler(async (req) => {
  const profile = await requireNamedProfile(req);
  const saved = await saveListingFor(profile, await body(req));
  if (!saved.ok) return invalid({ errors: saved.errors, message: saved.message });
  expireTag(LISTINGS_TAG);
  return json({ id: saved.id }, 201);
});
