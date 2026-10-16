import { TASK_KINDS, forecast, taskId, tasksOn } from '../farm-calendar';

const TODAY = new Date(2026, 9, 16, 15);

describe('farm calendar (the website demo month, placed around today)', () => {
  test("today has the demo's day-14 tasks", () => {
    expect(tasksOn(TODAY, TODAY).map((t) => t.title)).toEqual(['Taban gübresi (DAP) at', 'Damla sulamayı kontrol et']);
  });

  test('other days keep their distance from today', () => {
    expect(tasksOn(new Date(2026, 9, 18), TODAY).map((t) => t.title)).toEqual(['Buğday ekimi']);
    expect(tasksOn(new Date(2026, 9, 8), TODAY).map((t) => t.title)).toEqual(['Toprak analizi için numune al']);
    expect(tasksOn(new Date(2026, 9, 17), TODAY).map((t) => t.kind)).toEqual(['ilac']);
  });

  test('each kind has a Turkish label', () => {
    expect(TASK_KINDS.gubre.label).toBe('Gübreleme');
    expect(TASK_KINDS.uyari.label).toBe('Uyarı');
  });

  test('task ids are stable per date and title', () => {
    const [t] = tasksOn(TODAY, TODAY);
    expect(taskId(TODAY, t)).toBe('2026-10-16:Taban gübresi (DAP) at');
  });
});

describe('forecast', () => {
  test('five days from today, Turkish day names, the demo values', () => {
    const f = forecast(TODAY);
    expect(f.map((d) => d.day)).toEqual(['Bugün', 'Cumartesi', 'Pazar', 'Pazartesi', 'Salı']);
    expect(f[0]).toMatchObject({ max: 19, min: 7, rain: 5, tip: 'İlaçlama için uygun' });
    expect(f[4].tip).toBe('Don riski: fideleri örtün');
  });
});
