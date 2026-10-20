import { FARM_TASKS, type FarmTask } from './farm-calendar';
import { addDays } from './format';
import { scenarioById, successTone } from './scenarios';

/**
 * Ayşe's fields ("Tarlalarım" and "Tarla Haritası"): sample data, like the rest of the prototype.
 * The names are the calendar's, so each field shows its own tasks; each one's last scan is one of
 * the demo's scenarios, and that scan sets its health.
 */
export type Health = 'saglikli' | 'izlenmeli' | 'riskli';

export const HEALTH: Record<Health, { label: string; hint: string }> = {
  saglikli: { label: 'Sağlıklı', hint: 'Bitki gelişimi normal' },
  izlenmeli: { label: 'İzlenmeli', hint: 'Belirti var, yakından takip edin' },
  riskli: { label: 'Riskli', hint: 'Hemen müdahale gerekiyor' },
};

export type ExpenseKind = 'tohum' | 'gubre' | 'ilac' | 'mazot' | 'su' | 'iscilik';

export const EXPENSE_KINDS: Record<ExpenseKind, string> = {
  tohum: 'Tohum ve fide',
  gubre: 'Gübre',
  ilac: 'İlaç',
  mazot: 'Mazot',
  su: 'Sulama',
  iscilik: 'İşçilik',
};

export type Field = {
  id: string;
  /** As in the calendar's tasks ("Buğday tarlası"). */
  name: string;
  crop: string;
  stage: string;
  areaDonum: number;
  place: string;
  photo: number;
  /** The scenario of the field's last scan. */
  scenarioId: string;
  /** Satellite plant-health index, 0-1 (NDVI-like). */
  ndvi: number;
  expectedYieldKg: number;
  /** This season, in liras. */
  expenses: { kind: ExpenseKind; amount: number }[];
  /** The field's outline on the map photo, as fractions of its width and height. */
  outline: [number, number][];
};

export const FIELDS: Field[] = [
  {
    id: 'bugday',
    name: 'Buğday tarlası',
    crop: 'Ekmeklik buğday',
    stage: 'Ekim hazırlığı',
    areaDonum: 45,
    place: 'Karatay, Konya',
    photo: require('@/assets/images/app/tractor-field.webp'),
    scenarioId: 'bugday-pas',
    ndvi: 0.58,
    expectedYieldKg: 18_000,
    expenses: [
      { kind: 'gubre', amount: 54_000 },
      { kind: 'tohum', amount: 40_500 },
      { kind: 'mazot', amount: 31_500 },
      { kind: 'iscilik', amount: 12_000 },
      { kind: 'ilac', amount: 9_000 },
    ],
    outline: [
      [0.52, 0.31],
      [0.78, 0.3],
      [0.78, 0.49],
      [0.52, 0.49],
    ],
  },
  {
    id: 'misir',
    name: 'Mısır tarlası',
    crop: 'Dane mısır',
    stage: 'Hasat zamanı',
    areaDonum: 30,
    place: 'Çumra, Konya',
    photo: require('@/assets/images/app/misir-kuraklik.webp'),
    scenarioId: 'kuru-misir',
    ndvi: 0.44,
    expectedYieldKg: 33_000,
    expenses: [
      { kind: 'su', amount: 42_000 },
      { kind: 'gubre', amount: 36_000 },
      { kind: 'tohum', amount: 27_000 },
      { kind: 'mazot', amount: 24_000 },
      { kind: 'iscilik', amount: 15_000 },
      { kind: 'ilac', amount: 6_000 },
    ],
    outline: [
      [0.35, 0.44],
      [0.43, 0.44],
      [0.43, 0.72],
      [0.35, 0.72],
    ],
  },
  {
    id: 'domates',
    name: 'Domates serası',
    crop: 'Sofralık domates',
    stage: 'Hasat sürüyor',
    areaDonum: 3,
    place: 'Meram, Konya',
    photo: require('@/assets/images/app/domates-mildiyo.webp'),
    scenarioId: 'domates-mildiyo',
    ndvi: 0.36,
    expectedYieldKg: 42_000,
    expenses: [
      { kind: 'tohum', amount: 30_000 },
      { kind: 'iscilik', amount: 28_000 },
      { kind: 'ilac', amount: 14_500 },
      { kind: 'gubre', amount: 12_000 },
      { kind: 'su', amount: 9_000 },
    ],
    outline: [
      [0.44, 0.2],
      [0.51, 0.2],
      [0.51, 0.29],
      [0.44, 0.29],
    ],
  },
  {
    id: 'aycicegi',
    name: 'Ayçiçeği tarlası',
    crop: 'Yağlık ayçiçeği',
    stage: 'Hasada hazır',
    areaDonum: 25,
    place: 'Karatay, Konya',
    photo: require('@/assets/images/app/aycicegi-tarlasi.webp'),
    scenarioId: 'aycicegi',
    ndvi: 0.74,
    expectedYieldKg: 7_000,
    expenses: [
      { kind: 'gubre', amount: 22_500 },
      { kind: 'tohum', amount: 20_000 },
      { kind: 'mazot', amount: 17_500 },
      { kind: 'iscilik', amount: 8_000 },
      { kind: 'ilac', amount: 4_000 },
    ],
    outline: [
      [0.8, 0.31],
      [0.93, 0.31],
      [0.93, 0.49],
      [0.8, 0.49],
    ],
  },
];

export const fieldById = (id: string) => FIELDS.find((f) => f.id === id);

/** From the last scan's harvest-success estimate, on the same scale as its gauge. */
export function healthOf(field: Field): Health {
  const scan = scenarioById(field.scenarioId);
  const tone = successTone(scan?.successRate ?? 0);
  return tone === 'primary' ? 'saglikli' : tone === 'gold' ? 'izlenmeli' : 'riskli';
}

export const totalExpenses = (field: Field) => field.expenses.reduce((n, e) => n + e.amount, 0);

export function seasonSummary(fields: Field[]) {
  return {
    areaDonum: fields.reduce((n, f) => n + f.areaDonum, 0),
    expenses: fields.reduce((n, f) => n + totalExpenses(f), 0),
    yieldKg: fields.reduce((n, f) => n + f.expectedYieldKg, 0),
  };
}

/** "18 ton", "7,5 ton" */
export function tonsLabel(kg: number) {
  const t = Math.round(kg / 100) / 10;
  return `${Number.isInteger(t) ? t : t.toFixed(1).replace('.', ',')} ton`;
}

/** The calendar's tasks for this field, from today on, soonest first. */
export function upcomingTasks(field: Field, today: Date, limit = Infinity): { date: Date; task: FarmTask }[] {
  return FARM_TASKS.filter((t) => t.field === field.name && t.offset >= 0)
    .sort((a, b) => a.offset - b.offset || a.time.localeCompare(b.time))
    .slice(0, limit)
    .map((task) => ({ task, date: addDays(today, task.offset) }));
}
