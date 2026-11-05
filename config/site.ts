export type NavItem = { label: string; href: string };

export const siteConfig = {
  name: "Çiftçi Destek",
  tagline: "Çiftçinin Akıllı Rehberi",
  description:
    "Çiftçi Destek, çiftçiler için Türkçe dijital tarım rehberi: çiftçi forumu, çiftçi pazarı ve mesajlaşma, hava durumu, tarım takvimi, tarla ve masraf takibi.",
  contactEmail: "iletisim@bereketai.com",
  ctaLabel: "Ücretsiz hesap açın",
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
    { label: "İş Birliği", href: "/is-birligi" },
    { label: "SSS", href: "/sss" },
  ] satisfies NavItem[],
};

export type SiteConfig = typeof siteConfig;
