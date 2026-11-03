/**
 * Pazar (the farmers' market) on the website: the rules shared by the listing form (in the browser)
 * and the server actions that save it, plus the offer rules for chats. The categories, units,
 * price format and search folding are the mobile app's (data/demo-market.ts).
 */
import { provinces } from "@/data/provinces";
import {
  CATEGORIES,
  CONDITIONS,
  SOLD_BY_UNIT,
  STOCK_PHOTOS,
  UNITS,
  categoryLabel,
  conditionLabel,
  fold,
  formatPrice,
  parsePrice,
  type CategoryId,
  type Condition,
  type ListingCategory,
} from "@/data/demo-market";

export { CATEGORIES, CONDITIONS, SOLD_BY_UNIT, STOCK_PHOTOS, UNITS, categoryLabel, conditionLabel, fold, formatPrice, parsePrice };
export type { CategoryId, Condition, ListingCategory };

export const TITLE_MIN = 5;
export const TITLE_MAX = 70;
export const DESCRIPTION_MAX = 1000;
export const MAX_PHOTOS = 5;
export const PRICE_MAX = 100_000_000;
/** Listings one person may post in 24 hours. */
export const DAILY_LISTING_LIMIT = 10;

export type ListingStatus = "active" | "sold" | "removed";

/** What the listing form sends. */
export type ListingInput = {
  title: string;
  category: string;
  condition: string;
  price: string;
  unit: string;
  quantity: string;
  negotiable: boolean;
  province: string;
  district: string;
  description: string;
  photos: string[];
};

export type ListingField = keyof ListingInput;
export type ListingErrors = Partial<Record<ListingField, string>>;

export const EMPTY_LISTING: ListingInput = {
  title: "",
  category: "",
  condition: "",
  price: "",
  unit: "",
  quantity: "",
  negotiable: false,
  province: "",
  district: "",
  description: "",
  photos: [],
};

const LISTING_CATEGORIES = CATEGORIES.map((c) => c.id).filter((id): id is ListingCategory => id !== "tumu");
export const isListingCategory = (s: string): s is ListingCategory => (LISTING_CATEGORIES as string[]).includes(s);
export const isProvince = (s: string) => provinces.some((p) => p.name === s);
/** Produce and seed are priced by a unit (kg, ton, kasa…). */
export const soldByUnit = (category: string) => isListingCategory(category) && SOLD_BY_UNIT.includes(category);
/** Produce has no "Sıfır / İkinci el". */
export const hasCondition = (category: string) => isListingCategory(category) && category !== "urun";

/** Photos must be our own Blob uploads (not any address on the web). */
export const isOwnPhotoUrl = (url: string) => /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/ilanlar\/[\w./-]+$/i.test(url);

/** The form's checks, as messages under each field. The server runs the same checks. */
export function validateListing(d: ListingInput): ListingErrors {
  const e: ListingErrors = {};
  const title = d.title.trim();
  if (title.length < TITLE_MIN) e.title = `Başlık en az ${TITLE_MIN} karakter olmalı.`;
  else if (title.length > TITLE_MAX) e.title = `Başlık en fazla ${TITLE_MAX} karakter olabilir.`;
  if (!isListingCategory(d.category)) e.category = "Bir kategori seçin.";
  if (hasCondition(d.category) && !CONDITIONS.some((c) => c.id === d.condition)) e.condition = "Sıfır mı ikinci el mi, seçin.";
  const price = parsePrice(d.price);
  if (!(price > 0)) e.price = "Geçerli bir fiyat girin (ör. 145.000).";
  else if (price > PRICE_MAX) e.price = "Fiyat çok yüksek görünüyor.";
  if (soldByUnit(d.category) && !UNITS.includes(d.unit)) e.unit = "Fiyatın birimini seçin.";
  if (d.quantity.trim().length > 30) e.quantity = "Miktar en fazla 30 karakter olabilir.";
  if (!isProvince(d.province)) e.province = "İli seçin.";
  if (d.district.trim().length > 40) e.district = "İlçe en fazla 40 karakter olabilir.";
  if (d.description.length > DESCRIPTION_MAX) e.description = `Açıklama en fazla ${DESCRIPTION_MAX} karakter olabilir.`;
  if (d.photos.length > MAX_PHOTOS) e.photos = `En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsiniz.`;
  else if (d.photos.some((p) => !isOwnPhotoUrl(p))) e.photos = "Fotoğraflardan biri yüklenemedi; kaldırıp yeniden ekleyin.";
  return e;
}

/** The form's order, for the error summary. */
export const LISTING_FIELD_ORDER: ListingField[] = ["photos", "title", "category", "condition", "price", "unit", "quantity", "province", "district", "description"];

/** A valid input as the values saved in `listings`. */
export function normalizeListing(d: ListingInput) {
  const category = d.category as ListingCategory;
  const byUnit = soldByUnit(category);
  const quantity = d.quantity.trim();
  const unit = byUnit ? d.unit : null;
  const row = {
    title: d.title.trim().replace(/\s+/g, " "),
    category,
    condition: hasCondition(category) ? (d.condition as Condition) : null,
    price: parsePrice(d.price),
    unit,
    // "25 ton": the quantity is counted in the price's unit.
    quantity: byUnit && quantity ? (/^[\d.,\s]+$/.test(quantity) ? `${quantity} ${unit}` : quantity) : null,
    negotiable: d.negotiable,
    province: d.province,
    district: d.district.trim(),
    description: d.description.trim(),
    photos: d.photos,
  };
  return { ...row, searchText: searchTextOf(row) };
}

