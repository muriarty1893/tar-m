import "server-only";
import { isUuid, sql } from "@/lib/db";
import { normalizeField, parseAmount, validateExpense, validateField, validateTask, type ExpenseErrors, type ExpenseInput, type FieldErrors, type FieldInput, type TaskErrors, type TaskInput } from "@/lib/farm";
import { parseBoundary } from "@/lib/geo";
import { trDayKey } from "@/lib/tr-time";

/**
 * Tarım takvimi and Tarlalarım writes, shared by the website's server actions (app/takvim/actions.ts,
 * app/tarlalarim/actions.ts) and the mobile app's API. Every query is scoped to the person.
 */

const s = (v: unknown) => (typeof v === "string" ? v : "");

/** Adds a task to the person's calendar. */
export async function addTaskFor(userId: string, raw: Partial<Record<keyof TaskInput, unknown>>): Promise<{ errors: TaskErrors; ok?: boolean }> {
  const t: TaskInput = { title: s(raw.title), kind: s(raw.kind), date: s(raw.date), time: s(raw.time), fieldId: s(raw.fieldId) };
  const errors = validateTask(t);
  if (Object.keys(errors).length) return { errors };
  const count = await sql()`select count(*) as n from tasks where user_id = ${userId}`;
  if (Number(count[0].n) >= 2000) return { errors: { title: "Takviminiz dolu: eski işlerden bazılarını silin." } };
  // A field is only linked if it's the person's own.
  const fieldId = isUuid(t.fieldId) ? t.fieldId : null;
  await sql()`
    insert into tasks (user_id, field_id, title, kind, due_date, due_time)
    select ${userId}, (select id from fields where id = ${fieldId}::uuid and user_id = ${userId}), ${t.title.trim()}, ${t.kind}, ${t.date}, ${t.time || null}`;
  return { errors: {}, ok: true };
}

export async function setTaskDoneFor(userId: string, id: string, done: boolean) {
  if (!isUuid(id)) return false;
  const rows = await sql()`update tasks set done = ${done === true} where id = ${id} and user_id = ${userId} returning id`;
  return rows.length > 0;
}

export async function deleteTaskFor(userId: string, id: string) {
  if (!isUuid(id)) return false;
  const rows = await sql()`delete from tasks where id = ${id} and user_id = ${userId} returning id`;
  return rows.length > 0;
}

export const cleanField = (f: Partial<Record<keyof FieldInput, unknown>>): FieldInput => ({
  name: s(f.name),
  crop: s(f.crop),
  stage: s(f.stage),
  area: s(f.area),
  province: s(f.province),
  district: s(f.district),
  expectedYield: s(f.expectedYield),
  notes: s(f.notes),
});

export type SaveFieldOutcome = { errors: FieldErrors; id?: string };

/** Adds a field, or saves changes to `id`. */
export async function saveFieldFor(userId: string, raw: Partial<Record<keyof FieldInput, unknown>>, id?: string): Promise<SaveFieldOutcome> {
  const f = cleanField(raw);
  const errors = validateField(f);
  if (Object.keys(errors).length) return { errors };
  const v = normalizeField(f);
  if (id) {
    if (!isUuid(id)) return { errors: { name: "Tarla bulunamadı." } };
    const rows = await sql()`
      update fields set name = ${v.name}, crop = ${v.crop}, stage = ${v.stage}, area_donum = ${v.areaDonum}, province = ${v.province},
        district = ${v.district}, expected_yield_kg = ${v.expectedYieldKg}, notes = ${v.notes}, updated_at = now()
      where id = ${id} and user_id = ${userId}
      returning id`;
    if (!rows[0]) return { errors: { name: "Tarla bulunamadı." } };
    return { errors: {}, id };
  }
  const count = await sql()`select count(*) as n from fields where user_id = ${userId}`;
  if (Number(count[0].n) >= 100) return { errors: { name: "En fazla 100 tarla ekleyebilirsiniz." } };
  const rows = await sql()`
    insert into fields (user_id, name, crop, stage, area_donum, province, district, expected_yield_kg, notes)
    values (${userId}, ${v.name}, ${v.crop}, ${v.stage}, ${v.areaDonum}, ${v.province}, ${v.district}, ${v.expectedYieldKg}, ${v.notes})
    returning id`;
  return { errors: {}, id: String(rows[0].id) };
}

/** Saves the outline drawn on the app's map; `null` clears it. */
export async function saveBoundaryFor(userId: string, fieldId: string, raw: unknown): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(fieldId)) return { ok: false, message: "Tarla bulunamadı." };
  const boundary = raw === null ? null : parseBoundary(raw);
  if (raw !== null && !boundary) return { ok: false, message: "Tarlanın sınırı için en az 3 köşe işaretleyin." };
  const rows = await sql()`
    update fields set boundary = ${boundary === null ? null : JSON.stringify(boundary)}::jsonb, updated_at = now()
    where id = ${fieldId} and user_id = ${userId}
    returning id`;
  return rows[0] ? { ok: true } : { ok: false, message: "Tarla bulunamadı." };
}

/** Deletes a field with its expenses; its calendar tasks stay, without the field. */
export async function deleteFieldFor(userId: string, id: string) {
  if (!isUuid(id)) return false;
  const rows = await sql()`delete from fields where id = ${id} and user_id = ${userId} returning id`;
  return rows.length > 0;
}

export async function addExpenseFor(userId: string, fieldId: string, raw: Partial<Record<keyof ExpenseInput, unknown>>): Promise<{ errors: ExpenseErrors; ok?: boolean }> {
  const x: ExpenseInput = { kind: s(raw.kind), amount: s(raw.amount), date: s(raw.date), note: s(raw.note) };
  const errors = validateExpense(x, trDayKey(new Date()));
  if (Object.keys(errors).length) return { errors };
  if (!isUuid(fieldId)) return { errors: { kind: "Tarla bulunamadı." } };
  const rows = await sql()`
    insert into expenses (field_id, user_id, kind, amount, spent_on, note)
    select id, ${userId}, ${x.kind}, ${parseAmount(x.amount)}, ${x.date}, ${x.note.trim()} from fields where id = ${fieldId} and user_id = ${userId}
    returning id`;
  if (!rows[0]) return { errors: { kind: "Tarla bulunamadı." } };
  return { errors: {}, ok: true };
}

export async function deleteExpenseFor(userId: string, id: string) {
  if (!isUuid(id)) return false;
  const rows = await sql()`delete from expenses where id = ${id} and user_id = ${userId} returning id`;
  return rows.length > 0;
}
