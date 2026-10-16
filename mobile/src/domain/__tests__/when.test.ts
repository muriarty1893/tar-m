import { whenLabel } from '../when';

const NOW = new Date(2026, 9, 16, 15, 20);

test('whenLabel speaks like the demo history', () => {
  expect(whenLabel(new Date(2026, 9, 16, 8, 12), NOW)).toBe('Bugün, 08:12');
  expect(whenLabel(new Date(2026, 9, 15, 17, 40), NOW)).toBe('Dün, 17:40');
  expect(whenLabel(new Date(2026, 9, 13, 9), NOW)).toBe('3 gün önce');
  expect(whenLabel(new Date(2026, 9, 9, 11), NOW)).toBe('1 hafta önce');
  expect(whenLabel(new Date(2026, 8, 1), NOW)).toBe('1 ay önce');
});
