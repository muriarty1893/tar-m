/** A form's messages: field → message. A field without a message has no key, or an empty one. */
export type Errors = Partial<Record<string, string | undefined>>;

/**
 * The form's own checks plus what the server said, leaving out server messages already cleared
 * (a field the person has changed since). `{ title: undefined }` must not count as an error, or the
 * submit button stops without saying why.
 */
export function mergeErrors<T extends Errors>(client: T, server: Errors): T {
  const out: Errors = { ...client };
  for (const [k, v] of Object.entries(server)) if (v) out[k] = v;
  return out as T;
}

/** Whether there's anything to fix. */
export const hasErrors = (e: Errors) => Object.values(e).some(Boolean);
