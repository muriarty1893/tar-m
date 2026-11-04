import { TASK_KINDS, shiftMonthKey, validateTask } from '../farm-calendar';

describe('the task form (the website’s checks)', () => {
  test('what, which kind and the day are required; the time is optional but checked', () => {
    expect(validateTask({ title: 'Taban gübresi at', kind: 'gubre', date: '2026-11-20', time: '', fieldId: '' })).toEqual({});
    expect(Object.keys(validateTask({ title: '', kind: '', date: '', time: '', fieldId: '' })).sort()).toEqual(['date', 'kind', 'title']);
    expect(validateTask({ title: 'Sula', kind: 'sulama', date: '2026-11-20', time: '25:00', fieldId: '' }).time).toBeDefined();
    expect(validateTask({ title: 'Sula', kind: 'sulama', date: '2026-11-20', time: '08:30', fieldId: '' })).toEqual({});
  });

  test('every kind has a Turkish label, "Diğer" included', () => {
    expect(TASK_KINDS.gubre.label).toBe('Gübreleme');
    expect(TASK_KINDS.diger.label).toBe('Diğer');
  });

  test('months move across years', () => {
    expect(shiftMonthKey('2026-11', 1)).toBe('2026-12');
    expect(shiftMonthKey('2026-12', 1)).toBe('2027-01');
    expect(shiftMonthKey('2026-01', -1)).toBe('2025-12');
  });
});
