import { agoLabel, whenLabel } from '../when';

const NOW = new Date(2026, 9, 16, 15, 20);

test('whenLabel speaks like the demo history', () => {
  expect(whenLabel(new Date(2026, 9, 16, 8, 12), NOW)).toBe('Bugün, 08:12');
  expect(whenLabel(new Date(2026, 9, 15, 17, 40), NOW)).toBe('Dün, 17:40');
  expect(whenLabel(new Date(2026, 9, 13, 9), NOW)).toBe('3 gün önce');
  expect(whenLabel(new Date(2026, 9, 9, 11), NOW)).toBe('1 hafta önce');
  expect(whenLabel(new Date(2026, 8, 1), NOW)).toBe('1 ay önce');
});

describe('agoLabel (listing and chat times)', () => {
  const now = new Date(2026, 9, 17, 15, 0);
  const at = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60_000);
  test('minutes, hours, yesterday, days, weeks', () => {
    expect(agoLabel(at(0.5), now)).toBe('Az önce');
    expect(agoLabel(at(25), now)).toBe('25 dk önce');
    expect(agoLabel(at(3 * 60), now)).toBe('3 saat önce');
    expect(agoLabel(at(20 * 60), now)).toBe('Dün');
    expect(agoLabel(at(3 * 24 * 60), now)).toBe('3 gün önce');
    expect(agoLabel(at(15 * 24 * 60), now)).toBe('2 hafta önce');
  });
});
