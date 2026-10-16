import { createAppStore } from '../store';

const NOW = new Date(2026, 9, 16, 15, 20);

describe('app store', () => {
  test('history starts with the four demo scans, newest first', () => {
    const s = createAppStore(NOW).getState();
    expect(s.scans.map((x) => x.scenarioId)).toEqual(['bugday-pas', 'kuru-misir', 'aycicegi', 'domates-mildiyo']);
    expect(new Date(s.scans[0].date).getTime()).toBeGreaterThan(new Date(s.scans[1].date).getTime());
  });

  test('addScan puts the new scan first and returns its id', () => {
    const store = createAppStore(NOW);
    const id = store.getState().addScan({ scenarioId: 'aycicegi', photo: 'file:///x.jpg' }, NOW);
    expect(store.getState().scans[0]).toMatchObject({ id, scenarioId: 'aycicegi', photo: 'file:///x.jpg', date: NOW.toISOString() });
  });

  test('toggleSuggestion ticks and unticks a suggestion of one scan', () => {
    const store = createAppStore(NOW);
    const id = store.getState().scans[0].id;
    store.getState().toggleSuggestion(id, 1);
    expect(store.getState().doneSuggestions[id]).toEqual([1]);
    store.getState().toggleSuggestion(id, 1);
    expect(store.getState().doneSuggestions[id]).toEqual([]);
  });

  test('toggleTask ticks and unticks a calendar task', () => {
    const store = createAppStore(NOW);
    store.getState().toggleTask('2026-10-16:Buğday ekimi');
    expect(store.getState().doneTasks).toContain('2026-10-16:Buğday ekimi');
    store.getState().toggleTask('2026-10-16:Buğday ekimi');
    expect(store.getState().doneTasks).not.toContain('2026-10-16:Buğday ekimi');
  });
});
