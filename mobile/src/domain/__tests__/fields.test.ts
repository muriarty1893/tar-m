import { EMPTY_FIELD, cropPhoto, donumLabel, expensesByKind, seasonSummary, tonsLabel, validateExpense, validateField } from '../fields';

describe('fields (the website’s checks)', () => {
  test('a name and an area are required', () => {
    expect(Object.keys(validateField(EMPTY_FIELD)).sort()).toEqual(['area', 'name']);
    expect(validateField({ ...EMPTY_FIELD, name: 'Buğday tarlası', area: '45,5' })).toEqual({});
    expect(validateField({ ...EMPTY_FIELD, name: 'B', area: '0' })).toMatchObject({ name: expect.any(String), area: expect.any(String) });
    expect(validateField({ ...EMPTY_FIELD, name: 'Buğday', area: '4', province: 'Mars' }).province).toBeDefined();
  });

  test('expenses: a kind, an amount, no future dates', () => {
    expect(validateExpense({ kind: 'gubre', amount: '12.500', date: '2026-11-03', note: '' }, '2026-11-03')).toEqual({});
    expect(validateExpense({ kind: 'gubre', amount: '12.500', date: '2026-11-04', note: '' }, '2026-11-03').date).toBeDefined();
    expect(validateExpense({ kind: 'uzay', amount: '0', date: '', note: '' }, '2026-11-03')).toMatchObject({ kind: expect.any(String), amount: expect.any(String), date: expect.any(String) });
  });

  test('totals by kind, largest first; the season adds up', () => {
    expect(expensesByKind([{ kind: 'gubre', amount: 100 }, { kind: 'mazot', amount: 300 }, { kind: 'gubre', amount: 250 }])).toEqual([
      { kind: 'gubre', amount: 350 },
      { kind: 'mazot', amount: 300 },
    ]);
    expect(seasonSummary([{ areaDonum: 45, expenses: 1000, expectedYieldKg: 18000 }, { areaDonum: 3, expenses: 50, expectedYieldKg: null }])).toEqual({ areaDonum: 48, expenses: 1050, yieldKg: 18000 });
  });

  test('labels and a picture by crop', () => {
    expect(tonsLabel(18000)).toBe('18 ton');
    expect(tonsLabel(7500)).toBe('7,5 ton');
    expect(donumLabel(12.4)).toBe('12,4 dönüm');
    expect(cropPhoto('Dane MISIR')).toBe(cropPhoto('mısır'));
    expect(cropPhoto('Mısır')).not.toBe(cropPhoto('Ayçiçeği'));
  });
});
