import { ApiError, body, handler, json, requireAppUser } from "@/lib/app-api";
import { deleteTaskFor, setTaskDoneFor } from "@/lib/services/farm";

/** Ticks or unticks a task: { done }. */
export const PATCH = handler<{ id: string }>(async (req, { id }) => {
  const userId = await requireAppUser(req);
  const { done } = await body(req);
  if (!(await setTaskDoneFor(userId, id, done === true))) throw new ApiError(404, "İş bulunamadı.");
  return json({ ok: true });
});

export const DELETE = handler<{ id: string }>(async (req, { id }) => {
  const userId = await requireAppUser(req);
  if (!(await deleteTaskFor(userId, id))) throw new ApiError(404, "İş bulunamadı.");
  return json({ ok: true });
});
