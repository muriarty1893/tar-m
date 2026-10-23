/**
 * The home screen's two ad spaces: a sponsor banner and an "advertise here" box. Both carry sample
 * content until real sponsors sign up; `sample` makes the banner say so.
 *
 * Showing ads makes the app commercial, and Open-Meteo's free plan is for non-commercial use only:
 * before real ads go live, the weather needs a paid Open-Meteo plan (or another provider).
 */
export type Sponsor = { name: string; tagline: string; sample: boolean };

export const SPONSOR: Sponsor = { name: 'sukocu.com', tagline: 'Yakıtsız, elektriksiz su pompası', sample: true };

/** What the ad spaces explain when tapped, while there is no sponsor page or contact link yet. */
export const AD_INFO = {
  sponsor: {
    title: 'Örnek sponsor alanı',
    text: 'Bu alan, Çiftçi Destek’e sponsor olan firmaların tanıtımı içindir. Şu an örnek bir içerik gösteriliyor.',
  },
  advertise: {
    title: 'Reklam vermek ister misiniz?',
    text: 'Çiftçi Destek’te ürününüzü binlerce çiftçiye tanıtabilirsiniz. Reklam ve sponsorluk için iletişim bilgileri yakında burada olacak.',
  },
} as const;
