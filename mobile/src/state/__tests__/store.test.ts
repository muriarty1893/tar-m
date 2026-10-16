import { dayKey } from '@/domain/format';

import { createAppStore } from '../store';

const NOW = new Date(2026, 9, 16, 15, 20);

describe('app store', () => {
  test('starts not onboarded, with sample fields and tasks seeded around today', () => {
    const s = createAppStore(NOW).getState();
    expect(s.onboarded).toBe(false);
    expect(s.fields.length).toBeGreaterThanOrEqual(3);
    expect(s.tasks.some((t) => t.date === dayKey(NOW))).toBe(true);
  });

  test('completeOnboarding stores crops and location', () => {
    const store = createAppStore(NOW);
    store.getState().completeOnboarding({ name: 'Ahmet', province: 'Konya', district: 'Ereğli', crops: ['bugday', 'domates'] });
    const s = store.getState();
    expect(s.onboarded).toBe(true);
    expect(s.profile).toEqual({ name: 'Ahmet', province: 'Konya', district: 'Ereğli', crops: ['bugday', 'domates'] });
  });

  test('toggleTask flips done', () => {
    const store = createAppStore(NOW);
    const id = store.getState().tasks[0].id;
    store.getState().toggleTask(id);
    expect(store.getState().tasks[0].done).toBe(true);
    store.getState().toggleTask(id);
    expect(store.getState().tasks[0].done).toBe(false);
  });

  test('addScan records the scan first in history and returns its id', () => {
    const store = createAppStore(NOW);
    const id = store.getState().addScan({ crop: 'bugday', fieldId: 'kuzey', diagnosisId: 'sari-pas', confidence: 0.87, photo: 'leaf-rust' }, NOW);
    const s = store.getState();
    expect(s.scans[0].id).toBe(id);
    expect(s.scans[0].date).toBe(NOW.toISOString());
  });

  test('scheduleTreatment adds a spraying task in the window, tied to the scan and field, only once', () => {
    const store = createAppStore(NOW);
    const scanId = store.getState().addScan({ crop: 'bugday', fieldId: 'kuzey', diagnosisId: 'sari-pas', confidence: 0.87, photo: 'leaf-rust' }, NOW);
    const before = store.getState().tasks.length;
    const start = new Date(2026, 9, 17, 6);
    store.getState().scheduleTreatment(scanId, start);
    store.getState().scheduleTreatment(scanId, start);
    const s = store.getState();
    expect(s.tasks).toHaveLength(before + 1);
    const t = s.tasks.find((x) => x.scanId === scanId)!;
    expect(t).toMatchObject({ kind: 'ilaclama', date: '2026-10-17', time: '06:00', fieldId: 'kuzey', done: false });
    expect(t.title).toBe('Sarı pas ilaçlaması');
  });

  test('addTask adds a task for a day', () => {
    const store = createAppStore(NOW);
    store.getState().addTask({ title: 'Gübre siparişi', kind: 'gubre', date: '2026-10-20' });
    expect(store.getState().tasks.some((t) => t.title === 'Gübre siparişi' && t.date === '2026-10-20')).toBe(true);
  });

  test('settings toggle and resetDemo clears everything back to the start', () => {
    const store = createAppStore(NOW);
    store.getState().setSetting('offline', true);
    expect(store.getState().settings.offline).toBe(true);
    store.getState().completeOnboarding({ name: 'A', province: 'Konya', district: 'Ereğli', crops: ['bugday'] });
    store.getState().resetDemo(NOW);
    expect(store.getState().onboarded).toBe(false);
    expect(store.getState().settings.offline).toBe(false);
  });
});
