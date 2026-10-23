/**
 * The demo phone's "Pazar": farmers' listings (produce, seed, tools, equipment, vehicles), on sample data.
 * A copy of the mobile app's mobile/src/domain/market.ts with web photo paths (public/market) and the
 * demo's clock (lib/demo-clock.ts); keep the two in step.
 */
import { DEMO_START } from "@/lib/demo-clock";

export type CategoryId = "tumu" | "urun" | "tohum" | "alet" | "ekipman" | "arac";
export type ListingCategory = Exclude<CategoryId, "tumu">;
export type Condition = "sifir" | "ikinci-el";
export type ListingStatus = "sold" | "removed";
export type MarketView = "kesfet" | "favoriler" | "ilanlarim";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "tumu", label: "Tümü" },
  { id: "urun", label: "Ürün" },
  { id: "tohum", label: "Tohum & Gübre" },
  { id: "alet", label: "Alet" },
  { id: "ekipman", label: "Ekipman" },
  { id: "arac", label: "Araç" },
];

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? "";

export const CONDITIONS: { id: Condition; label: string }[] = [
  { id: "sifir", label: "Sıfır" },
  { id: "ikinci-el", label: "İkinci el" },
];

export const conditionLabel = (id?: Condition) => CONDITIONS.find((c) => c.id === id)?.label;

/** Produce and seed are sold by a unit; tools, equipment and vehicles by the piece. */
export const SOLD_BY_UNIT: ListingCategory[] = ["urun", "tohum"];
export const UNITS = ["kg", "ton", "kasa", "çuval", "balya", "metre", "adet"];

/** A photo's path under public/. */
export type Photo = string;

export const STOCK_PHOTOS: Record<ListingCategory, string> = {
  urun: "/market/ilan-bugday.webp",
  tohum: "/market/ilan-bugday-tohumu.webp",
  alet: "/market/ilan-el-aletleri.webp",
  ekipman: "/market/ilan-pulverizator.webp",
  arac: "/market/ilan-traktor.webp",
};

export type Seller = {
  id: string;
  name: string;
  place: string;
  rating: number;
  reviews: number;
  memberSince: number;
  /** "1 saat içinde" */
  replies: string;
  verified: boolean;
};

export const ME: Seller = { id: "me", name: "Ayşe Yılmaz", place: "Merkez, Konya", rating: 4.9, reviews: 7, memberSince: 2023, replies: "1 saat içinde", verified: true };

export const SELLERS: Seller[] = [
  ME,
  { id: "s-mehmet", name: "Mehmet Kaya", place: "Çumra, Konya", rating: 4.8, reviews: 31, memberSince: 2019, replies: "1 saat içinde", verified: true },
  { id: "s-ibrahim", name: "İbrahim Aydın", place: "Ereğli, Konya", rating: 4.6, reviews: 18, memberSince: 2020, replies: "birkaç saat içinde", verified: true },
  { id: "s-ali", name: "Ali Yıldız", place: "Kadınhanı, Konya", rating: 4.7, reviews: 12, memberSince: 2021, replies: "1 gün içinde", verified: false },
  { id: "s-mustafa", name: "Mustafa Çelik", place: "Karatay, Konya", rating: 4.9, reviews: 44, memberSince: 2018, replies: "1 saat içinde", verified: true },
  { id: "s-zeynep", name: "Zeynep Arslan", place: "Meram, Konya", rating: 5.0, reviews: 86, memberSince: 2017, replies: "30 dakika içinde", verified: true },
  { id: "s-hasan", name: "Hasan Demir", place: "Meram, Konya", rating: 4.5, reviews: 9, memberSince: 2022, replies: "birkaç saat içinde", verified: false },
  { id: "s-emine", name: "Emine Koç", place: "Cihanbeyli, Konya", rating: 4.8, reviews: 23, memberSince: 2020, replies: "1 saat içinde", verified: true },
  { id: "s-fatma", name: "Fatma Şahin", place: "Kumluca, Antalya", rating: 4.9, reviews: 57, memberSince: 2019, replies: "30 dakika içinde", verified: true },
  { id: "s-osman", name: "Osman Kurt", place: "Merkez, Aksaray", rating: 4.4, reviews: 6, memberSince: 2024, replies: "1 gün içinde", verified: false },
  { id: "s-huseyin", name: "Hüseyin Öztürk", place: "Ereğli, Konya", rating: 4.7, reviews: 14, memberSince: 2021, replies: "birkaç saat içinde", verified: true },
];

