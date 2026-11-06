/**
 * Sample content for the design previews (/tasarimlar): the same home page in every design, filled
 * with realistic posts (the live database holds only test posts). Temporary, with the previews.
 */
export type SampleTopic = {
  title: string;
  section: string;
  sectionId: SectionId;
  author: string;
  initials: string;
  ago: string;
  replies: number;
  likes: number;
  views: number;
  photo?: string;
  /** r10-style prefix ("SORU:", "SATIŞ:"). */
  tag?: { label: string; tone: "green" | "red" | "blue" | "orange" };
  excerpt: string;
  lastBy: string;
};

export type SectionId = "bitki" | "hayvan" | "makine" | "destek" | "pazar" | "genel";

export const USER = { name: "Ayşe Yılmaz", initials: "AY", first: "Ayşe" };
export const BADGES = { notifications: 3, messages: 1 };
export const SPONSOR = { name: "sukocu.com", tagline: "Yakıtsız, elektriksiz su pompası" };
export const WEATHER = { place: "Konya", temp: 18, sky: "Güneşli", hint: "İlaçlamaya uygun", min: 7, max: 19, rain: 5, wind: 8 };
export const MARKET = {
  count: 128,
  today: 6,
  newest: { title: "Buğday tohumu (Bezostaja)", price: "11.200 ₺", unit: "ton", place: "Çumra, Konya", photo: "/market/ilan-bugday-tohumu.webp" },
};

export const SECTIONS: { id: SectionId; name: string; topics: number; replies: number; subs: string[] }[] = [
  { id: "bitki", name: "Bitkisel üretim", topics: 342, replies: 2871, subs: ["Buğday ve arpa", "Mısır", "Sebze", "Meyve bahçeleri", "Sulama"] },
  { id: "hayvan", name: "Hayvancılık", topics: 218, replies: 1650, subs: ["Büyükbaş", "Küçükbaş", "Arıcılık", "Kanatlı"] },
  { id: "makine", name: "Makine ve ekipman", topics: 156, replies: 1204, subs: ["Traktör", "Ekim makineleri", "Bakım ve arıza"] },
  { id: "destek", name: "Destek ve teşvik", topics: 97, replies: 640, subs: ["Hibe ve krediler", "Başvurular"] },
  { id: "pazar", name: "Fiyat ve pazar", topics: 124, replies: 988, subs: ["Borsa fiyatları", "Satış deneyimleri"] },
  { id: "genel", name: "Genel", topics: 63, replies: 410, subs: [] },
];

export const TOPICS: SampleTopic[] = [
  { title: "Buğdayda sarı pas başladı, hangi ilacı önerirsiniz?", section: "Bitkisel üretim", sectionId: "bitki", author: "Mehmet Kaya", initials: "MK", ago: "12 dk önce", replies: 12, likes: 9, views: 340, photo: "/demo/bugday-sari-pas.webp", tag: { label: "SORU", tone: "blue" }, excerpt: "Yapraklarda sarı çizgiler var, geçen hafta yağmurdan sonra başladı. Fungisit olarak ne kullandınız?", lastBy: "Hasan D." },
  { title: "Süt ineğinde verim düştü, yem karışımı önerisi", section: "Hayvancılık", sectionId: "hayvan", author: "Ayşe Yılmaz", initials: "AY", ago: "1 saat önce", replies: 8, likes: 4, views: 210, excerpt: "Günde 22 litreden 17 litreye indi. Silaj ve kesif yemi nasıl oranlıyorsunuz?", lastBy: "Murat Ö." },
  { title: "Mibzer ayarı: dekara kaç kilo tohum atıyorsunuz?", section: "Makine ve ekipman", sectionId: "makine", author: "Hasan Demir", initials: "HD", ago: "2 saat önce", replies: 21, likes: 15, views: 612, photo: "/market/ilan-mibzer.webp", excerpt: "Pnömatik mibzerle arpa ekeceğim, Orta Anadolu için dekara 18 kg az mı?", lastBy: "Ali Ç." },
  { title: "2026 mazot ve gübre desteği başvuruları başladı mı?", section: "Destek ve teşvik", sectionId: "destek", author: "Fatma Arslan", initials: "FA", ago: "3 saat önce", replies: 5, likes: 11, views: 890, tag: { label: "DUYURU", tone: "orange" }, excerpt: "ÇKS güncellemesi için son tarih ne zaman, bilen var mı?", lastBy: "Kemal A." },
  { title: "Konya'da arpa bu hafta tonu kaçtan alınıyor?", section: "Fiyat ve pazar", sectionId: "pazar", author: "Ali Çelik", initials: "AÇ", ago: "Dün", replies: 17, likes: 6, views: 1204, excerpt: "Tüccar 9.400 dedi, borsada 9.800 görünüyor. Siz kaça verdiniz?", lastBy: "Emine Ş." },
  { title: "Damla sulamada filtre tıkanması nasıl önlenir?", section: "Bitkisel üretim", sectionId: "bitki", author: "Emine Şahin", initials: "EŞ", ago: "Dün", replies: 9, likes: 7, views: 455, photo: "/market/ilan-damla-sulama.webp", excerpt: "Kuyu suyu kireçli, her hafta filtre temizliyorum. Asit uygulaması işe yarar mı?", lastBy: "Mehmet K." },
  { title: "Kışlatma öncesi kovan kontrolünde nelere bakıyorsunuz?", section: "Hayvancılık", sectionId: "hayvan", author: "Murat Öz", initials: "MÖ", ago: "2 gün önce", replies: 6, likes: 5, views: 301, excerpt: "Bal stoku ve varroa için kontrol listem var, eksik bir şey var mı?", lastBy: "Ayşe Y." },
  { title: "Satılık: 2015 model 75 beygir traktör, bakımlı", section: "Fiyat ve pazar", sectionId: "pazar", author: "Kemal Aydın", initials: "KA", ago: "3 gün önce", replies: 3, likes: 2, views: 980, photo: "/market/ilan-traktor.webp", tag: { label: "SATIŞ", tone: "green" }, excerpt: "Tek sahibinden, 4200 saatte. Fiyat ve fotoğraflar Pazar'daki ilanda.", lastBy: "Ali Ç." },
];

