import type { z } from "zod";
import { fieldErrors } from "./forms";
import { checkRateLimit, clientIp } from "./rateLimit";
import { saveSubmission } from "./services/submissions";

export type SubmitResponse =
  | { ok: true }
  | { ok: false; error: "validation"; fields?: Record<string, string> }
  | { ok: false; error: "rate" | "upstream" };

const MAX_BODY_BYTES = 10_000;

const reply = (body: SubmitResponse, status: number) => Response.json(body, { status });

/** Shared POST handler: rate limit → parse → honeypot → validate → save (read in Yönetim → Başvurular). */
export async function handleSubmission(req: Request, sheet: "partner" | "question" | "source", schema: z.ZodType) {
  if (!checkRateLimit(`${sheet}:${clientIp(req)}`)) return reply({ ok: false, error: "rate" }, 429);

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return reply({ ok: false, error: "validation" }, 400);

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return reply({ ok: false, error: "validation" }, 400);
  }
  if (typeof raw !== "object" || raw === null) return reply({ ok: false, error: "validation" }, 400);

  // Bots that fill the hidden field get a fake success and nothing is stored.
  const trap = (raw as { website?: unknown }).website;
  if (typeof trap === "string" && trap.trim() !== "") return reply({ ok: true }, 200);

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return reply({ ok: false, error: "validation", fields: fieldErrors(parsed.error) }, 400);
  }

  const fields = { ...(parsed.data as Record<string, unknown>) };
  delete fields.website;
  return (await saveSubmission(sheet, fields))
    ? reply({ ok: true }, 200)
    : reply({ ok: false, error: "upstream" }, 502);
}
