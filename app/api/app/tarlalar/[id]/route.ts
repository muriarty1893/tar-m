import { ApiError, body, handler, invalid, json, requireAppUser } from "@/lib/app-api";
import { getField, upcomingTasks } from "@/lib/farm-data";
import { deleteFieldFor, saveFieldFor } from "@/lib/services/farm";
import { trDayKey } from "@/lib/tr-time";

/** A field: its facts and outline, this season's expenses and its upcoming tasks. */
export const GET = handler<{ id: string }>(async (req, { id }) => {
  const userId = await requireAppUser(req);
  const today = trDayKey(new Date());
  const data = await getField(id, userId, today);
  if (!data) throw new ApiError(404, "Tarla bulunamadı.");
  const tasks = await upcomingTasks(userId, today, 6, id);
  return json({ ...data, tasks, today });
});

/** Saves changes to the field's facts (the outline has its own address, …/sinir). */
export const PUT = handler<{ id: string }>(async (req, { id }) => {
  const userId = await requireAppUser(req);
  const saved = await saveFieldFor(userId, await body(req), id);
  return saved.id ? json({ id }) : invalid({ errors: saved.errors });
});

/** Deletes the field and its expenses; its tasks stay on the calendar, without the field. */
export const DELETE = handler<{ id: string }>(async (req, { id }) => {
  const userId = await requireAppUser(req);
  if (!(await deleteFieldFor(userId, id))) throw new ApiError(404, "Tarla bulunamadı.");
  return json({ ok: true });
});
