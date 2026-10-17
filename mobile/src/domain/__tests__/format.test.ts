import { dayKey, dayTitle, formatPercent, formatTL, fromYear, monthGrid, relativeDayLabel, shortDate, timeRange } from '../format';

describe('Turkish formatting', () => {
  test('dayTitle names the day and month in Turkish', () => {
    expect(dayTitle(new Date(2026, 9, 16))).toBe('16 Ekim, Cuma');
    expect(dayTitle(new Date(2026, 0, 4))).toBe('4 Ocak, Pazar');
  });

  test('shortDate uses the three-letter month', () => {
    expect(shortDate(new Date(2026, 9, 2))).toBe('2 Eki');
    expect(shortDate(new Date(2026, 8, 21))).toBe('21 Eyl');
  });

  test('formatTL uses a decimal comma and two decimals', () => {
    expect(formatTL(11.4)).toBe('11,40 ₺');
    expect(formatTL(1250)).toBe('1.250,00 ₺');
  });

  test('formatPercent puts % first, as Turkish does', () => {
    expect(formatPercent(2.1)).toBe('%2,1');
    expect(formatPercent(-4.3)).toBe('%4,3');
    expect(formatPercent(0)).toBe('%0,0');
  });

  test('timeRange pads hours', () => {
    expect(timeRange(6, 9)).toBe('06:00–09:00');
  });

  test('relativeDayLabel says Bugün / Yarın, otherwise the date', () => {
    const today = new Date(2026, 9, 16, 15);
    expect(relativeDayLabel(new Date(2026, 9, 16, 7), today)).toBe('Bugün');
    expect(relativeDayLabel(new Date(2026, 9, 17, 6), today)).toBe('Yarın');
    expect(relativeDayLabel(new Date(2026, 9, 19), today)).toBe('19 Ekim, Pazartesi');
  });

  test('dayKey is a local YYYY-MM-DD key', () => {
    expect(dayKey(new Date(2026, 9, 6, 23, 30))).toBe('2026-10-06');
  });
});

describe('monthGrid', () => {
  test('October 2026 starts on Thursday, Monday-first weeks padded with nulls', () => {
    const weeks = monthGrid(2026, 9);
    expect(weeks[0].slice(0, 3)).toEqual([null, null, null]);
    expect(weeks[0][3]?.getDate()).toBe(1);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    const days = weeks.flat().filter(Boolean);
    expect(days).toHaveLength(31);
    expect(weeks[weeks.length - 1].includes(null)).toBe(true);
  });
});

describe('fromYear (Turkish ablative after a year)', () => {
  test('follows how the number is read', () => {
    expect(fromYear(2017)).toBe('2017’den');
    expect(fromYear(2019)).toBe('2019’dan');
    expect(fromYear(2020)).toBe('2020’den');
    expect(fromYear(2023)).toBe('2023’ten');
    expect(fromYear(2024)).toBe('2024’ten');
    expect(fromYear(2026)).toBe('2026’dan');
    expect(fromYear(2030)).toBe('2030’dan');
    expect(fromYear(2040)).toBe('2040’tan');
  });
});
