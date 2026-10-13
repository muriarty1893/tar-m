import { CloudSunIcon, DeviceMobileIcon, HandshakeIcon, ListNumbersIcon, NewspaperIcon, QuestionIcon } from "@phosphor-icons/react/dist/ssr";

/** Icon and one-line hint per nav link, for the mobile menu (keyed by href from siteConfig.nav). */
export const navExtras: Record<string, { icon: typeof QuestionIcon; hint: string }> = {
  "/#nasil-calisir": { icon: ListNumbersIcon, hint: "3 adımda fotoğraftan öneriye" },
  "/#demo": { icon: DeviceMobileIcon, hint: "Uygulamayı telefonda deneyin" },
  "/hava": { icon: CloudSunIcon, hint: "İlinizin hava durumu ve uyarılar" },
  "/haberler": { icon: NewspaperIcon, hint: "Tarım haberleri ve duyurular" },
  "/is-birligi": { icon: HandshakeIcon, hint: "Kooperatif ve kurumlar için" },
  "/sss": { icon: QuestionIcon, hint: "Sıkça sorulan sorular" },
};
