import { body, handler, invalid, json, requireAppUser } from "@/lib/app-api";
import { addExpenseFor } from "@/lib/services/farm";

/** Adds an expense to the field: { kind, amount, date, note }. */
export const POST = handler<{ id: string }>(async (req, { id }) => {
  const userId = await requireAppUser(req);
  const result = await addExpenseFor(userId, id, await body(req));
  return result.ok ? json({ ok: true }, 201) : invalid({ errors: result.errors });
});
