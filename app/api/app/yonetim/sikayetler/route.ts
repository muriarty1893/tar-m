import { handler, json, requireAppAdmin } from "@/lib/app-api";
import { openReports } from "@/lib/services/admin";

/** Open reports, the most reported listing first. */
export const GET = handler(async (req) => {
  await requireAppAdmin(req);
  return json({ items: await openReports() });
});
