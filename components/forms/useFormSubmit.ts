"use client";

import { useState } from "react";
import type { SubmitResponse } from "@/lib/submit";

export type FormStatus = "idle" | "submitting" | "success" | "error" | "rate";
export type FormKind = "waitlist" | "partner" | "question";

/**
 * Validates on the client with the same schema as the server, then POSTs JSON.
 * The schemas (and zod) are imported on first submit so they stay out of the initial page load.
 */
export function useFormSubmit<T extends Record<string, unknown>>(kind: FormKind) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(values: T) {
    setStatus("submitting");
    try {
      const forms = await import("@/lib/forms");
      const schema = { waitlist: forms.waitlistSchema, partner: forms.partnerSchema, question: forms.questionSchema }[kind];
      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        setErrors(forms.fieldErrors(parsed.error));
        setStatus("idle");
        return;
      }
      setErrors({});
      const res = await fetch(`/api/${kind}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await res.json().catch(() => null)) as SubmitResponse | null;
      if (body?.ok) {
        setStatus("success");
        return;
      }
      if (body && body.error === "validation" && body.fields) setErrors(body.fields);
      setStatus(body?.error === "rate" ? "rate" : "error");
    } catch {
      setStatus("error");
    }
  }

  return { status, errors, submit };
}
