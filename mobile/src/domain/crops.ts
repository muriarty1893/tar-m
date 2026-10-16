export type CropId = 'bugday' | 'domates' | 'misir' | 'aycicegi' | 'zeytin' | 'arpa';

/** `image` is a bundled image (require). */
export type Crop = { id: CropId; name: string; image: number };

export const CROPS: Crop[] = [
  { id: 'bugday', name: 'Buğday', image: require('@/assets/images/app/susehri-wheat.webp') },
  { id: 'domates', name: 'Domates', image: require('@/assets/images/app/domates-mildiyo.webp') },
  { id: 'misir', name: 'Mısır', image: require('@/assets/images/app/misir-kuraklik.webp') },
  { id: 'aycicegi', name: 'Ayçiçeği', image: require('@/assets/images/app/aycicegi-tarlasi.webp') },
  { id: 'zeytin', name: 'Zeytin', image: require('@/assets/images/app/field-horizon.webp') },
  { id: 'arpa', name: 'Arpa', image: require('@/assets/images/app/wheat-field.jpg') },
];

export const cropById = (id: CropId) => CROPS.find((c) => c.id === id)!;
