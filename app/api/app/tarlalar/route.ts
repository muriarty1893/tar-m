import { body, handler, invalid, json, requireAppUser } from "@/lib/app-api";
import { ensureProfile } from "@/lib/auth";
import { listFields } from "@/lib/farm-data";
import { saveBoundaryFor, saveFieldFor } from "@/lib/services/farm";
import { trDayKey } from "@/lib/tr-time";

/** Tarlalarım: every field with its expenses total, next task and map outline. */
export const GET = handler(async (req) => {
  const userId = await requireAppUser(req);
  return json({ fields: await listFields(userId, trDayKey(new Date())) });
});

/** Adds a field: { name, crop, stage, area, province, district, expectedYield, notes, boundary? }. */
export const POST = handler(async (req) => {
  const userId = await requireAppUser(req);
  await ensureProfile(userId);
  const b = await body(req);
  const saved = await saveFieldFor(userId, b, undefined);
  if (!saved.id) return invalid({ errors: saved.errors });
  // An outline drawn before saving goes with the new field; a bad one is just left out.
  if (b.boundary) await saveBoundaryFor(userId, saved.id, b.boundary);
  return json({ id: saved.id }, 201);
});
