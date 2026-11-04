import { body, handler, invalid, json, requireNamedProfile } from "@/lib/app-api";
import { reportListingFor } from "@/lib/services/market";

/** "İlanı şikâyet et": { reason, note }. */
export const POST = handler<{ id: string }>(async (req, { id }) => {
  const profile = await requireNamedProfile(req);
  const b = await body(req);
  const result = await reportListingFor(profile.userId, id, String(b.reason ?? ""), String(b.note ?? ""));
  return result.ok ? json({ ok: true }) : invalid({ message: result.message });
});
