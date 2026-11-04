/** Mesajlar: the chats live on the website; these are the offer rules and words the screens share (the website's lib/market.ts). */
import type { OfferStatus } from '@/api/types';

/** Suggested first lines, by my side of the deal. */
export const QUICK_REPLIES = {
  buyer: ['Merhaba, hâlâ satılık mı?', 'Son fiyat ne olur?', 'Nerede görebilirim?', 'Teslimat yapıyor musunuz?'],
  seller: ['Evet, hâlâ satılık.', 'Hafta sonu gösterebilirim.', 'Fiyatta pek pazarlık payı yok.'],
};

/** The rounding step for a price: 5.000 ₺ for a tractor, 10 ₺ for a crate of tomatoes. */
export function priceStep(price: number) {
  if (price >= 100_000) return 5000;
  if (price >= 10_000) return 500;
  if (price >= 1000) return 50;
  if (price >= 100) return 10;
  if (price >= 10) return 1;
  return 0.5;
}

/** An offer's state, from the sender's side and from the side answering it. */
export const OFFER_STATUS: Record<OfferStatus, { mine: string; theirs: string }> = {
  pending: { mine: 'Yanıt bekleniyor', theirs: 'Yanıtınızı bekliyor' },
  accepted: { mine: 'Kabul edildi', theirs: 'Kabul ettiniz' },
  rejected: { mine: 'Kabul edilmedi', theirs: 'Reddettiniz' },
  countered: { mine: 'Karşı teklif geldi', theirs: 'Karşı teklif verdiniz' },
  withdrawn: { mine: 'Yerine yeni teklif verdiniz', theirs: 'Yerine yeni teklif geldi' },
};
