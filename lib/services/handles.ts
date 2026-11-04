import "server-only";
import { sql, str } from "@/lib/db";
import { handleFromName } from "@/lib/forum";

/**
 * Usernames ("@ahmet"): every profile with a name gets one, made from the name; the person can change
 * it in Hesabım. Taken ones get a number ("ahmet2").
 */
export async function assignHandle(userId: string, name: string): Promise<string | null> {
  const base = handleFromName(name);
  for (let i = 0; i < 12; i++) {
    const candidate = i === 0 ? base : i < 9 ? `${base}${i + 1}` : `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const rows = await sql()`
        update profiles set handle = ${candidate}
        where user_id = ${userId} and handle is null and not exists (select 1 from profiles where handle = ${candidate})
        returning handle`;
      if (rows[0]) return str(rows[0].handle);
    } catch {
      // Someone took it at the same moment (the unique index): try the next one.
    }
    const current = await sql()`select handle from profiles where user_id = ${userId}`;
    if (!current[0]) return null;
    if (current[0].handle) return str(current[0].handle);
  }
  return null;
}

/** Whether a username is free (or already this person's). */
export async function handleFree(userId: string, handle: string): Promise<boolean> {
  const rows = await sql()`select 1 from profiles where handle = ${handle} and user_id <> ${userId}`;
  return rows.length === 0;
}
