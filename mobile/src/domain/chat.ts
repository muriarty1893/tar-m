/** Mesajlar: listing chats, offers and the other side's scripted replies (no server). */

import { fold, formatPrice, type Listing } from './market';

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered';
export type Offer = { amount: number; status: OfferStatus };

export type Message = {
  id: string;
  from: 'me' | 'them';
  /** ISO timestamp */
  at: string;
  text?: string;
  offer?: Offer;
};

export type Conversation = {
  id: string;
  listingId: string;
  /** The other person (a seller id from market.ts). */
  peerId: string;
  /** My side: buying their listing, or selling mine. */
  role: 'buyer' | 'seller';
  messages: Message[];
  /** When I last opened it (ISO); '' = never. */
  readAt: string;
  /** My last move, still waiting for their answer. */
  pending?: { kind: 'text'; text: string } | { kind: 'offer'; messageId: string } | { kind: 'accepted' } | { kind: 'declined' };
};

/** Suggested first lines, by my side of the deal. */
export const QUICK_REPLIES = {
  buyer: ['Hâlâ satılık mı?', 'Son fiyat ne olur?', 'Nerede görebilirim?', 'Teslimat yapıyor musunuz?'],
  seller: ['Evet, hâlâ satılık.', 'Fiyatta pek pazarlık payı yok.', 'Hafta sonu gösterebilirim.'],
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

export type OfferVerdict = { kind: 'accept' } | { kind: 'reject' } | { kind: 'counter'; amount: number };

/** How a seller takes an offer: 92 % or more is a deal, under 60 % a no, otherwise they meet halfway. */
export function evaluateOffer(price: number, amount: number): OfferVerdict {
  if (amount >= price * 0.92) return { kind: 'accept' };
  if (amount < price * 0.6) return { kind: 'reject' };
  const step = priceStep(price);
  const counter = Math.round((amount + price) / 2 / step) * step;
  return { kind: 'counter', amount: Math.min(price, Math.max(counter, amount + step)) };
}

/** Whether the text mentions any of the words, ignoring case and Turkish letters ("satilik" finds "Satılık"). */
const has = (text: string, ...words: string[]) => {
  const t = fold(text);
  return words.some((w) => t.includes(fold(w)));
};

/** The other person's answer to my message. `responder` is their side: the seller, or a buyer of my listing. */
export function replyText(listing: Listing, text: string, responder: 'seller' | 'buyer') {
  if (responder === 'buyer') {
    if (has(text, 'satılık', 'duruyor', 'mevcut')) return 'Süper. Yarın öğleden sonra gelsem uygun olur mu?';
    if (has(text, 'fiyat', 'pazarlık', 'indirim')) return `${formatPrice(Math.round((listing.price * 0.9) / priceStep(listing.price)) * priceStep(listing.price))} olursa hemen alırım.`;
    if (has(text, 'nerede', 'konum', 'adres', 'göster')) return 'Konumu atarsanız navigasyonla gelirim.';
    if (has(text, 'tamam', 'olur', 'uygun', 'evet')) return 'Tamamdır, görüşmek üzere. Teşekkürler!';
    return 'Anladım, teşekkürler. Akşam tekrar yazarım.';
  }
  if (has(text, 'satılık', 'duruyor', 'mevcut', 'satıldı')) return 'Evet, hâlâ satılık. Görmek isterseniz haber verin.';
  if (has(text, 'fiyat', 'pazarlık', 'indirim', 'son ', 'kaç')) {
    return listing.negotiable ? 'Biraz pazarlık payı var; teklifinizi yazın, değerlendireyim.' : 'Fiyat sabit, kusura bakmayın. Ürün fiyatını hak ediyor.';
  }
  if (has(text, 'nerede', 'konum', 'adres', 'gör', 'bak')) return `${listing.location} tarafındayım. Hafta içi akşamları, hafta sonu her saat gösterebilirim.`;
  if (has(text, 'teslim', 'kargo', 'nakliye', 'getir', 'sevk')) {
    return listing.category === 'arac' || listing.category === 'ekipman'
      ? 'Nakliyeyi alıcı ayarlıyor; yüklemede yardımcı olurum.'
      : 'İl içinde toplu alımda teslim ediyorum, uzak yerlere nakliyeci ayarlayabiliriz.';
  }
  if (has(text, 'fotoğraf', 'resim', 'video')) return 'Yarın gün ışığında birkaç fotoğraf daha çekip atarım.';
  if (has(text, 'teşekkür', 'sağ ol', 'sağol', 'tamam')) return 'Rica ederim, kolay gelsin.';
  return 'Mesajınızı aldım; tarladan dönünce detaylı yazarım.';
}

/** The seller's answer to my offer: what happens to my offer, and what they send back. */
export function offerReply(listing: Listing, amount: number): { status: OfferStatus; reply: Pick<Message, 'text' | 'offer'> } {
  const v = evaluateOffer(listing.price, amount);
  if (v.kind === 'accept') return { status: 'accepted', reply: { text: `Anlaştık! ${listing.location} tarafındayım; ne zaman gelirsiniz?` } };
  if (v.kind === 'reject') return { status: 'rejected', reply: { text: 'Kusura bakmayın, bu fiyata veremem. Biraz daha yaklaşırsanız konuşabiliriz.' } };
  return { status: 'countered', reply: { offer: { amount: v.amount, status: 'pending' } } };
}

/** After I accept their counter-offer. */
export const acceptedReply = (listing: Listing) => `Çok iyi, anlaştık. ${listing.location} için konum atıyorum; gelmeden önce arayın.`;

/** After I turn down their counter-offer. */
export const declinedReply = 'Peki, siz bilirsiniz. Fikriniz değişirse yazın.';

/** The inbox's sample chats: a counter-offer on a tractor, a buyer for my pump (unread), a reply about tomatoes (unread). */
export function seedConversations(now: Date): Conversation[] {
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();
  const day = 24 * 60;
  return [
    {
      id: 'c-sirt-pompasi', listingId: 'l-sirt-pompasi', peerId: 's-huseyin', role: 'seller', readAt: '',
      messages: [
        { id: 'm-1', from: 'them', at: ago(125), text: 'Selam, pompa hâlâ duruyor mu?' },
        { id: 'm-2', from: 'them', at: ago(124), text: 'Yarın Ereğli’den Konya’ya geleceğim, uğrayabilirim.' },
      ],
    },
    {
      id: 'c-domates', listingId: 'l-domates', peerId: 's-fatma', role: 'buyer', readAt: ago(18 * 60 - 1),
      messages: [
        { id: 'm-1', from: 'me', at: ago(18 * 60), text: 'Merhaba, toptan alımda kasa fiyatı düşer mi?' },
        { id: 'm-2', from: 'them', at: ago(80), text: 'Merhaba! 50 kasa üstü alırsanız kasası 200 ₺ olur.' },
      ],
    },
    {
      id: 'c-traktor', listingId: 'l-traktor', peerId: 's-ibrahim', role: 'buyer', readAt: ago(2 * day - 60),
      messages: [
        { id: 'm-1', from: 'me', at: ago(2 * day), text: 'Merhaba, traktör hâlâ satılık mı?' },
        { id: 'm-2', from: 'them', at: ago(2 * day - 20), text: 'Evet satılık. Motor yapılı, gelip bakabilirsiniz.' },
        { id: 'm-3', from: 'me', at: ago(2 * day - 30), offer: { amount: 600000, status: 'countered' } },
        { id: 'm-4', from: 'them', at: ago(2 * day - 55), offer: { amount: 645000, status: 'pending' } },
      ],
    },
  ];
}

/** Their messages since I last opened the chat. */
export function unreadCount(c: Conversation) {
  return c.messages.filter((m) => m.from === 'them' && m.at > c.readAt).length;
}

export const lastAt = (c: Conversation) => c.messages[c.messages.length - 1]?.at ?? '';

/** The inbox preview: "Siz: …" for mine; offers as amounts. */
export function lastLine(c: Conversation) {
  const m = c.messages[c.messages.length - 1];
  if (!m) return '';
  if (m.offer) {
    const amount = formatPrice(m.offer.amount);
    if (m.from === 'me') return `Siz: Teklif ${amount}`;
    return `${c.role === 'buyer' ? 'Karşı teklif' : 'Teklif'}: ${amount}`;
  }
  return m.from === 'me' ? `Siz: ${m.text}` : (m.text ?? '');
}
