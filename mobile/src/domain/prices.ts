import { fold } from './market';

/**
 * "Tarım Borsası Fiyatları": sample prices per kilo, like the website demo's. The first four are
 * the demo's home-screen cards. `line` is the last six weeks for the sparkline, in SVG y units
 * (0-16, smaller is higher).
 */
export type PriceGroup = 'tahil' | 'baklagil' | 'yagli' | 'meyve' | 'sanayi';
export type PriceGroupId = PriceGroup | 'tumu';

export const PRICE_GROUPS: { id: PriceGroupId; label: string }[] = [
  { id: 'tumu', label: 'Tümü' },
  { id: 'tahil', label: 'Tahıl' },
  { id: 'baklagil', label: 'Baklagil' },
  { id: 'yagli', label: 'Yağlı tohum' },
  { id: 'meyve', label: 'Meyve & sebze' },
  { id: 'sanayi', label: 'Sanayi bitkisi' },
];

export type CropPrice = { name: string; group: PriceGroup; price: number; change: number; line: number[]; exchange: string };

export const PRICES: CropPrice[] = [
  { name: 'Buğday', group: 'tahil', price: 9.85, change: 2.1, line: [14, 12, 13, 8, 9, 3], exchange: 'Konya Ticaret Borsası' },
  { name: 'Fındık', group: 'meyve', price: 165, change: 3.1, line: [13, 11, 12, 7, 6, 2], exchange: 'Giresun Ticaret Borsası' },
  { name: 'Mısır', group: 'tahil', price: 8.4, change: -0.8, line: [4, 6, 5, 9, 8, 12], exchange: 'Adana Ticaret Borsası' },
  { name: 'Pamuk', group: 'sanayi', price: 31.2, change: 0.6, line: [10, 11, 8, 9, 6, 6], exchange: 'Şanlıurfa Ticaret Borsası' },
  { name: 'Arpa', group: 'tahil', price: 8.6, change: 1.2, line: [12, 12, 10, 11, 8, 7], exchange: 'Konya Ticaret Borsası' },
  { name: 'Çeltik', group: 'tahil', price: 17.5, change: 0.4, line: [9, 10, 9, 8, 8, 7], exchange: 'Edirne Ticaret Borsası' },
  { name: 'Nohut', group: 'baklagil', price: 38, change: -1.5, line: [5, 4, 7, 8, 10, 12], exchange: 'Konya Ticaret Borsası' },
  { name: 'Kırmızı mercimek', group: 'baklagil', price: 32.5, change: 0.9, line: [11, 10, 11, 9, 8, 7], exchange: 'Gaziantep Ticaret Borsası' },
  { name: 'Kuru fasulye', group: 'baklagil', price: 72, change: 2.4, line: [14, 13, 11, 10, 6, 4], exchange: 'Niğde Ticaret Borsası' },
  { name: 'Ayçiçeği', group: 'yagli', price: 21.4, change: 1.8, line: [13, 12, 10, 10, 7, 5], exchange: 'Edirne Ticaret Borsası' },
  { name: 'Kanola', group: 'yagli', price: 20.1, change: -0.6, line: [6, 7, 6, 8, 9, 10], exchange: 'Tekirdağ Ticaret Borsası' },
  { name: 'Domates', group: 'meyve', price: 18.5, change: -4.2, line: [2, 4, 6, 9, 12, 14], exchange: 'Antalya Hali' },
  { name: 'Patates', group: 'meyve', price: 12.3, change: 1.1, line: [11, 12, 10, 9, 9, 7], exchange: 'Niğde Ticaret Borsası' },
  { name: 'Şeker pancarı', group: 'sanayi', price: 3.1, change: 0, line: [8, 8, 9, 8, 8, 8], exchange: 'Konya Şeker' },
];

/** Turkish alphabetical order (ç after c, ı before i, and so on). */
const ALPHABET = 'abcçdefgğhıijklmnoöprsştuüvyz';
const letterRank = (c: string) => {
  const i = ALPHABET.indexOf(c);
  return i < 0 ? ALPHABET.length + c.charCodeAt(0) : i;
};
const trLower = (s: string) => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

export function trCompare(a: string, b: string) {
  const x = trLower(a);
  const y = trLower(b);
  for (let i = 0; i < Math.min(x.length, y.length); i++) {
    const d = letterRank(x[i]) - letterRank(y[i]);
    if (d) return d;
  }
  return x.length - y.length;
}

export type PriceSort = 'az' | 'degisim';
export type PriceFilter = { group: PriceGroupId; query: string; sort: PriceSort };

/** The list on the prices screen: one group, a search over the crop and its exchange, then sorted. */
export function filterPrices(prices: CropPrice[], f: PriceFilter) {
  const q = fold(f.query.trim());
  return prices
    .filter((p) => (f.group === 'tumu' || p.group === f.group) && (!q || fold(`${p.name} ${p.exchange}`).includes(q)))
    .sort((a, b) => (f.sort === 'az' ? trCompare(a.name, b.name) : Math.abs(b.change) - Math.abs(a.change) || trCompare(a.name, b.name)));
}

/** The weekly change in words, for screen readers: "geçen haftaya göre yüzde 2,1 arttı". */
export function trendLabel(change: number) {
  if (change === 0) return 'geçen haftaya göre değişmedi';
  const size = Math.abs(change).toFixed(1).replace('.', ',');
  return `geçen haftaya göre yüzde ${size} ${change > 0 ? 'arttı' : 'düştü'}`;
}
