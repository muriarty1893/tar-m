/**
 * Pazar: the categories, units, prices and the listing form's checks. The listings themselves live on
 * the website (its API); these rules are the website's (lib/market.ts, data/demo-market.ts), so the
 * form here refuses exactly what the server would. Change both together.
 */
import { PROVINCES } from './provinces';
import { fold } from './text';

export type CategoryId = 'tumu' | 'urun' | 'tohum' | 'alet' | 'ekipman' | 'arac';
export type ListingCategory = Exclude<CategoryId, 'tumu'>;
export type Condition = 'sifir' | 'ikinci-el';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'tumu', label: 'Tümü' },
  { id: 'urun', label: 'Ürün' },
  { id: 'tohum', label: 'Tohum & Gübre' },
  { id: 'alet', label: 'Alet' },
  { id: 'ekipman', label: 'Ekipman' },
  { id: 'arac', label: 'Araç' },
];

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? '';

export const CONDITIONS: { id: Condition; label: string }[] = [
  { id: 'sifir', label: 'Sıfır' },
  { id: 'ikinci-el', label: 'İkinci el' },
];

export const conditionLabel = (id?: Condition | null) => CONDITIONS.find((c) => c.id === id)?.label;

/** Produce and seed are sold by a unit; tools, equipment and vehicles by the piece. */
export const SOLD_BY_UNIT: ListingCategory[] = ['urun', 'tohum'];
export const UNITS = ['kg', 'ton', 'kasa', 'çuval', 'balya', 'metre', 'adet'];

const LISTING_CATEGORIES = CATEGORIES.map((c) => c.id).filter((id): id is ListingCategory => id !== 'tumu');
export const isListingCategory = (s: string): s is ListingCategory => (LISTING_CATEGORIES as string[]).includes(s);
export const soldByUnit = (category: string) => isListingCategory(category) && SOLD_BY_UNIT.includes(category);
/** Produce has no "Sıfır / İkinci el". */
export const hasCondition = (category: string) => isListingCategory(category) && category !== 'urun';
export const isProvince = (s: string) => PROVINCES.some((p) => p.name === s);

/** Each category's photo, shown (marked "Temsilî görsel") on listings posted without one. */
export const STOCK_PHOTOS: Record<ListingCategory, number> = {
  urun: require('@/assets/images/market/ilan-bugday.webp'),
  tohum: require('@/assets/images/market/ilan-bugday-tohumu.webp'),
  alet: require('@/assets/images/market/ilan-el-aletleri.webp'),
  ekipman: require('@/assets/images/market/ilan-pulverizator.webp'),
  arac: require('@/assets/images/market/ilan-traktor.webp'),
};

/** A listing's picture: its photo, or the bundled stock photo for its category. */
export const listingImage = (l: { photo: string; stockPhoto: boolean; category: ListingCategory }) => (l.stockPhoto ? STOCK_PHOTOS[l.category] : { uri: l.photo });

export { fold };

function groupThousands(int: string) {
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** "520.000 ₺": whole liras, or two decimals when there are kuruş. */
export function formatPrice(n: number) {
  if (Number.isInteger(n)) return `${groupThousands(String(n))} ₺`;
  const [int, dec] = n.toFixed(2).split('.');
  return `${groupThousands(int)},${dec} ₺`;
}

/** "520.000 ₺", "11.200 ₺ / ton" */
export const priceLabel = (l: { price: number; unit?: string | null }) => (l.unit ? `${formatPrice(l.price)} / ${l.unit}` : formatPrice(l.price));

/** "Çumra, Konya" or "Konya" */
export const placeLabel = (province: string, district?: string | null) => (district ? `${district}, ${province}` : province);

/** A price as the form shows it: "145.000", "4,5". */
export const priceInput = (n: number) => formatPrice(n).replace(' ₺', '');

/** Reads "145.000", "145000", "4,5", "1.250,75" (Turkish style); NaN if it isn't a number. */
export function parsePrice(s: string) {
  let t = s.replace(/[\s₺]/g, '').replace(/tl$/i, '');
  if (!t) return NaN;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}

export const TITLE_MIN = 5;
export const TITLE_MAX = 70;
export const DESCRIPTION_MAX = 1000;
export const MAX_PHOTOS = 5;
export const PRICE_MAX = 100_000_000;

/** The listing form's values (as the website's form sends them). */
export type ListingDraft = {
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
  /** Uploaded photos' addresses. */
  photos: string[];
};

export type DraftField = keyof ListingDraft;

export const EMPTY_DRAFT: ListingDraft = { title: '', category: '', condition: '', price: '', unit: '', quantity: '', negotiable: false, province: '', district: '', description: '', photos: [] };

/** The form's checks, as messages under each field: the website's validateListing, word for word. */
export function validateDraft(d: ListingDraft): Partial<Record<DraftField, string>> {
  const e: Partial<Record<DraftField, string>> = {};
  const title = d.title.trim();
  if (title.length < TITLE_MIN) e.title = `Başlık en az ${TITLE_MIN} karakter olmalı.`;
  else if (title.length > TITLE_MAX) e.title = `Başlık en fazla ${TITLE_MAX} karakter olabilir.`;
  if (!isListingCategory(d.category)) e.category = 'Bir kategori seçin.';
  if (hasCondition(d.category) && !CONDITIONS.some((c) => c.id === d.condition)) e.condition = 'Sıfır mı ikinci el mi, seçin.';
  const price = parsePrice(d.price);
  if (!(price > 0)) e.price = 'Geçerli bir fiyat girin (ör. 145.000).';
  else if (price > PRICE_MAX) e.price = 'Fiyat çok yüksek görünüyor.';
  if (soldByUnit(d.category) && !UNITS.includes(d.unit)) e.unit = 'Fiyatın birimini seçin.';
  if (d.quantity.trim().length > 30) e.quantity = 'Miktar en fazla 30 karakter olabilir.';
  if (!isProvince(d.province)) e.province = 'İli seçin.';
  if (d.district.trim().length > 40) e.district = 'İlçe en fazla 40 karakter olabilir.';
  if (d.description.length > DESCRIPTION_MAX) e.description = `Açıklama en fazla ${DESCRIPTION_MAX} karakter olabilir.`;
  if (d.photos.length > MAX_PHOTOS) e.photos = `En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsiniz.`;
  return e;
}

export const SORTS = [
  { id: 'yeni', label: 'En yeni' },
  { id: 'ucuz', label: 'En düşük fiyat' },
  { id: 'pahali', label: 'En yüksek fiyat' },
] as const;

export const REPORT_REASONS = [
  { id: 'sahte', label: 'Sahte ya da dolandırıcılık şüphesi' },
  { id: 'yasakli', label: 'Satışı yasak ürün (ruhsatsız ilaç, hayvan vb.)' },
  { id: 'yaniltici', label: 'Yanıltıcı fiyat, fotoğraf ya da bilgi' },
  { id: 'uygunsuz', label: 'Uygunsuz içerik' },
  { id: 'diger', label: 'Başka bir neden' },
] as const;
