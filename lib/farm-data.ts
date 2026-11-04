import "server-only";
import { day, isUuid, num, sql, str, type Row } from "./db";
import type { ExpenseKind, TaskKind } from "./farm";
import { parseBoundary, type LatLng } from "./geo";

/** Reads for Tarlalarım and Tarım takvimi. Every query is scoped to the signed-in person. */

export type Task = {
  id: string;
  title: string;
  kind: TaskKind;
  date: string;
  /** "08:30", or "" for a task without a time. */
  time: string;
  done: boolean;
  fieldId: string | null;
  fieldName: string | null;
};

const toTask = (r: Row): Task => ({
  id: str(r.id),
  title: str(r.title),
  kind: str(r.kind) as TaskKind,
  date: day(r.due_date),
  time: r.due_time ? str(r.due_time).slice(0, 5) : "",
  done: r.done === true,
  fieldId: r.field_id ? str(r.field_id) : null,
  fieldName: r.field_name ? str(r.field_name) : null,
});

/** Tasks from `from` to `to` (day keys, inclusive), by day and time. */
export async function tasksBetween(userId: string, from: string, to: string): Promise<Task[]> {
  const rows = await sql()`
    select t.*, f.name as field_name from tasks t left join fields f on f.id = t.field_id
    where t.user_id = ${userId} and t.due_date between ${from} and ${to}
    order by t.due_date, t.due_time nulls first, t.created_at`;
  return rows.map(toTask);
}

/** Open tasks from `from` on, soonest first. */
export async function upcomingTasks(userId: string, from: string, limit = 6, fieldId?: string): Promise<Task[]> {
  const rows = await sql()`
    select t.*, f.name as field_name from tasks t left join fields f on f.id = t.field_id
    where t.user_id = ${userId} and t.due_date >= ${from} and not t.done
      and (${fieldId ?? null}::uuid is null or t.field_id = ${fieldId ?? null}::uuid)
    order by t.due_date, t.due_time nulls first
    limit ${limit}`;
  return rows.map(toTask);
}

export type FieldSummary = {
  id: string;
  name: string;
  crop: string;
  stage: string;
  areaDonum: number;
  province: string;
  district: string;
  expectedYieldKg: number | null;
  notes: string;
  expenses: number;
  nextTask: { title: string; date: string } | null;
  /** The outline drawn on the app's map, or null. */
  boundary: LatLng[] | null;
};

const toField = (r: Row): FieldSummary => ({
  id: str(r.id),
  name: str(r.name),
  crop: str(r.crop),
  stage: str(r.stage),
  areaDonum: num(r.area_donum) ?? 0,
  province: str(r.province),
  district: str(r.district),
  expectedYieldKg: num(r.expected_yield_kg),
  notes: str(r.notes),
  expenses: num(r.expenses) ?? 0,
  nextTask: r.next_title ? { title: str(r.next_title), date: day(r.next_date) } : null,
  boundary: parseBoundary(r.boundary),
});

export async function listFields(userId: string, today: string, onlyId: string | null = null): Promise<FieldSummary[]> {
  const rows = await sql()`
    select f.*,
      (select coalesce(sum(amount), 0) from expenses x where x.field_id = f.id) as expenses,
      nt.title as next_title, nt.due_date as next_date
    from fields f
    left join lateral (
      select title, due_date from tasks t where t.field_id = f.id and not t.done and t.due_date >= ${today}
      order by due_date, due_time nulls first limit 1
    ) nt on true
    where f.user_id = ${userId} and (${onlyId}::uuid is null or f.id = ${onlyId}::uuid)
    order by f.created_at`;
  return rows.map(toField);
}

export type Expense = { id: string; kind: ExpenseKind; amount: number; date: string; note: string };

export async function getField(id: string, userId: string, today: string) {
  if (!isUuid(id)) return null;
  const [field] = await listFields(userId, today, id);
  if (!field) return null;
  const rows = await sql()`select * from expenses where field_id = ${id} and user_id = ${userId} order by spent_on desc, created_at desc`;
  const expenses: Expense[] = rows.map((r) => ({
    id: str(r.id),
    kind: str(r.kind) as ExpenseKind,
    amount: num(r.amount) ?? 0,
    date: day(r.spent_on),
    note: str(r.note),
  }));
  return { field, expenses };
}

/** Names for the task form's field picker. */
export async function fieldOptions(userId: string): Promise<{ id: string; name: string }[]> {
  const rows = await sql()`select id, name from fields where user_id = ${userId} order by created_at`;
  return rows.map((r) => ({ id: str(r.id), name: str(r.name) }));
}