export const sellerById = (id: string) => SELLERS.find((s) => s.id === id);

export type Listing = {
  id: string;
  title: string;
  category: ListingCategory;
  condition?: Condition;
  price: number;
  /** Price per this unit ("ton"); none for things sold by the piece. */
  unit?: string;
  /** "25 ton" */
  quantity?: string;
  negotiable: boolean;
  location: string;
  /** Distance from the farmer (Konya). */
  km?: number;
  /** ISO timestamp */
  postedAt: string;
  sellerId: string;
  photos: Photo[];
  /** The photo is the category's stock picture, not the item itself. */
  stockPhoto?: boolean;
  description: string;
  specs: [label: string, value: string][];
};

const hoursAgo = (h: number) => new Date(DEMO_START.getTime() - h * 3_600_000).toISOString();
const photo = {
  traktor: "/market/ilan-traktor.webp",
  bicerdover: "/market/ilan-bicerdover.webp",
  romork: "/market/ilan-romork.webp",
  pulverizator: "/market/ilan-pulverizator.webp",
  mibzer: "/market/ilan-mibzer.webp",
  damla: "/market/ilan-damla-sulama.webp",
  sirt: "/market/ilan-sirt-pompasi.webp",
  tirpan: "/market/ilan-motorlu-tirpan.webp",
  budama: "/market/ilan-el-aletleri.webp",
  bugday: "/market/ilan-bugday.webp",
  nohut: "/market/ilan-nohut.webp",
  domates: "/market/ilan-domates.webp",
  balya: "/market/ilan-saman-balya.webp",
  bugdayTohumu: "/market/ilan-bugday-tohumu.webp",
  aycicegiTohumu: "/market/ilan-aycicegi-tohumu.webp",
};

