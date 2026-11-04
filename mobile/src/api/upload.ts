import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { api } from './client';

/** Long side of an uploaded photo, as the website shrinks them (lib/shrink-image.ts). */
const MAX_SIDE = 1600;

/**
 * Shrinks a picked photo to at most 1600 px (JPEG) and uploads it to the website, which keeps it in
 * Vercel Blob. Returns its address. `folder`: "ilanlar" (listing photos) or "haberler" (news covers, admins).
 */
export async function uploadPhoto(photo: { uri: string; width?: number; height?: number }, folder: 'ilanlar' | 'haberler'): Promise<string> {
  const context = ImageManipulator.manipulate(photo.uri);
  const { width = MAX_SIDE + 1, height = MAX_SIDE + 1 } = photo;
  if (Math.max(width, height) > MAX_SIDE) context.resize(width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.78 });
  const data = await (await fetch(saved.uri)).blob();
  const { url } = await api<{ url: string }>(`/foto?klasor=${folder}`, { method: 'POST', raw: { data, type: 'image/jpeg' } });
  return url;
}
