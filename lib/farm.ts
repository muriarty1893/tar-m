/**
 * Tarlalarım and Tarım takvimi on the website: the farmer's own fields, this season's expenses and
 * their calendar tasks. Rules shared by the forms (in the browser) and the server actions.
 * The kinds and their names are the mobile app's (data/farm-calendar.ts, data/demo-fields.ts).
 */
import { EXPENSE_KINDS as APP_EXPENSE_KINDS, tonsLabel } from "@/data/demo-fields";
import { TASK_KINDS as APP_TASK_KINDS } from "@/data/farm-calendar";
import { parsePrice } from "@/data/demo-market";
import { isProvince } from "./market";
import { MONTHS } from "./tr-time";

export { tonsLabel };

export const TASK_KINDS = { ...APP_TASK_KINDS, diger: { label: "Diğer" } } as const;
export type TaskKind = keyof typeof TASK_KINDS;
export const isTaskKind = (s: string): s is TaskKind => s in TASK_KINDS;

export const EXPENSE_KINDS = { ...APP_EXPENSE_KINDS, diger: "Diğer" } as const;
export type ExpenseKind = keyof typeof EXPENSE_KINDS;
export const isExpenseKind = (s: string): s is ExpenseKind => s in EXPENSE_KINDS;

/** Suggestions for a field's stage (free text is fine too). */
export const STAGES = ["Ekim hazırlığı", "Ekildi", "Çimlendi", "Gelişme dönemi", "Çiçeklenme", "Hasat zamanı", "Hasat edildi", "Nadasta"];

const isDayKey = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
const isTime = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

/** "45", "45,5", "1.250" as a number; NaN if it isn't one. */
export const parseAmount = parsePrice;

// ---------------------------------------------------------------- Fields

export type FieldInput = { name: string; crop: string; stage: string; area: string; province: string; district: string; expectedYield: string; notes: string };
export type FieldErrors = Partial<Record<keyof FieldInput, string>>;
export const EMPTY_FIELD: FieldInput = { name: "", crop: "", stage: "", area: "", province: "", district: "", expectedYield: "", notes: "" };

export function validateField(f: FieldInput): FieldErrors {
  const e: FieldErrors = {};
  const name = f.name.trim();
  if (name.length < 2) e.name = "Tarlaya bir ad verin (ör. Buğday tarlası).";
  else if (name.length > 40) e.name = "Ad en fazla 40 karakter olabilir.";
  if (f.crop.trim().length > 40) e.crop = "Ürün en fazla 40 karakter olabilir.";
  if (f.stage.trim().length > 40) e.stage = "Dönem en fazla 40 karakter olabilir.";
  const area = parseAmount(f.area);
  if (!(area > 0)) e.area = "Alanı dönüm olarak yazın (ör. 45).";
  else if (area > 1_000_000) e.area = "Alan çok büyük görünüyor.";
  if (f.province && !isProvince(f.province)) e.province = "Listeden bir il seçin.";
  if (f.district.trim().length > 40) e.district = "İlçe en fazla 40 karakter olabilir.";
  if (f.expectedYield.trim() && !(parseAmount(f.expectedYield) >= 0)) e.expectedYield = "Beklenen verimi kilogram olarak yazın (ör. 18.000).";
  if (f.notes.length > 500) e.notes = "Not en fazla 500 karakter olabilir.";
  return e;
}

export function normalizeField(f: FieldInput) {
  return {
    name: f.name.trim().replace(/\s+/g, " "),
    crop: f.crop.trim(),
    stage: f.stage.trim(),
    areaDonum: parseAmount(f.area),
    province: f.province,
    district: f.district.trim(),
    expectedYieldKg: f.expectedYield.trim() ? parseAmount(f.expectedYield) : null,
    notes: f.notes.trim(),
  };
}

// ---------------------------------------------------------------- Expenses

export type ExpenseInput = { kind: string; amount: string; date: string; note: string };
export type ExpenseErrors = Partial<Record<keyof ExpenseInput, string>>;

export function validateExpense(x: ExpenseInput, today: string): ExpenseErrors {
  const e: ExpenseErrors = {};
  if (!isExpenseKind(x.kind)) e.kind = "Masraf türünü seçin.";
  const amount = parseAmount(x.amount);
  if (!(amount > 0)) e.amount = "Tutarı yazın (ör. 12.500).";
  else if (amount > 100_000_000) e.amount = "Tutar çok yüksek görünüyor.";
  if (!isDayKey(x.date)) e.date = "Tarihi seçin.";
  else if (x.date > today) e.date = "Gelecek bir tarih olamaz.";
  if (x.note.trim().length > 120) e.note = "Not en fazla 120 karakter olabilir.";
  return e;
}

/** Totals by kind, largest first. */
export function expensesByKind(expenses: { kind: ExpenseKind; amount: number }[]) {
  const totals = new Map<ExpenseKind, number>();
  for (const x of expenses) totals.set(x.kind, (totals.get(x.kind) ?? 0) + x.amount);
  return [...totals].map(([kind, amount]) => ({ kind, amount })).sort((a, b) => b.amount - a.amount);
}

// ---------------------------------------------------------------- Tasks

export type TaskInput = { title: string; kind: string; date: string; time: string; fieldId: string };
export type TaskErrors = Partial<Record<keyof TaskInput, string>>;

export function validateTask(t: TaskInput): TaskErrors {
  const e: TaskErrors = {};
  const title = t.title.trim();
  if (title.length < 2) e.title = "Yapılacak işi yazın (ör. Taban gübresi at).";
  else if (title.length > 80) e.title = "İş en fazla 80 karakter olabilir.";
  if (!isTaskKind(t.kind)) e.kind = "İşin türünü seçin.";
  if (!isDayKey(t.date)) e.date = "Tarihi seçin.";
  if (t.time && !isTime(t.time)) e.time = "Saati SS:DD olarak yazın (ör. 08:30).";
  return e;
}

// ---------------------------------------------------------------- The month view

export type MonthRef = { year: number; month: number };

/** "2026-11" from ?ay=, else the month of `todayKey`. */
export function parseMonth(param: string | undefined, todayKey: string): MonthRef {
  const m = /^(\d{4})-(\d{2})$/.exec(param ?? "");
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]) - 1;
    if (year >= 2000 && year <= 2100 && month >= 0 && month <= 11) return { year, month };
  }
  return { year: Number(todayKey.slice(0, 4)), month: Number(todayKey.slice(5, 7)) - 1 };
}

const pad = (n: number) => String(n).padStart(2, "0");
export const monthKey = ({ year, month }: MonthRef) => `${year}-${pad(month + 1)}`;
export const monthTitle = ({ year, month }: MonthRef) => `${MONTHS[month]} ${year}`;
export const shiftMonth = ({ year, month }: MonthRef, by: number): MonthRef => {
  const i = year * 12 + month + by;
  return { year: Math.floor(i / 12), month: ((i % 12) + 12) % 12 };
};
export const daysIn = ({ year, month }: MonthRef) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
export const dayKeyOf = ({ year, month }: MonthRef, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

/** The month as Monday-first weeks of day keys, with null before the 1st and after the last day. */
export function monthGrid(ref: MonthRef): (string | null)[][] {
  const lead = (new Date(Date.UTC(ref.year, ref.month, 1)).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [...Array<null>(lead).fill(null)];
  for (let d = 1; d <= daysIn(ref); d++) cells.push(dayKeyOf(ref, d));
  while (cells.length % 7) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export const WEEKDAY_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
export const WEEKDAY_LONG = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
