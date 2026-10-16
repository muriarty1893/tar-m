import type { CropId } from './crops';

export type Field = {
  id: string;
  name: string;
  crop: CropId;
  areaDonum: number;
  /** Days from today: sown this long ago, harvest this far ahead. */
  sownDaysAgo: number;
  harvestInDays: number;
  health: number;
  /** A bundled image (require). */
  image: number;
};

export const SAMPLE_FIELDS: Field[] = [
  { id: 'kuzey', name: 'Kuzey Tarlası', crop: 'bugday', areaDonum: 24, sownDaysAgo: 4, harvestInDays: 241, health: 0.92, image: require('@/assets/images/app/susehri-wheat.webp') },
  { id: 'domates', name: 'Domates bahçesi', crop: 'domates', areaDonum: 6, sownDaysAgo: 96, harvestInDays: 12, health: 0.64, image: require('@/assets/images/app/domates-mildiyo.webp') },
  { id: 'aycicegi', name: 'Ayçiçeği tarlası', crop: 'aycicegi', areaDonum: 18, sownDaysAgo: 150, harvestInDays: 5, health: 0.88, image: require('@/assets/images/app/aycicegi-tarlasi.webp') },
];
