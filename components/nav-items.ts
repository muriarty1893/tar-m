import {
  CalendarBlankIcon,
  ChartLineUpIcon,
  CloudSunIcon,
  DeviceMobileIcon,
  HandshakeIcon,
  ListNumbersIcon,
  NewspaperIcon,
  PlantIcon,
  QuestionIcon,
  StorefrontIcon,
} from "@phosphor-icons/react/dist/ssr";

/** Icon and one-line hint per nav link, for the mobile menu (keyed by href from siteConfig.nav and moreNav). */
export const navExtras: Record<string, { icon: typeof QuestionIcon; hint: string }> = {
  "/pazar": { icon: StorefrontIcon, hint: "Ürün, alet ve araç ilanları" },
  "/fiyatlar": { icon: ChartLineUpIcon, hint: "Ürünlerin borsa fiyatları" },
  "/hava": { icon: CloudSunIcon, hint: "İlinizin hava durumu ve uyarılar" },
  "/takvim": { icon: CalendarBlankIcon, hint: "Tarla işlerinizi planlayın" },
  "/tarlalarim": { icon: PlantIcon, hint: "Tarlalarınız ve masraflarınız" },
  "/haberler": { icon: NewspaperIcon, hint: "Tarım haberleri ve duyurular" },
  "/#nasil-calisir": { icon: ListNumbersIcon, hint: "Uygulama 3 adımda nasıl çalışacak" },
  "/#demo": { icon: DeviceMobileIcon, hint: "Uygulamayı telefonda deneyin" },
  "/is-birligi": { icon: HandshakeIcon, hint: "Kooperatif ve kurumlar için" },
  "/sss": { icon: QuestionIcon, hint: "Sıkça sorulan sorular" },
};