/** The sample listings, newest first. */
export const LISTINGS: Listing[] = [
  {
    id: "l-bugday", title: "Ekmeklik buğday, 25 ton", category: "urun", price: 11200, unit: "ton", quantity: "25 ton", negotiable: true,
    location: "Çumra, Konya", km: 45, postedAt: hoursAgo(3), sellerId: "s-mehmet", photos: [photo.bugday],
    description: "Bu yılın hasadı, Bezostaja çeşidi. Hektolitre ağırlığı 79, protein %12,8. Ambarda, çuvalsız dökme. Tamamını alana fiyatta yardımcı olurum.",
    specs: [["Çeşit", "Bezostaja"], ["Protein", "%12,8"], ["Hektolitre", "79 kg"], ["Teslim", "Ambarda, dökme"]],
  },
  {
    id: "l-traktor", title: "Massey Ferguson 3085 traktör, 1994", category: "arac", condition: "ikinci-el", price: 685000, negotiable: true,
    location: "Ereğli, Konya", km: 148, postedAt: hoursAgo(9), sellerId: "s-ibrahim", photos: [photo.traktor],
    description: "Motor yapılı, lastikler %70. Kabin camları sağlam, hidrolik sorunsuz. Ruhsatı ve muayenesi var, takas düşünmüyorum.",
    specs: [["Marka", "Massey Ferguson"], ["Model yılı", "1994"], ["Motor gücü", "85 HP"], ["Çalışma saati", "9.400 sa"], ["Çekiş", "4x4"]],
  },
  {
    id: "l-sirt-pompasi", title: "Sırt pompası 16 lt, az kullanılmış", category: "alet", condition: "ikinci-el", price: 1400, negotiable: false,
    location: "Merkez, Konya", km: 0, postedAt: hoursAgo(20), sellerId: ME.id, photos: [photo.sirt],
    description: "Bir sezon kullanıldı, contaları yeni. Yedek meme seti ve kayışı ile birlikte.",
    specs: [["Hacim", "16 lt"], ["Tip", "Manuel, pistonlu"], ["Durum", "Bir sezon kullanıldı"]],
  },
  {
    id: "l-domates", title: "Sofralık domates, 18 kg kasa", category: "urun", price: 220, unit: "kasa", quantity: "300 kasa", negotiable: true,
    location: "Kumluca, Antalya", km: 320, postedAt: hoursAgo(26), sellerId: "s-fatma", photos: [photo.domates],
    description: "Seradan günlük kesim, kalibre 5-6. 50 kasa üstü alımlarda indirim yapılır. Soğuk zincirle sevk edebiliriz.",
    specs: [["Kasa", "18 kg"], ["Kalibre", "5-6"], ["Üretim", "Sera"]],
  },
  {
    id: "l-pulverizator", title: "Asılır tip pulverizatör, 600 lt, 12 m bom", category: "ekipman", condition: "ikinci-el", price: 38500, negotiable: true,
    location: "Sarayönü, Konya", km: 50, postedAt: hoursAgo(30), sellerId: "s-ali", photos: [photo.pulverizator],
    description: "Pompası revizyonlu, memeleri bu sezon değişti. Kardan mili dahil.",
    specs: [["Depo", "600 lt"], ["Bom genişliği", "12 m"], ["Pompa", "100 lt/dk"]],
  },
  {
    id: "l-bugday-tohumu", title: "Sertifikalı makarnalık buğday tohumu (Kunduru)", category: "tohum", condition: "sifir", price: 24, unit: "kg", quantity: "10 ton", negotiable: false,
    location: "Selçuklu, Konya", km: 5, postedAt: hoursAgo(40), sellerId: "s-zeynep", photos: [photo.bugdayTohumu],
    description: "Sertifikalı, ilaçlı, 50 kg çuvallarda. Fatura kesilir; tohum desteği için belge verilir.",
    specs: [["Çeşit", "Kunduru"], ["Sınıf", "Sertifikalı"], ["Ambalaj", "50 kg çuval"]],
  },
  {
    id: "l-mibzer", title: "Pnömatik mibzer, 6 sıra", category: "ekipman", condition: "ikinci-el", price: 165000, negotiable: true,
    location: "Karatay, Konya", km: 8, postedAt: hoursAgo(52), sellerId: "s-mustafa", photos: [photo.mibzer],
    description: "Mısır, ayçiçeği ve pancar diskleri ile. İki sezon kullanıldı, depoda bekledi.",
    specs: [["Sıra sayısı", "6"], ["Sıra arası", "70 cm"], ["Diskler", "Mısır, ayçiçeği, pancar"]],
  },
  {
    id: "l-nohut", title: "Koçbaşı nohut, 6 ton", category: "urun", price: 58, unit: "kg", quantity: "6 ton", negotiable: true,
    location: "Cihanbeyli, Konya", km: 98, postedAt: hoursAgo(60), sellerId: "s-emine", photos: [photo.nohut],
    description: "Elenmiş, 9 mm üstü. Çuvallı teslim, nakliye alıcıya aittir.",
    specs: [["Kalibre", "9 mm üstü"], ["Teslim", "Çuvallı"]],
  },
  {
    id: "l-damla-sulama", title: "Damla sulama borusu 16 mm, 2.000 m", category: "ekipman", condition: "sifir", price: 4.5, unit: "metre", quantity: "2.000 metre", negotiable: false,
    location: "Meram, Konya", km: 6, postedAt: hoursAgo(74), sellerId: "s-zeynep", photos: [photo.damla],
    description: "33 cm damlatıcı aralığı, 2 lt/sa. Rulo halinde, kutusunda. Bağlantı parçaları da mevcut.",
    specs: [["Çap", "16 mm"], ["Damlatıcı aralığı", "33 cm"], ["Debi", "2 lt/sa"]],
  },
  {
    id: "l-motorlu-tirpan", title: "Benzinli motorlu tırpan", category: "alet", condition: "ikinci-el", price: 6200, negotiable: true,
    location: "Meram, Konya", km: 7, postedAt: hoursAgo(90), sellerId: "s-hasan", photos: [photo.tirpan],
    description: "2 zamanlı, 52 cc. Misinalı kafa ve üç dişli bıçak ile. Tek elden.",
    specs: [["Motor", "52 cc, 2 zamanlı"], ["Aparat", "Misina + bıçak"]],
  },
  {
    id: "l-saman-balya", title: "Rulo saman balyası", category: "urun", price: 950, unit: "balya", quantity: "120 balya", negotiable: true,
    location: "Merkez, Aksaray", km: 145, postedAt: hoursAgo(110), sellerId: "s-osman", photos: [photo.balya],
    description: "Buğday samanı, yağmur görmedi. Balya başı yaklaşık 250 kg. Yükleme bizden.",
    specs: [["Tür", "Buğday samanı"], ["Ağırlık", "~250 kg"], ["Yükleme", "Satıcıdan"]],
  },
  {
    id: "l-romork", title: "Damperli tarım römorku, 5 ton", category: "arac", condition: "ikinci-el", price: 92000, negotiable: true,
    location: "Kadınhanı, Konya", km: 62, postedAt: hoursAgo(130), sellerId: "s-ali", photos: [photo.romork],
    description: "Çift dingil, hidrolik damper. Kasa sacı sağlam, lastikler iyi durumda.",
    specs: [["Kapasite", "5 ton"], ["Dingil", "Çift"], ["Damper", "Hidrolik"]],
  },
  {
    id: "l-aycicegi-tohumu", title: "Hibrit yağlık ayçiçeği tohumu", category: "tohum", condition: "sifir", price: 4800, unit: "çuval", quantity: "40 çuval", negotiable: false,
    location: "Ereğli, Konya", km: 148, postedAt: hoursAgo(160), sellerId: "s-ibrahim", photos: [photo.aycicegiTohumu],
    description: "Çuval 150.000 tane (yaklaşık 1 dekar 25). Herbisite dayanıklı, faturalı.",
    specs: [["Ambalaj", "150.000 tane"], ["Özellik", "Herbisite dayanıklı"]],
  },
  {
    id: "l-budama", title: "Budama ve aşı aletleri takımı (11 parça)", category: "alet", condition: "sifir", price: 1850, negotiable: false,
    location: "Selçuklu, Konya", km: 5, postedAt: hoursAgo(190), sellerId: "s-zeynep", photos: [photo.budama],
    description: "Çantasıyla birlikte; budama makası, aşı bıçağı, testere ve pense. Kutusu açılmadı.",
    specs: [["Parça", "11"], ["Çanta", "Var"]],
  },
  {
    id: "l-bicerdover", title: "John Deere biçerdöver, 6,1 m tabla", category: "arac", condition: "ikinci-el", price: 3250000, negotiable: true,
    location: "Çumra, Konya", km: 45, postedAt: hoursAgo(230), sellerId: "s-mehmet", photos: [photo.bicerdover],
    description: "2008 model, 4.200 tambur saati. Her sezon bakımlı; ayçiçeği tablası ayrıca satılık.",
    specs: [["Model yılı", "2008"], ["Tabla", "6,1 m"], ["Tambur saati", "4.200 sa"]],
  },
];

