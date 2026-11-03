"use server";

import { refresh } from "next/cache";
import { ensureProfile, requireUserId } from "@/lib/auth";
import { isUuid, sql } from "@/lib/db";
import { validateTask, type TaskErrors, type TaskInput } from "@/lib/farm";

const s = (v: unknown) => (typeof v === "string" ? v : "");

/** Adds a task to the person's calendar. */
export async function addTask(raw: TaskInput): Promise<{ errors: TaskErrors; ok?: boolean }> {
  const userId = await requireUserId("/takvim");
  await ensureProfile(userId);
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
  refresh();
  return { errors: {}, ok: true };
}

export async function setTaskDone(id: string, done: boolean) {
  const userId = await requireUserId("/takvim");
  if (!isUuid(id)) return;
  await sql()`update tasks set done = ${done === true} where id = ${id} and user_id = ${userId}`;
  refresh();
}

export async function deleteTask(id: string) {
  const userId = await requireUserId("/takvim");
  if (!isUuid(id)) return;
  await sql()`delete from tasks where id = ${id} and user_id = ${userId}`;
  refresh();
}