/** Sample farmer news and support announcements ("Çiftçi destekleri & haberler"). */
export const NEWS: { kind: "Destek" | "Haber" | "Duyuru"; title: string }[] = [
  { kind: "Destek", title: "Mazot ve gübre desteği ödemeleri hesaplara yatıyor" },
  { kind: "Duyuru", title: "ÇKS kayıt güncellemesi için son gün 31 Aralık" },
  { kind: "Haber", title: "Konya Ovası’nda buğday ekimi yüzde 80’i geçti" },
  { kind: "Destek", title: "Genç çiftçi hibesi başvuruları açıldı" },
  { kind: "Haber", title: "Arpa fiyatları borsada haftaya yükselişle başladı" },
];

/** Sample crop prices (₺/kg) for the price-led designs; the change is the day's, in per cent. */
export const PRICES: { name: string; price: string; change: number; week: number[] }[] = [
  { name: "Buğday", price: "12,35", change: 1.2, week: [11.9, 12.0, 11.95, 12.1, 12.05, 12.2, 12.35] },
  { name: "Arpa", price: "9,80", change: 0.6, week: [9.6, 9.7, 9.65, 9.7, 9.75, 9.74, 9.8] },
  { name: "Mısır", price: "10,90", change: -0.8, week: [11.2, 11.1, 11.15, 11.0, 11.05, 10.99, 10.9] },
  { name: "Ayçiçeği", price: "24,50", change: 2.1, week: [23.6, 23.8, 23.7, 23.9, 24.0, 24.0, 24.5] },
  { name: "Nohut", price: "38,00", change: -1.4, week: [38.9, 38.8, 38.6, 38.7, 38.5, 38.54, 38.0] },
  { name: "Mercimek", price: "31,20", change: 0, week: [31.1, 31.2, 31.15, 31.2, 31.25, 31.2, 31.2] },
];

/** A sample five-day forecast for the weather-led designs. */
export const FORECAST: { day: string; sky: "sun" | "cloudSun" | "cloud" | "rain"; max: number; min: number }[] = [
  { day: "Bugün", sky: "sun", max: 19, min: 7 },
  { day: "Cum", sky: "cloudSun", max: 17, min: 6 },
  { day: "Cmt", sky: "rain", max: 13, min: 5 },
  { day: "Paz", sky: "cloud", max: 14, min: 4 },
  { day: "Pzt", sky: "sun", max: 16, min: 5 },
];

export const NAV = ["Ana sayfa", "Pazar", "Takvim & Hava", "Hızlı menü"] as const;
