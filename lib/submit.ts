import type { z } from "zod";
import { fieldErrors, neutraliseFormula } from "./forms";
import { checkRateLimit, clientIp } from "./rateLimit";

export type SubmitResponse =
  | { ok: true }
  | { ok: false; error: "validation"; fields?: Record<string, string> }
  | { ok: false; error: "rate" | "upstream" };

const MAX_BODY_BYTES = 10_000;
const UPSTREAM_TIMEOUT_MS = 8_000;

const reply = (body: SubmitResponse, status: number) => Response.json(body, { status });

async function forward(sheet: string, fields: Record<string, unknown>): Promise<boolean> {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    console.error("[form] APPS_SCRIPT_URL is not set; submission dropped.");
    return false;
  }
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) row[k] = typeof v === "string" ? neutraliseFormula(v) : v;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sheet,
        secret: process.env.APPS_SCRIPT_SECRET ?? "",
        ...row,
        submittedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    // Apps Script answers 200 even for its own error pages, so require an explicit {"ok":true}.
    const answer = res.ok ? await res.json().catch(() => null) : null;
    if (answer?.ok === true) return true;
    console.error(`[form] Apps Script rejected the submission (HTTP ${res.status}).`);
    return false;
  } catch (err) {
    console.error("[form] Apps Script request failed:", err);
    return false;
  }
}

/** Shared POST handler: rate limit → parse → honeypot → validate → forward to Google Sheets. */
export async function handleSubmission(req: Request, sheet: "waitlist" | "partner", schema: z.ZodType) {
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
  return (await forward(sheet, fields))
    ? reply({ ok: true }, 200)
    : reply({ ok: false, error: "upstream" }, 502);
}
