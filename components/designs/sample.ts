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

export const NAV = ["Ana sayfa", "Pazar", "Takvim & Hava", "Hızlı menü"] as const;
