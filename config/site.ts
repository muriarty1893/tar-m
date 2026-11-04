export type NavItem = { label: string; href: string };

export const siteConfig = {
  name: "Çiftçi Destek",
  tagline: "Çiftçinin Akıllı Rehberi",
  description:
    "Çiftçi Destek, çiftçiler için Türkçe dijital tarım rehberi: çiftçi pazarı ve mesajlaşma, hava durumu, tarım takvimi, tarla ve masraf takibi. Fotoğraftan yapay zekâ ile hastalık tespiti yakında mobil uygulamada.",
  contactEmail: "iletisim@bereketai.com",
  /** Footer maker credit. */
  creator: { name: "Murat Eker", url: "https://murateker.com.tr" },
  ctaLabel: "Erken erişim için kaydol",
  /** The header's main menu: the tools that work on the website today. */
  nav: [
    { label: "Pazar", href: "/pazar" },
    { label: "Fiyatlar", href: "/fiyatlar" },
    { label: "Hava Durumu", href: "/hava" },
    { label: "Takvim", href: "/takvim" },
    { label: "Tarlalarım", href: "/tarlalarim" },
    { label: "Haberler", href: "/haberler" },
    { label: "Forum", href: "/forum" },
  ] satisfies NavItem[],
  /** The rest, in the phone menu and the footer. */
  moreNav: [
    { label: "Nasıl Çalışır", href: "/#nasil-calisir" },
    { label: "Demo", href: "/#demo" },
    { label: "İş Birliği", href: "/is-birligi" },
    { label: "SSS", href: "/sss" },
  ] satisfies NavItem[],
};

export type SiteConfig = typeof siteConfig;
