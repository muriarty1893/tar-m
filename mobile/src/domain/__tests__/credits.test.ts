import { readdirSync } from 'fs';
import { join } from 'path';

import { OTHER_CREDITS, PHOTO_CREDITS } from '../credits';

const IMAGES = join(__dirname, '../../../assets/images');
const photosIn = (dir: string) =>
  readdirSync(join(IMAGES, dir))
    .filter((f) => f.endsWith('.webp'))
    .map((f) => `${dir}/${f}`);

describe('image credits (Görsel kaynakları)', () => {
  test('every photo the app ships is credited', () => {
    const credited = PHOTO_CREDITS.map((c) => c.file);
    for (const file of [...photosIn('app'), ...photosIn('market')]) expect(credited).toContain(file);
  });

  test('no credit points at a photo that is gone', () => {
    const shipped = [...photosIn('app'), ...photosIn('market')];
    for (const c of PHOTO_CREDITS) expect(shipped).toContain(c.file);
  });

  test('every licence other than public domain links to its text, and every photo to its source', () => {
    for (const c of PHOTO_CREDITS) {
      expect(c.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      if (c.license !== 'Kamu malı') expect(c.licenseUrl).toMatch(/^https:\/\/creativecommons\.org\//);
    }
  });

  test('the components, icons and fonts are credited too', () => {
    const names = OTHER_CREDITS.map((c) => c.name).join(' ');
    for (const n of ['SpringCheck', 'NumberTicker', 'Phosphor', 'DM Sans', 'Space Grotesk']) expect(names).toContain(n);
  });
});
