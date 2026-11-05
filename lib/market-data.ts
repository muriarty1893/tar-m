import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { iso, isUuid, num, sql, str, type Row } from "./db";
import { STOCK_PHOTOS, fold, type ListingCategory, type ListingStatus, type MarketQuery } from "./market";

/** Reads for Pazar. Writes are server actions (app/pazar/actions.ts). */

export const PAGE_SIZE = 24;
/** Tag on cached listing reads (the home page's "Pazarda yeni"); updated when a listing changes. */
export const LISTINGS_TAG = "listings";

export type ListingCard = {
  id: string;
  title: string;
  category: ListingCategory;
  price: number;
  unit: string | null;
  province: string;
  district: string;
  photo: string;
  stockPhoto: boolean;
  status: ListingStatus;
  createdAt: string;
  sellerId: string;
  favorite: boolean;
};

function toCard(r: Row): ListingCard {
  const photos = (r.photos as string[] | null) ?? [];
  const category = str(r.category) as ListingCategory;
  return {
    id: str(r.id),
    title: str(r.title),
    category,
    price: num(r.price) ?? 0,
    unit: r.unit ? str(r.unit) : null,
    province: str(r.province),
    district: str(r.district),
    photo: photos[0] ?? STOCK_PHOTOS[category],
    stockPhoto: photos.length === 0,
    status: str(r.status) as ListingStatus,
    createdAt: iso(r.created_at),
    sellerId: str(r.seller_id),
    favorite: r.favorite === true,
  };
}

const CARD_COLUMNS = "l.id, l.title, l.category, l.price, l.unit, l.province, l.district, l.photos, l.status, l.created_at, l.seller_id";

/** One page of /pazar for these filters. Favoriler and İlanlarım need `userId`. */
export async function listListings(q: MarketQuery, userId: string | null): Promise<{ items: ListingCard[]; total: number }> {
  const params: unknown[] = [];
  const p = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };
  const where: string[] = [];
  const me = userId ? p(userId) : "null";

  if (q.gorunum === "ilanlarim") {
    if (!userId) return { items: [], total: 0 };
    where.push(`l.seller_id = ${me}`, `l.status in ('active', 'sold')`);
  } else if (q.gorunum === "favoriler") {
    if (!userId) return { items: [], total: 0 };
    where.push(`exists (select 1 from favorites f where f.listing_id = l.id and f.user_id = ${me})`, `l.status in ('active', 'sold')`);
  } else {
    where.push(`l.status = 'active'`);
  }
  if (q.kategori !== "tumu") where.push(`l.category = ${p(q.kategori)}`);
  if (q.il) where.push(`l.province = ${p(q.il)}`);
  const words = fold(q.q).split(/\s+/).filter(Boolean).slice(0, 6);
  for (const w of words) where.push(`l.search_text like ${p(`%${w.replace(/[\\%_]/g, (c) => `\\${c}`)}%`)}`);

  const order = q.sirala === "ucuz" ? "l.price asc, l.created_at desc" : q.sirala === "pahali" ? "l.price desc, l.created_at desc" : "l.created_at desc";
  const favorite = userId ? `exists (select 1 from favorites f where f.listing_id = l.id and f.user_id = ${me})` : "false";
  const text = `
    select ${CARD_COLUMNS}, ${favorite} as favorite, count(*) over () as total
    from listings l
    where ${where.join(" and ")}
    order by ${order}
    limit ${PAGE_SIZE} offset ${(q.sayfa - 1) * PAGE_SIZE}`;
  const rows = await sql().query(text, params);
  return { items: rows.map(toCard), total: rows.length ? Number(rows[0].total) : 0 };
}

/** The newest live listings, for the home page. Cached for minutes; a new listing refreshes it. */
export async function latestListings(limit = 4): Promise<ListingCard[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(LISTINGS_TAG);
  if (!process.env.DATABASE_URL) return [];
  try {
    const rows = await sql().query(
      `select ${CARD_COLUMNS}, false as favorite from listings l where l.status = 'active' order by l.created_at desc limit $1`,
      [limit],
    );
    return rows.map(toCard);
  } catch (err) {
    // The home page must never fail because the market can't be read.
    console.error("latestListings", err);
    return [];
  }
}