export function listingById(id: string, own: Listing[]) {
  return own.find((l) => l.id === id) ?? LISTINGS.find((l) => l.id === id);
}

/** For search: lower case, Turkish letters to plain ones ("Traktör" → "traktor"). */
export function fold(s: string) {
  const plain: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
  return s
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase()
    .replace(/[çğıöşüâîû]/g, (c) => plain[c]);
}

export type MarketFilter = {
  query: string;
  category: CategoryId;
  view: MarketView;
  favorites: string[];
  status: Record<string, ListingStatus>;
};

/**
 * What Pazar shows: Keşfet is everyone else's live listings, Favoriler the hearted ones, İlanlarım mine (sold too).
 * Search looks at the title, description, place, category and specs.
 */
export function filterListings(listings: Listing[], f: MarketFilter) {
  const q = fold(f.query.trim());
  return listings.filter((l) => {
    const status = f.status[l.id];
    if (status === "removed") return false;
    if (f.view === "ilanlarim") {
      if (l.sellerId !== ME.id) return false;
    } else {
      if (status === "sold") return false;
      if (f.view === "kesfet" && l.sellerId === ME.id) return false;
      if (f.view === "favoriler" && !f.favorites.includes(l.id)) return false;
    }
    if (f.category !== "tumu" && l.category !== f.category) return false;
    return !q || fold(`${l.title} ${l.description} ${l.location} ${categoryLabel(l.category)} ${l.specs.flat().join(" ")}`).includes(q);
  });
}

