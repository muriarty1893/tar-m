"use client";

import { useState } from "react";
import type { z } from "zod";
import { fieldErrors } from "@/lib/forms";
import type { SubmitResponse } from "@/lib/submit";

export type FormStatus = "idle" | "submitting" | "success" | "error";

/** Validates on the client with the same schema as the server, then POSTs JSON. */
export function useFormSubmit<T extends Record<string, unknown>>(endpoint: string, schema: z.ZodType) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(values: T) {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setStatus("idle");
      return;
    }
    setErrors({});
    setStatus("submitting");
    try {
      const res = await fetch(endpoint, {
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
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return { status, errors, submit };
}
