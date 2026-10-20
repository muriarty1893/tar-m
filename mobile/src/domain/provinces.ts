import { fold } from './market';
import { trCompare } from './prices';

/** The 81 provinces and their centres, from the website (data/provinces.ts), for the weather. */
export type Province = { name: string; lat: number; lon: number };

export const PROVINCES: Province[] = [
  { name: 'Adana', lat: 37.0, lon: 35.32 },
  { name: 'Adıyaman', lat: 37.76, lon: 38.28 },
  { name: 'Afyonkarahisar', lat: 38.76, lon: 30.54 },
  { name: 'Ağrı', lat: 39.72, lon: 43.05 },
  { name: 'Amasya', lat: 40.65, lon: 35.83 },
  { name: 'Ankara', lat: 39.93, lon: 32.86 },
  { name: 'Antalya', lat: 36.89, lon: 30.71 },
  { name: 'Artvin', lat: 41.18, lon: 41.82 },
  { name: 'Aydın', lat: 37.85, lon: 27.85 },
  { name: 'Balıkesir', lat: 39.65, lon: 27.88 },
  { name: 'Bilecik', lat: 40.14, lon: 29.98 },
  { name: 'Bingöl', lat: 38.88, lon: 40.5 },
  { name: 'Bitlis', lat: 38.4, lon: 42.11 },
  { name: 'Bolu', lat: 40.74, lon: 31.61 },
  { name: 'Burdur', lat: 37.72, lon: 30.29 },
  { name: 'Bursa', lat: 40.19, lon: 29.06 },
  { name: 'Çanakkale', lat: 40.15, lon: 26.41 },
  { name: 'Çankırı', lat: 40.6, lon: 33.62 },
  { name: 'Çorum', lat: 40.55, lon: 34.95 },
  { name: 'Denizli', lat: 37.78, lon: 29.09 },
  { name: 'Diyarbakır', lat: 37.91, lon: 40.24 },
  { name: 'Edirne', lat: 41.68, lon: 26.56 },
  { name: 'Elazığ', lat: 38.68, lon: 39.22 },
  { name: 'Erzincan', lat: 39.75, lon: 39.49 },
  { name: 'Erzurum', lat: 39.9, lon: 41.27 },
  { name: 'Eskişehir', lat: 39.78, lon: 30.52 },
  { name: 'Gaziantep', lat: 37.07, lon: 37.38 },
  { name: 'Giresun', lat: 40.91, lon: 38.39 },
  { name: 'Gümüşhane', lat: 40.46, lon: 39.48 },
  { name: 'Hakkari', lat: 37.58, lon: 43.74 },
  { name: 'Hatay', lat: 36.2, lon: 36.16 },
  { name: 'Isparta', lat: 37.76, lon: 30.55 },
  { name: 'Mersin', lat: 36.8, lon: 34.64 },
  { name: 'İstanbul', lat: 41.01, lon: 28.98 },
  { name: 'İzmir', lat: 38.42, lon: 27.14 },
  { name: 'Kars', lat: 40.6, lon: 43.1 },
  { name: 'Kastamonu', lat: 41.38, lon: 33.78 },
  { name: 'Kayseri', lat: 38.73, lon: 35.48 },
  { name: 'Kırklareli', lat: 41.73, lon: 27.22 },
  { name: 'Kırşehir', lat: 39.15, lon: 34.16 },
  { name: 'Kocaeli', lat: 40.77, lon: 29.92 },
  { name: 'Konya', lat: 37.87, lon: 32.48 },
  { name: 'Kütahya', lat: 39.42, lon: 29.98 },
  { name: 'Malatya', lat: 38.35, lon: 38.31 },
  { name: 'Manisa', lat: 38.61, lon: 27.43 },
  { name: 'Kahramanmaraş', lat: 37.58, lon: 36.94 },
  { name: 'Mardin', lat: 37.31, lon: 40.74 },
  { name: 'Muğla', lat: 37.22, lon: 28.36 },
  { name: 'Muş', lat: 38.75, lon: 41.49 },
  { name: 'Nevşehir', lat: 38.62, lon: 34.71 },
  { name: 'Niğde', lat: 37.97, lon: 34.68 },
  { name: 'Ordu', lat: 40.98, lon: 37.88 },
  { name: 'Rize', lat: 41.02, lon: 40.52 },
  { name: 'Sakarya', lat: 40.78, lon: 30.4 },
  { name: 'Samsun', lat: 41.29, lon: 36.33 },
  { name: 'Siirt', lat: 37.93, lon: 41.94 },
  { name: 'Sinop', lat: 42.03, lon: 35.15 },
  { name: 'Sivas', lat: 39.75, lon: 37.02 },
  { name: 'Tekirdağ', lat: 40.98, lon: 27.51 },
  { name: 'Tokat', lat: 40.31, lon: 36.55 },
  { name: 'Trabzon', lat: 41.0, lon: 39.72 },
  { name: 'Tunceli', lat: 39.11, lon: 39.55 },
  { name: 'Şanlıurfa', lat: 37.17, lon: 38.79 },
  { name: 'Uşak', lat: 38.68, lon: 29.41 },
  { name: 'Van', lat: 38.5, lon: 43.38 },
  { name: 'Yozgat', lat: 39.82, lon: 34.81 },
  { name: 'Zonguldak', lat: 41.45, lon: 31.79 },
  { name: 'Aksaray', lat: 38.37, lon: 34.03 },
  { name: 'Bayburt', lat: 40.26, lon: 40.23 },
  { name: 'Karaman', lat: 37.18, lon: 33.22 },
  { name: 'Kırıkkale', lat: 39.85, lon: 33.51 },
  { name: 'Batman', lat: 37.89, lon: 41.13 },
  { name: 'Şırnak', lat: 37.52, lon: 42.46 },
  { name: 'Bartın', lat: 41.64, lon: 32.34 },
  { name: 'Ardahan', lat: 41.11, lon: 42.7 },
  { name: 'Iğdır', lat: 39.92, lon: 44.04 },
  { name: 'Yalova', lat: 40.65, lon: 29.27 },
  { name: 'Karabük', lat: 41.2, lon: 32.62 },
  { name: 'Kilis', lat: 36.72, lon: 37.12 },
  { name: 'Osmaniye', lat: 37.07, lon: 36.25 },
  { name: 'Düzce', lat: 40.84, lon: 31.16 },
];

export const provinceByName = (name: string) => PROVINCES.find((p) => p.name === name);

/** The closest provincial centre; a flat-earth distance is plenty at this scale. */
export function nearestProvince(lat: number, lon: number): Province {
  const k = Math.cos((lat * Math.PI) / 180);
  let best = PROVINCES[0];
  let bestD = Infinity;
  for (const p of PROVINCES) {
    const d = (p.lat - lat) ** 2 + ((p.lon - lon) * k) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

/** For the province picker: matches ignore case and Turkish letters, names that start with the query come first. */
export function findProvinces(query: string): Province[] {
  const q = fold(query.trim());
  const sorted = [...PROVINCES].sort((a, b) => trCompare(a.name, b.name));
  if (!q) return sorted;
  const starts = sorted.filter((p) => fold(p.name).startsWith(q));
  const contains = sorted.filter((p) => !fold(p.name).startsWith(q) && fold(p.name).includes(q));
  return [...starts, ...contains];
}
