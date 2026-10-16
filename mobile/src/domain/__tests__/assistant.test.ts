import { reply } from '../assistant';

describe('assistant reply', () => {
  test('yellowing leaves points to nitrogen and offers a scan', () => {
    const r = reply('Domateslerin yaprakları sararıyor, ne yapayım?');
    expect(r.text).toMatch(/azot/i);
    expect(r.action).toBe('scan');
  });

  test('matches regardless of Turkish capital İ / I', () => {
    expect(reply('İLAÇLAMA ne zaman yapılır?').action).toBe('weather');
  });

  test('price questions go to market prices', () => {
    expect(reply('Buğday fiyatı bugün kaç lira?').action).toBe('prices');
  });

  test('unknown questions get a polite fallback that suggests scanning', () => {
    const r = reply('merhaba');
    expect(r.text.length).toBeGreaterThan(20);
    expect(r.action).toBe('scan');
  });
});
