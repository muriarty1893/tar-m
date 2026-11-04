import { body, handler, invalid, json, requireAppUser } from "@/lib/app-api";
import { ensureProfile } from "@/lib/auth";
import { daysIn, dayKeyOf, monthKey, parseMonth } from "@/lib/farm";
import { fieldOptions, tasksBetween } from "@/lib/farm-data";
import { addTaskFor } from "@/lib/services/farm";
import { trDayKey } from "@/lib/tr-time";

/** Tarım takvimi: the month's tasks (?ay=2026-11, else this month), the fields for the task form, and today in Türkiye. */
export const GET = handler(async (req) => {
  const userId = await requireAppUser(req);
  const today = trDayKey(new Date());
  const month = parseMonth(new URL(req.url).searchParams.get("ay") ?? undefined, today);
  const [tasks, fields] = await Promise.all([tasksBetween(userId, dayKeyOf(month, 1), dayKeyOf(month, daysIn(month))), fieldOptions(userId)]);
  return json({ month: monthKey(month), today, tasks, fields });
});

/** Adds a task: { title, kind, date, time, fieldId }. */
export const POST = handler(async (req) => {
  const userId = await requireAppUser(req);
  await ensureProfile(userId);
  const result = await addTaskFor(userId, await body(req));
  return result.ok ? json({ ok: true }, 201) : invalid({ errors: result.errors });
});
