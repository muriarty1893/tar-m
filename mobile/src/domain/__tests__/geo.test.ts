import { areaM2, centerOf, donumOf, isDrawable, type LatLng } from '../geo';

// The website's test field: a square of about 100 m near Konya.
const LAT = 37.87;
const dLat = 100 / 111_320;
const dLng = 100 / (111_320 * Math.cos((LAT * Math.PI) / 180));
const square: LatLng[] = [
  [LAT, 32.48],
  [LAT, 32.48 + dLng],
  [LAT + dLat, 32.48 + dLng],
  [LAT + dLat, 32.48],
];

describe('field outlines (as the website measures them)', () => {
  test('a 100 m square is about 10 dönüm, in either direction', () => {
    expect(donumOf(areaM2(square))).toBeCloseTo(10, 0);
    expect(areaM2([...square].reverse())).toBeCloseTo(areaM2(square), 3);
  });

  test('three corners at least, and some area', () => {
    expect(isDrawable(square)).toBe(true);
    expect(isDrawable(square.slice(0, 2))).toBe(false);
    expect(isDrawable([square[0], square[1], square[0]])).toBe(false);
  });

  test('the centre is the middle of the box', () => {
    const [lat, lng] = centerOf(square);
    expect(lat).toBeCloseTo(LAT + dLat / 2, 6);
    expect(lng).toBeCloseTo(32.48 + dLng / 2, 6);
  });
});
