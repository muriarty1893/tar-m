// The plans from the website's "Planlar" section (data/plans.ts), shown on the profile screen.

export const YEARLY_DISCOUNT = 0.2;
export const yearlyMonthlyPrice = (price: number) => Math.round(price * (1 - YEARLY_DISCOUNT));

export type Plan = { name: string; price: number | null; audience: string; features: string[]; popular?: boolean };

export const PLANS: Plan[] = [
  {
    name: 'Bireysel',
    price: 149,
    audience: 'tek çiftçi için',
    features: ['Fotoğrafla hastalık ve zararlı tespiti', 'İlinize özel hava durumu ve don uyarıları', 'Tarım takvimi ve hatırlatmalar'],
  },
  {
    name: 'Profesyonel',
    price: 399,
    audience: 'büyük işletmeler ve aile çiftlikleri için',
    features: ["Bireysel'deki her şey", 'Sınırsız tarla ve tarama', 'Verim tahmini ve gübreleme önerileri'],
    popular: true,
  },
  {
    name: 'Kurumsal',
    price: null,
    audience: 'kooperatifler ve ziraat odaları için',
    features: ["Profesyonel'deki her şey", 'Üye başına toplu lisans', 'Bölgesel raporlar'],
  },
];