function groupThousands(int: string) {
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** "520.000 ₺": whole liras, or two decimals when there are kuruş. */
export function formatPrice(n: number) {
  if (Number.isInteger(n)) return `${groupThousands(String(n))} ₺`;
  const [int, dec] = n.toFixed(2).split(".");
  return `${groupThousands(int)},${dec} ₺`;
}

/** "520.000 ₺", "11.200 ₺ / ton" */
export const priceLabel = (l: Pick<Listing, "price" | "unit">) => (l.unit ? `${formatPrice(l.price)} / ${l.unit}` : formatPrice(l.price));

/** Reads "145.000", "145000", "4,5", "1.250,75" (Turkish style); NaN if it isn't a number. */
export function parsePrice(s: string) {
  let t = s.replace(/[\s₺]/g, "").replace(/tl$/i, "");
  if (!t) return NaN;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}

export type ListingDraft = {
  title: string;
  category: ListingCategory | null;
  condition: Condition | null;
  price: string;
  unit: string;
  quantity: string;
  location: string;
  description: string;
  negotiable: boolean;
  photos: string[];
};

export type DraftField = keyof ListingDraft;
export const DESCRIPTION_MAX = 500;

/** The form's checks, as messages under each field. */
export function validateDraft(d: ListingDraft): Partial<Record<DraftField, string>> {
  const e: Partial<Record<DraftField, string>> = {};
  const title = d.title.trim();
  if (title.length < 5) e.title = "Başlık en az 5 karakter olmalı.";
  else if (title.length > 70) e.title = "Başlık en fazla 70 karakter olabilir.";
  if (!d.category) e.category = "Bir kategori seçin.";
  const price = parsePrice(d.price);
  if (!(price > 0)) e.price = "Geçerli bir fiyat girin (ör. 145.000).";
  else if (price > 100_000_000) e.price = "Fiyat çok yüksek görünüyor.";
  if (d.category && SOLD_BY_UNIT.includes(d.category) && !d.unit) e.unit = "Fiyatın birimini seçin.";
  if (!d.location.trim()) e.location = "İlçe ve il yazın.";
  if (d.description.length > DESCRIPTION_MAX) e.description = `Açıklama en fazla ${DESCRIPTION_MAX} karakter olabilir.`;
  return e;
}

/** A new listing of mine from a valid draft. */
export function listingFromDraft(d: ListingDraft, id: string, now: Date): Listing {
  const category = d.category ?? "ekipman";
  const byUnit = SOLD_BY_UNIT.includes(category);
  return {
    id,
    title: d.title.trim(),
    category,
    condition: category === "urun" ? undefined : (d.condition ?? undefined),
    price: parsePrice(d.price),
    unit: byUnit ? d.unit : undefined,
    quantity: byUnit && d.quantity.trim() ? `${d.quantity.trim()} ${d.unit}` : undefined,
    negotiable: d.negotiable,
    location: d.location.trim(),
    km: 0,
    postedAt: now.toISOString(),
    sellerId: ME.id,
    photos: d.photos.length ? d.photos : [STOCK_PHOTOS[category]],
    stockPhoto: !d.photos.length,
    description: d.description.trim(),
    specs: [],
  };
}
