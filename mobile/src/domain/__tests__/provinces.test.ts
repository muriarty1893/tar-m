import { PROVINCES, findProvinces, nearestProvince, provinceByName } from '../provinces';

describe('provinces', () => {
  test('all 81, with unique names and coordinates inside Turkey', () => {
    expect(PROVINCES).toHaveLength(81);
    expect(new Set(PROVINCES.map((p) => p.name)).size).toBe(81);
    for (const p of PROVINCES) {
      expect(p.lat).toBeGreaterThan(35.5);
      expect(p.lat).toBeLessThan(42.2);
      expect(p.lon).toBeGreaterThan(25.5);
      expect(p.lon).toBeLessThan(45);
    }
  });

  test('the nearest provincial centre to a position', () => {
    expect(nearestProvince(37.9, 32.5).name).toBe('Konya');
    expect(nearestProvince(41.05, 29.0).name).toBe('İstanbul');
  });

  test('search ignores case and Turkish letters, and lists in Turkish order', () => {
    expect(findProvinces('istanbul')[0].name).toBe('İstanbul');
    expect(findProvinces('ISPARTA')[0].name).toBe('Isparta');
    expect(findProvinces('sanliurfa')[0].name).toBe('Şanlıurfa');
    expect(findProvinces('igdir')[0].name).toBe('Iğdır');
    expect(findProvinces('')).toHaveLength(81);
    expect(findProvinces('').slice(0, 3).map((p) => p.name)).toEqual(['Adana', 'Adıyaman', 'Afyonkarahisar']);
    expect(findProvinces('zzz')).toEqual([]);
  });

  test('looked up by name', () => {
    expect(provinceByName('Konya')).toMatchObject({ lat: 37.87, lon: 32.48 });
    expect(provinceByName('Atlantis')).toBeUndefined();
  });
});
