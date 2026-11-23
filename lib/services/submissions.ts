import "server-only";
import { iso, sql, type Row } from "@/lib/db";

/** What a visitor sent through one of the site's forms (Yönetim → Başvurular). */
export type SubmissionKind = "partner" | "question" | "source";

export type Submission = {
  id: string;
  kind: SubmissionKind;
  data: Record<string, string>;
  createdAt: string;
  read: boolean;
};

/** Keeps a submission; false when the database could not take it (the visitor then sees an error). */
export async function saveSubmission(kind: SubmissionKind, fields: Record<string, unknown>): Promise<boolean> {
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (k === "website" || k === "consent" || v === undefined || v === null || v === "") continue;
    data[k] = String(v);
  }
  try {
    await sql()`insert into submissions (kind, data) values (${kind}, ${JSON.stringify(data)}::jsonb)`;
    return true;
  } catch (err) {
    console.error(`[form] could not save a ${kind} submission:`, err);
    return false;
  }
}

const toSubmission = (r: Row): Submission => ({
  id: String(r.id),
  kind: r.kind as SubmissionKind,
  data: (r.data ?? {}) as Record<string, string>,
  createdAt: iso(r.created_at),
  read: r.read_at !== null && r.read_at !== undefined,
});

/** The newest messages of one kind, unread first. */
export async function listSubmissions(kind: "partner" | "question", limit = 200): Promise<Submission[]> {
  const rows = await sql()`
    select id, kind, data, created_at, read_at from submissions
    where kind = ${kind}
    order by (read_at is null) desc, created_at desc
    limit ${limit}`;
  return rows.map(toSubmission);
}

/** How many visitors gave each answer to "Bizi nereden duydunuz?", and the "Diğer" answers in their words. */
export async function sourceSummary(): Promise<{ counts: Record<string, number>; others: { text: string; createdAt: string }[]; total: number }> {
  const [counts, others] = await Promise.all([
    sql()`select data->>'source' as source, count(*)::int as n from submissions where kind = 'source' group by 1`,
    sql()`select data->>'other' as text, created_at from submissions where kind = 'source' and coalesce(data->>'other', '') <> '' order by created_at desc limit 50`,
  ]);
  const byId: Record<string, number> = {};
  let total = 0;
  for (const r of counts) {
    byId[String(r.source)] = Number(r.n);
    total += Number(r.n);
  }
  return { counts: byId, others: others.map((r) => ({ text: String(r.text), createdAt: iso(r.created_at) })), total };
}

export async function setSubmissionRead(id: string, read: boolean): Promise<void> {
  await sql()`update submissions set read_at = ${read ? new Date().toISOString() : null} where id = ${id} and kind <> 'source'`;
}

/** Deletes a message; returns who sent it, for the admin log. */
export async function deleteSubmission(id: string): Promise<string | null> {
  const rows = await sql()`delete from submissions where id = ${id} and kind <> 'source' returning data->>'name' as name, data->>'email' as email`;
  return rows[0] ? [rows[0].name, rows[0].email].filter(Boolean).join(" · ") : null;
}
