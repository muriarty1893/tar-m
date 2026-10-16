import type { CropId } from './crops';

export type MarketPrice = { crop: CropId; unit: string; price: number; changePct: number; week: number[] };

/** Sample Konya market prices (₺/kg) with the last seven days for a small trend line. */
export const PRICES: MarketPrice[] = [
  { crop: 'bugday', unit: 'kg', price: 11.4, changePct: 2.1, week: [10.9, 11.0, 11.0, 11.1, 11.2, 11.17, 11.4] },
  { crop: 'domates', unit: 'kg', price: 18.75, changePct: -4.3, week: [21.2, 20.6, 20.1, 19.8, 19.9, 19.6, 18.75] },
  { crop: 'misir', unit: 'kg', price: 9.85, changePct: 0.8, week: [9.6, 9.7, 9.7, 9.75, 9.8, 9.77, 9.85] },
  { crop: 'aycicegi', unit: 'kg', price: 24.1, changePct: 0, week: [24.0, 24.2, 24.1, 24.1, 24.0, 24.1, 24.1] },
  { crop: 'zeytin', unit: 'kg', price: 62.5, changePct: 1.4, week: [60.8, 61.0, 61.4, 61.7, 61.9, 61.6, 62.5] },
  { crop: 'arpa', unit: 'kg', price: 9.2, changePct: -0.6, week: [9.3, 9.3, 9.28, 9.25, 9.26, 9.25, 9.2] },
];
