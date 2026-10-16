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



  test('setSuggestion and setTask set a tick to a given value, repeat-safe', () => {
    const store = createAppStore(NOW);
    const id = store.getState().scans[0].id;
    store.getState().setSuggestion(id, 2, true);
    store.getState().setSuggestion(id, 2, true);
    expect(store.getState().doneSuggestions[id]).toEqual([2]);
    store.getState().setSuggestion(id, 2, false);
    expect(store.getState().doneSuggestions[id]).toEqual([]);
    store.getState().setTask('2026-10-16:Buğday ekimi', true);
    store.getState().setTask('2026-10-16:Buğday ekimi', true);
    expect(store.getState().doneTasks).toEqual(['2026-10-16:Buğday ekimi']);
    store.getState().setTask('2026-10-16:Buğday ekimi', false);
    expect(store.getState().doneTasks).toEqual([]);
  });
});
