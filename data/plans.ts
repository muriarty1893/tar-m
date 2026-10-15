/** The plans shown in the home page's "Planlar" section (components/Pricing.tsx). */
export type Plan = {
  name: string;
  /** Monthly price in lira, or null for a quote ("Size özel"). */
  price: number | null;
  audience: string;
  features: string[];
  popular?: boolean;
};

export const PLANS: Plan[] = [
  {
    name: "Bireysel",
    price: 149,
    audience: "tek çiftçi için",
    features: [
      "Fotoğrafla hastalık ve zararlı tespiti",
      "İlinize özel hava durumu ve don uyarıları",
      "Tarım takvimi ve hatırlatmalar",
      "E-posta desteği",
    ],
  },
  {
    name: "Profesyonel",
    price: 399,
    audience: "büyük işletmeler ve aile çiftlikleri için",
    features: ["Bireysel'deki her şey", "Sınırsız tarla ve tarama", "Verim tahmini ve gübreleme önerileri", "Öncelikli destek"],
    popular: true,
  },
  {
    name: "Kurumsal",
    price: null,
    audience: "Kooperatifler, ziraat odaları ve şirketler · üye başına",
    features: [
      "Profesyonel'deki her şey",
      "Üye başına toplu lisans + üye yönetimi",
      "Hacim indirimi: çok üye, düşük birim fiyat",
      "Bölgesel raporlar + öncelikli destek",
    ],
  },
];