export type MarketSummary = { active: number; byCategory: Record<string, number>; newest: { id: string; title: string; price: number; unit: string | null } | null };

/** Live listings in all and per category, and the newest one: the home page's Pazar tile and Pazar's category list. Cached for minutes. */
export async function marketSummary(): Promise<MarketSummary> {
  "use cache";
  cacheLife("minutes");
  cacheTag(LISTINGS_TAG);
  const empty: MarketSummary = { active: 0, byCategory: {}, newest: null };
  if (!process.env.DATABASE_URL) return empty;
  try {
    const [counts, newest] = await Promise.all([
      sql()`select category, count(*) as n from listings where status = 'active' group by category`,
      sql()`select id, title, price, unit from listings where status = 'active' order by created_at desc limit 1`,
    ]);
    const byCategory = Object.fromEntries(counts.map((r) => [str(r.category), Number(r.n)]));
    const n = newest[0];
    return {
      active: Object.values(byCategory).reduce((a, b) => a + b, 0),
      byCategory,
      newest: n ? { id: str(n.id), title: str(n.title), price: num(n.price) ?? 0, unit: n.unit ? str(n.unit) : null } : null,
    };
  } catch (err) {
    console.error("marketSummary", err);
    return empty;
  }
}

export type ListingDetail = ListingCard & {
  condition: string | null;
  quantity: string | null;
  negotiable: boolean;
  description: string;
  photos: string[];
  updatedAt: string;
  seller: { id: string; name: string; memberSince: string; activeListings: number };
  /** The viewer's chat about this listing, if they've started one. */
  conversationId: string | null;
  /** Whether the viewer has already reported it. */
  reported: boolean;
};

export async function getListing(id: string, userId: string | null): Promise<ListingDetail | null> {
  if (!isUuid(id)) return null;
  const rows = await sql()`
    select l.*, p.name as seller_name, p.created_at as seller_since,
      (select count(*) from listings o where o.seller_id = l.seller_id and o.status = 'active') as seller_active,
      exists (select 1 from favorites f where f.listing_id = l.id and f.user_id = ${userId}) as favorite,
      (select c.id from conversations c where c.listing_id = l.id and c.buyer_id = ${userId}) as conversation_id,
      exists (select 1 from reports r where r.listing_id = l.id and r.reporter_id = ${userId}) as reported
    from listings l join profiles p on p.user_id = l.seller_id
    where l.id = ${id}`;
  const r = rows[0];
  if (!r) return null;
  const card = toCard(r);
  return {
    ...card,
    condition: r.condition ? str(r.condition) : null,
    quantity: r.quantity ? str(r.quantity) : null,
    negotiable: r.negotiable === true,
    description: str(r.description),
    photos: ((r.photos as string[] | null) ?? []).length ? (r.photos as string[]) : [card.photo],
    updatedAt: iso(r.updated_at),
    seller: { id: card.sellerId, name: str(r.seller_name), memberSince: iso(r.seller_since), activeListings: Number(r.seller_active) },
    conversationId: r.conversation_id ? str(r.conversation_id) : null,
    reported: r.reported === true,
  };
}

/** A listing's editable fields, for its owner (not once removed) or an admin (any listing). */
export async function getEditableListing(id: string, userId: string, admin = false) {
  if (!isUuid(id)) return null;
  const rows = admin
    ? await sql()`select l.*, p.name as seller_name from listings l join profiles p on p.user_id = l.seller_id where l.id = ${id}`
    : await sql()`select l.*, p.name as seller_name from listings l join profiles p on p.user_id = l.seller_id where l.id = ${id} and l.seller_id = ${userId} and l.status <> 'removed'`;
  return rows[0] ?? null;
}
