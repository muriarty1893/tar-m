import { body, handler, invalid, json, requireAppUser } from "@/lib/app-api";
import { saveBoundaryFor } from "@/lib/services/farm";

/** The outline drawn on the map: { boundary: [[lat, lng], …] }, or { boundary: null } to clear it. */
export const PUT = handler<{ id: string }>(async (req, { id }) => {
  const userId = await requireAppUser(req);
  const { boundary } = await body(req);
  const result = await saveBoundaryFor(userId, id, boundary ?? null);
  return result.ok ? json({ ok: true }) : invalid({ message: result.message });
});
