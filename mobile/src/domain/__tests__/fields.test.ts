import { FIELDS, fieldById, healthOf, seasonSummary, tonsLabel, totalExpenses, upcomingTasks } from '../fields';
import { scenarioById } from '../scenarios';

const TODAY = new Date(2026, 9, 16, 15);
const field = (id: string) => {
  const f = fieldById(id);
  if (!f) throw new Error(`no field ${id}`);
  return f;
};

describe('fields (Tarlalarım)', () => {
  test('four fields, each with a known last scan, a positive area and an outline on the map', () => {
    expect(FIELDS).toHaveLength(4);
    expect(new Set(FIELDS.map((f) => f.id)).size).toBe(4);
    for (const f of FIELDS) {
      expect(scenarioById(f.scenarioId)).toBeDefined();
      expect(f.areaDonum).toBeGreaterThan(0);
      expect(f.outline.length).toBeGreaterThanOrEqual(3);
      for (const [x, y] of f.outline) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(1);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(1);
      }
    }
  });

  test('health follows the last scan: under 50 risky, under 75 watch, else healthy', () => {
    expect(healthOf(field('bugday'))).toBe('izlenmeli'); // sarı pas, 72
    expect(healthOf(field('domates'))).toBe('riskli'); // mildiyö, 48
    expect(healthOf(field('aycicegi'))).toBe('saglikli'); // 91
  });

  test("a field's expenses add up", () => {
    expect(totalExpenses(field('bugday'))).toBe(147_000);
  });

  test('the season summary adds up every field', () => {
    const s = seasonSummary(FIELDS);
    expect(s.areaDonum).toBe(FIELDS.reduce((n, f) => n + f.areaDonum, 0));
    expect(s.expenses).toBe(FIELDS.reduce((n, f) => n + totalExpenses(f), 0));
    expect(s.yieldKg).toBe(FIELDS.reduce((n, f) => n + f.expectedYieldKg, 0));
  });

  test("upcoming tasks are the calendar's tasks for that field, from today on, in date order", () => {
    const tasks = upcomingTasks(field('domates'), TODAY);
    expect(tasks.map((t) => t.task.title)).toEqual(['Damla sulamayı kontrol et', 'Fideleri sula', 'Don riski: fideleri ört']);
    expect(tasks[0].date.getDate()).toBe(16);
    expect(tasks[1].date.getDate()).toBe(23);
  });

  test('past tasks are left out, and the list can be cut short', () => {
    expect(upcomingTasks(field('bugday'), TODAY).map((t) => t.task.title)).toEqual(['Taban gübresi (DAP) at', 'Buğday ekimi']);
    expect(upcomingTasks(field('domates'), TODAY, 1)).toHaveLength(1);
    expect(upcomingTasks(field('aycicegi'), TODAY)).toEqual([]);
  });

  test('yields read in tons, with a decimal comma only when needed', () => {
    expect(tonsLabel(18_000)).toBe('18 ton');
    expect(tonsLabel(7_500)).toBe('7,5 ton');
    expect(tonsLabel(100_250)).toBe('100,3 ton');
  });
});
