export type NavItem = { label: string; href: string };

export const siteConfig = {
  name: "Bereket AI",
  tagline: "Çiftçinin Akıllı Rehberi",
  description:
    "Bereket AI, çiftçilerin tarlalarının fotoğrafını göndererek hastalık tespiti, verim tahmini ve tarım önerileri alabildiği Türkçe yapay zekâ destekli mobil uygulamadır.",
  contactEmail: "iletisim@bereketai.com",
  /** Footer maker credit. */
  creator: { name: "Murat Eker", url: "https://murateker.com.tr" },
  ctaLabel: "Erken erişim için kaydol",
  nav: [
    { label: "Nasıl Çalışır", href: "/#nasil-calisir" },
    { label: "Demo", href: "/#demo" },
    { label: "Hava Durumu", href: "/hava" },
    { label: "Haberler", href: "/haberler" },
    { label: "İş Birliği", href: "/is-birligi" },
    { label: "SSS", href: "/sss" },
  ] satisfies NavItem[],
};

export type SiteConfig = typeof siteConfig;
