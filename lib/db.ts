import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * The Neon Postgres client (HTTP, one round trip per query). Created on first use, not at import,
 * so `next build` doesn't need DATABASE_URL until a page actually queries.
 */
let client: NeonQueryFunction<false, false> | null = null;

export function sql() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set: connect the Neon database (vercel env pull).");
    client = neon(url);
  }
  return client;
}

/** A row as the driver returns it. */
export type Row = Record<string, unknown>;

/** Postgres numeric comes back as a string; timestamps as a Date or a string. */
export const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
export const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : v === null || v === undefined ? "" : new Date(String(v)).toISOString());
/**
 * A `date` column as "YYYY-MM-DD". The driver turns a date into local midnight (in the server's time
 * zone), so the day is read back with local getters, not toISOString (which would shift it in UTC+3).
 */
export const day = (v: unknown) => {
  if (!(v instanceof Date)) return String(v ?? "").slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
};
export const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** Whether a string is a UUID (so a bad id in the URL is a 404, not a database error). */
export const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
