import {
  BellIcon,
  CalendarDotsIcon,
  ChartLineUpIcon,
  ChatsCircleIcon,
  ChatsTeardropIcon,
  CloudSunIcon,
  HeartIcon,
  MegaphoneIcon,
  NewspaperIcon,
  NotePencilIcon,
  StorefrontIcon,
  TractorIcon,
} from "@phosphor-icons/react/dist/ssr";

/** Tile colours, as the demo phone's "Hızlı Menü Kısayolları": a tinted tile with a solid icon badge. */
export const TILE = {
  emerald: "bg-emerald-50 border-emerald-200 [--solid:#047857]",
  sky: "bg-sky-50 border-sky-200 [--solid:#0369a1]",
  indigo: "bg-indigo-50 border-indigo-200 [--solid:#4338ca]",
  amber: "bg-amber-50 border-amber-200 [--solid:#b45309]",
  teal: "bg-teal-50 border-teal-200 [--solid:#0f766e]",
  purple: "bg-purple-50 border-purple-200 [--solid:#7e22ce]",
  rose: "bg-rose-50 border-rose-200 [--solid:#be123c]",
  orange: "bg-orange-50 border-orange-200 [--solid:#c2410c]",
} as const;

export type QuickItem = { href: string; label: string; Icon: typeof BellIcon; tone: keyof typeof TILE; signedIn?: boolean };

/** Hızlı menü: everything the three tabs don't cover. */
export const QUICK_ITEMS: QuickItem[] = [
  { href: "/forum", label: "Forum", Icon: ChatsTeardropIcon, tone: "emerald" },
  { href: "/forum/yeni", label: "Konu aç", Icon: NotePencilIcon, tone: "teal" },
  { href: "/pazar/ilan-ver", label: "İlan ver", Icon: MegaphoneIcon, tone: "orange" },
  { href: "/fiyatlar", label: "Fiyatlar", Icon: ChartLineUpIcon, tone: "purple" },
  { href: "/hava", label: "Hava durumu", Icon: CloudSunIcon, tone: "sky" },
  { href: "/takvim", label: "Tarım takvimi", Icon: CalendarDotsIcon, tone: "indigo" },
  { href: "/tarlalarim", label: "Tarlalarım", Icon: TractorIcon, tone: "amber" },
  { href: "/haberler", label: "Haberler", Icon: NewspaperIcon, tone: "rose" },
  { href: "/mesajlar", label: "Mesajlar", Icon: ChatsCircleIcon, tone: "emerald", signedIn: true },
  { href: "/bildirimler", label: "Bildirimler", Icon: BellIcon, tone: "amber", signedIn: true },
  { href: "/pazar?gorunum=favoriler", label: "Favorilerim", Icon: HeartIcon, tone: "rose", signedIn: true },
  { href: "/pazar?gorunum=ilanlarim", label: "İlanlarım", Icon: StorefrontIcon, tone: "teal", signedIn: true },
];

/** The site's other pages, as plain links under the tiles. */
export const QUICK_LINKS = [
  { href: "/is-birligi", label: "Reklam ve iş birliği" },
  { href: "/sss", label: "Sıkça sorulan sorular" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/pazar/kurallar", label: "Pazar kuralları" },
  { href: "/gizlilik", label: "Gizlilik ve KVKK" },
  { href: "/kaynaklar", label: "Görsel kaynakları" },
];

/** Pages reached from the Hızlı menü: its tab shows as current on them. */
export const QUICK_PATHS = ["/fiyatlar", "/tarlalarim", "/haberler", "/is-birligi", "/sss", "/hakkimizda", "/gizlilik", "/kaynaklar", "/yonetim", "/hesabim"];
