import { ApiError, handler, json, requireAppUser } from "@/lib/app-api";
import { deleteExpenseFor } from "@/lib/services/farm";

export const DELETE = handler<{ id: string }>(async (req, { id }) => {
  const userId = await requireAppUser(req);
  if (!(await deleteExpenseFor(userId, id))) throw new ApiError(404, "Masraf bulunamadı.");
  return json({ ok: true });
});
