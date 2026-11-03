"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { ensureProfile, requireUserId } from "@/lib/auth";
import { isUuid, sql } from "@/lib/db";
import { normalizeField, parseAmount, validateExpense, validateField, type ExpenseErrors, type ExpenseInput, type FieldErrors, type FieldInput } from "@/lib/farm";
import { trDayKey } from "@/lib/tr-time";

const s = (v: unknown) => (typeof v === "string" ? v : "");
const cleanField = (f: FieldInput): FieldInput => ({
  name: s(f.name),
  crop: s(f.crop),
  stage: s(f.stage),
  area: s(f.area),
  province: s(f.province),
  district: s(f.district),
  expectedYield: s(f.expectedYield),
  notes: s(f.notes),
});

/** Adds a field, or saves changes to `id`; then opens it. */
export async function saveField(raw: FieldInput, id?: string): Promise<{ errors: FieldErrors }> {
  const userId = await requireUserId(id ? `/tarlalarim/${id}` : "/tarlalarim");
  await ensureProfile(userId);
  const f = cleanField(raw);
  const errors = validateField(f);
  if (Object.keys(errors).length) return { errors };
  const v = normalizeField(f);
  if (id) {
    if (!isUuid(id)) return { errors: { name: "Tarla bulunamadı." } };
    await sql()`
      update fields set name = ${v.name}, crop = ${v.crop}, stage = ${v.stage}, area_donum = ${v.areaDonum}, province = ${v.province},
        district = ${v.district}, expected_yield_kg = ${v.expectedYieldKg}, notes = ${v.notes}, updated_at = now()
      where id = ${id} and user_id = ${userId}`;
    refresh();
    return { errors: {} };
  }
  const count = await sql()`select count(*) as n from fields where user_id = ${userId}`;
  if (Number(count[0].n) >= 100) return { errors: { name: "En fazla 100 tarla ekleyebilirsiniz." } };
  const rows = await sql()`
    insert into fields (user_id, name, crop, stage, area_donum, province, district, expected_yield_kg, notes)
    values (${userId}, ${v.name}, ${v.crop}, ${v.stage}, ${v.areaDonum}, ${v.province}, ${v.district}, ${v.expectedYieldKg}, ${v.notes})
    returning id`;
  redirect(`/tarlalarim/${rows[0].id}`);
}

/** Deletes a field with its expenses; its calendar tasks stay, without the field. */
export async function deleteField(id: string) {
  const userId = await requireUserId("/tarlalarim");
  if (isUuid(id)) await sql()`delete from fields where id = ${id} and user_id = ${userId}`;
  redirect("/tarlalarim?silindi=1");
}

export async function addExpense(fieldId: string, raw: ExpenseInput): Promise<{ errors: ExpenseErrors; ok?: boolean }> {
  const userId = await requireUserId(`/tarlalarim/${fieldId}`);
  const x: ExpenseInput = { kind: s(raw.kind), amount: s(raw.amount), date: s(raw.date), note: s(raw.note) };
  const errors = validateExpense(x, trDayKey(new Date()));
  if (Object.keys(errors).length) return { errors };
  if (!isUuid(fieldId)) return { errors: { kind: "Tarla bulunamadı." } };
  const rows = await sql()`
    insert into expenses (field_id, user_id, kind, amount, spent_on, note)
    select id, ${userId}, ${x.kind}, ${parseAmount(x.amount)}, ${x.date}, ${x.note.trim()} from fields where id = ${fieldId} and user_id = ${userId}
    returning id`;
  if (!rows[0]) return { errors: { kind: "Tarla bulunamadı." } };
  refresh();
  return { errors: {}, ok: true };
}

export async function deleteExpense(id: string) {
  const userId = await requireUserId("/tarlalarim");
  if (isUuid(id)) await sql()`delete from expenses where id = ${id} and user_id = ${userId}`;
  refresh();
}