/** What the search box looks through, folded so "traktor" finds "Traktör". */
export function searchTextOf(l: { title: string; description: string; province: string; district: string; category: ListingCategory }) {
  return fold(`${l.title} ${l.description} ${l.district} ${l.province} ${categoryLabel(l.category)}`);
}

/** "520.000 ₺", "11.200 ₺ / ton" */
export const priceLabel = (price: number, unit?: string | null) => (unit ? `${formatPrice(price)} / ${unit}` : formatPrice(price));

/** "Çumra, Konya" or "Konya" */
export const placeLabel = (province: string, district?: string | null) => (district ? `${district}, ${province}` : province);

// ---------------------------------------------------------------- Pazar filters (the URL)

export type MarketSort = "yeni" | "ucuz" | "pahali";
export type MarketView = "tumu" | "favoriler" | "ilanlarim";

export const SORTS: { id: MarketSort; label: string }[] = [
  { id: "yeni", label: "En yeni" },
  { id: "ucuz", label: "En düşük fiyat" },
  { id: "pahali", label: "En yüksek fiyat" },
];

export type MarketQuery = { q: string; kategori: CategoryId; il: string; sirala: MarketSort; gorunum: MarketView; sayfa: number };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Reads /pazar's search params; anything unknown falls back to the default. */
export function parseMarketQuery(sp: Record<string, string | string[] | undefined>): MarketQuery {
  const kategori = first(sp.kategori);
  const sirala = first(sp.sirala);
  const gorunum = first(sp.gorunum);
  const il = first(sp.il);
  const sayfa = Number.parseInt(first(sp.sayfa), 10);
  return {
    q: first(sp.q).trim().slice(0, 80),
    kategori: CATEGORIES.some((c) => c.id === kategori) ? (kategori as CategoryId) : "tumu",
    il: isProvince(il) ? il : "",
    sirala: SORTS.some((s) => s.id === sirala) ? (sirala as MarketSort) : "yeni",
    gorunum: gorunum === "favoriler" || gorunum === "ilanlarim" ? gorunum : "tumu",
    sayfa: Number.isFinite(sayfa) && sayfa > 1 ? Math.min(sayfa, 100) : 1,
  };
}

/** /pazar with these filters; defaults are left out of the URL. */
export function marketHref(q: MarketQuery, change: Partial<MarketQuery> = {}) {
  const next = { ...q, sayfa: 1, ...change };
  const p = new URLSearchParams();
  if (next.q) p.set("q", next.q);
  if (next.kategori !== "tumu") p.set("kategori", next.kategori);
  if (next.il) p.set("il", next.il);
  if (next.sirala !== "yeni") p.set("sirala", next.sirala);
  if (next.gorunum !== "tumu") p.set("gorunum", next.gorunum);
  if (next.sayfa > 1) p.set("sayfa", String(next.sayfa));
  const s = p.toString();
  return s ? `/pazar?${s}` : "/pazar";
}

// ---------------------------------------------------------------- Offers in chats

export type OfferStatus = "pending" | "accepted" | "rejected" | "countered" | "withdrawn";

export const OFFER_STATUS: Record<OfferStatus, string> = {
  pending: "Yanıt bekliyor",
  accepted: "Kabul edildi",
  rejected: "Reddedildi",
  countered: "Karşı teklif verildi",
  withdrawn: "Yerine yeni teklif verildi",
};

export type OfferResponse = "accept" | "reject" | "counter";

/**
 * Who may answer an offer: only the other person, and only while it's waiting. A seller answers a
 * buyer's offer; a buyer answers the seller's counter-offer.
 */
export function canRespond(offer: { senderId: string; status: OfferStatus }, userId: string) {
  return offer.status === "pending" && offer.senderId !== userId;
}

/** A new offer from `senderId` settles the waiting ones: theirs are replaced, the other side's are countered. */
export function settledStatus(pendingSenderId: string, newSenderId: string): OfferStatus {
  return pendingSenderId === newSenderId ? "withdrawn" : "countered";
}

/** "Teklif: 640.000 ₺" for previews. */
export const offerLine = (amount: number) => `Teklif: ${formatPrice(amount)}`;

export const MESSAGE_MAX = 1000;
/** Messages one person may send in 10 minutes (stops a runaway script, not a busy farmer). */
export const MESSAGE_BURST_LIMIT = 60;

/** Suggested first lines, by my side of the deal. */
export const QUICK_REPLIES = {
  buyer: ["Merhaba, hâlâ satılık mı?", "Son fiyat ne olur?", "Nerede görebilirim?", "Teslimat yapıyor musunuz?"],
  seller: ["Evet, hâlâ satılık.", "Hafta sonu gösterebilirim.", "Fiyatta pek pazarlık payı yok."],
};

// ---------------------------------------------------------------- Reports

export const REPORT_REASONS = [
  { id: "sahte", label: "Sahte ya da dolandırıcılık şüphesi" },
  { id: "yasakli", label: "Satışı yasak ürün (ruhsatsız ilaç, hayvan vb.)" },
  { id: "yaniltici", label: "Yanıltıcı fiyat, fotoğraf ya da bilgi" },
  { id: "uygunsuz", label: "Uygunsuz içerik" },
  { id: "diger", label: "Başka bir neden" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["id"];
export const isReportReason = (s: string): s is ReportReason => REPORT_REASONS.some((r) => r.id === s);
