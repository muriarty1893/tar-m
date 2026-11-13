import { ApiError, body, expireTag, handler, json, requireAppAdmin } from "@/lib/app-api";
import { LISTINGS_TAG } from "@/lib/market-data";
import { isModerateAction, moderateFor } from "@/lib/services/admin";

/** { action: "remove" } takes the reported listing down; "dismiss" closes its reports. */
export const POST = handler<{ id: string }>(async (req, { id }) => {
  const adminId = await requireAppAdmin(req);
  const { action } = await body(req);
  if (!isModerateAction(action)) throw new ApiError(400, "Geçersiz işlem.");
  if (await moderateFor(adminId, id, action)) expireTag(LISTINGS_TAG);
  return json({ ok: true });
});
