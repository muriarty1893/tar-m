import { sampleById } from '@/domain/diagnosis';

/** A scan's photo: a bundled sample by id, or a file the camera or gallery produced. */
export function scanPhotoSource(photo: string): number | { uri: string } {
  return sampleById(photo)?.image ?? { uri: photo };
}
