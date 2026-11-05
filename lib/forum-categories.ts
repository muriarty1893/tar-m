import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { iso, sql, str } from "./db";
import {
  CATEGORY_DESCRIPTION_MAX,
  CATEGORY_ID_RE,
  CATEGORY_NAME_MAX,
  CATEGORY_NAME_MIN,
  FALLBACK_FORUM_CATS,
  type ForumCat,
  type ForumCats,
  type ForumSection,
} from "./forum";
import { fold } from "@/data/demo-market";

/**
 * The forum's categories (sections and sub-categories, r10-style). Read on most forum pages, so the
 * list is cached; the admins' changes on /yonetim/forum refresh it (FORUM_CATS_TAG).
 */

export const FORUM_CATS_TAG = "forum-categories";

type Row = { id: string; parentId: string | null; name: string; description: string; position: number };

function buildTree(rows: Row[]): ForumCats {
  const byPosition = (a: Row, b: Row) => a.position - b.position || a.name.localeCompare(b.name, "tr");
  const plain = (r: Row): ForumCat => ({ id: r.id, parentId: r.parentId, name: r.name, description: r.description });
  const sections: ForumSection[] = rows
    .filter((r) => !r.parentId)
    .sort(byPosition)
    .map((s) => ({ ...plain(s), children: rows.filter((r) => r.parentId === s.id).sort(byPosition).map(plain) }));
  const byId: Record<string, ForumCat> = {};
  for (const s of sections) {
    byId[s.id] = { id: s.id, parentId: null, name: s.name, description: s.description };
    for (const c of s.children) byId[c.id] = c;
  }
  return { sections, byId };
}

export async function forumCategories(): Promise<ForumCats> {
  "use cache";
  cacheLife("hours");
  cacheTag(FORUM_CATS_TAG);
  if (!process.env.DATABASE_URL) return FALLBACK_FORUM_CATS;
  try {
    const rows = await sql()`select id, parent_id, name, description, position from forum_categories`;
    if (!rows.length) return FALLBACK_FORUM_CATS;
    return buildTree(
      rows.map((r) => ({ id: str(r.id), parentId: r.parent_id ? str(r.parent_id) : null, name: str(r.name), description: str(r.description), position: Number(r.position) })),
    );
  } catch (err) {
    // A forum page must not fail because the list can't be read: the six first sections stand in.
    console.error("forumCategories", err);
    return FALLBACK_FORUM_CATS;
  }
}

export type CategoryStats = { topics: number; replies: number; last: { id: string; title: string; authorName: string; at: string } | null };

/** Topics, replies and the latest topic per category (not cached: counts change with every post). */
export async function categoryStats(): Promise<Record<string, CategoryStats>> {
  const [counts, latest] = await Promise.all([
    sql()`select category, count(*) as topics, coalesce(sum(reply_count), 0) as replies from forum_topics group by category`,
    sql()`
      select distinct on (t.category) t.category, t.id, t.title, p.name as author_name, coalesce(t.last_reply_at, t.created_at) as at
      from forum_topics t join profiles p on p.user_id = t.author_id
      order by t.category, coalesce(t.last_reply_at, t.created_at) desc`,
  ]);
  const out: Record<string, CategoryStats> = {};
  for (const r of counts) out[str(r.category)] = { topics: Number(r.topics), replies: Number(r.replies), last: null };
  for (const r of latest) {
    const k = str(r.category);
    out[k] ??= { topics: 0, replies: 0, last: null };
    out[k].last = { id: str(r.id), title: str(r.title), authorName: str(r.author_name) || "Kullanıcı", at: iso(r.at) };
  }
  return out;
}

/** A section's figures with its sub-categories' added in. */
export function sectionTotals(section: ForumSection, stats: Record<string, CategoryStats>): CategoryStats {
  const parts = [section.id, ...section.children.map((c) => c.id)].map((id) => stats[id]).filter(Boolean);
  const last = parts
    .map((p) => p.last)
    .filter((l): l is NonNullable<CategoryStats["last"]> => l !== null)
    .sort((a, b) => b.at.localeCompare(a.at))[0];
  return { topics: parts.reduce((n, p) => n + p.topics, 0), replies: parts.reduce((n, p) => n + p.replies, 0), last: last ?? null };
}

// ---------------------------------------------------------------- Admin: /yonetim/forum

export type CategoryInput = { name: string; description: string; parentId: string };
export type CategoryErrors = Partial<Record<keyof CategoryInput, string>> & { form?: string };

const s = (v: unknown) => (typeof v === "string" ? v : "");

export function cleanCategory(raw: Partial<Record<keyof CategoryInput, unknown>>): CategoryInput {
  return { name: s(raw.name).trim().replace(/\s+/g, " "), description: s(raw.description).trim().replace(/\s+/g, " "), parentId: s(raw.parentId).trim() };
}

function validateCategory(c: CategoryInput): CategoryErrors {
  const e: CategoryErrors = {};
  if (c.name.length < CATEGORY_NAME_MIN) e.name = `Ad en az ${CATEGORY_NAME_MIN} karakter olmalı.`;
  else if (c.name.length > CATEGORY_NAME_MAX) e.name = `Ad en fazla ${CATEGORY_NAME_MAX} karakter olabilir.`;
  if (c.description.length > CATEGORY_DESCRIPTION_MAX) e.description = `Açıklama en fazla ${CATEGORY_DESCRIPTION_MAX} karakter olabilir.`;
  return e;
}

/** The parent must be a section (two levels, as on r10). Empty: none. */
async function checkParent(parentId: string, self?: string): Promise<string | undefined> {
  if (!parentId) return undefined;
  if (parentId === self) return "Bir kategori kendi altına konamaz.";
  const rows = await sql()`select parent_id from forum_categories where id = ${parentId}`;
  if (!rows[0]) return "Üst bölüm bulunamadı.";
  if (rows[0].parent_id) return "Alt kategorilerin altına kategori eklenemez; bir ana bölüm seçin.";
  return undefined;
}

/** "Süt sığırcılığı" → "sut-sigirciligi", with "-2", "-3"… when taken. */
async function freeId(name: string): Promise<string> {
  const base = fold(name).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 34) || "kategori";
  const taken = new Set((await sql()`select id from forum_categories where id = ${base} or id like ${`${base}-%`}`).map((r) => str(r.id)));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  return `${base}-${Date.now().toString(36)}`;
}

export async function createCategoryFor(raw: Partial<Record<keyof CategoryInput, unknown>>): Promise<CategoryErrors | null> {
  const c = cleanCategory(raw);
  const errors = validateCategory(c);
  const parent = await checkParent(c.parentId);
  if (parent) errors.parentId = parent;
  if (Object.keys(errors).length) return errors;
  const id = await freeId(c.name);
  if (!CATEGORY_ID_RE.test(id)) return { form: "Bu adla kategori oluşturulamadı; başka bir ad deneyin." };
  await sql()`
    insert into forum_categories (id, parent_id, name, description, position)
    values (${id}, ${c.parentId || null}, ${c.name}, ${c.description},
      (select coalesce(max(position), 0) + 1 from forum_categories where parent_id is not distinct from ${c.parentId || null}))`;
  return null;
}

/** Renames a category, changes its description, or moves it under another section (or makes it a section). */
export async function updateCategoryFor(id: string, raw: Partial<Record<keyof CategoryInput, unknown>>): Promise<CategoryErrors | null> {
  const c = cleanCategory(raw);
  const errors = validateCategory(c);
  const current = (await sql()`select parent_id, (select count(*) from forum_categories k where k.parent_id = c.id) as children from forum_categories c where id = ${id}`)[0];
  if (!current) return { form: "Kategori bulunamadı." };
  const parent = await checkParent(c.parentId, id);
  if (parent) errors.parentId = parent;
  else if (c.parentId && Number(current.children) > 0) errors.parentId = "Alt kategorileri olan bir bölüm başka bir bölümün altına taşınamaz.";
  if (Object.keys(errors).length) return errors;
  const moved = str(current.parent_id) !== c.parentId;
  await sql()`
    update forum_categories set name = ${c.name}, description = ${c.description}, parent_id = ${c.parentId || null},
      position = case when ${moved}::boolean then (select coalesce(max(position), 0) + 1 from forum_categories where parent_id is not distinct from ${c.parentId || null}) else position end
    where id = ${id}`;
  return null;
}

/** Swaps a category with its neighbour above or below (among its siblings). */
export async function moveCategoryFor(id: string, direction: "up" | "down"): Promise<void> {
  const me = (await sql()`select parent_id from forum_categories where id = ${id}`)[0];
  if (!me) return;
  const siblings = await sql()`select id from forum_categories where parent_id is not distinct from ${me.parent_id} order by position, name`;
  const ids = siblings.map((r) => str(r.id));
  const i = ids.indexOf(id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  // Rewrite every sibling's position, so old gaps and ties don't matter.
  await Promise.all(ids.map((cid, n) => sql()`update forum_categories set position = ${n + 1} where id = ${cid}`));
}

/**
 * Deletes a category. Its sub-categories must go first; its topics move to `moveTo` (required when
 * it has any). The six first sections stay: the mobile app knows them.
 */
export async function deleteCategoryFor(id: string, moveTo: string): Promise<string | null> {
  const row = (await sql()`
    select (select count(*) from forum_categories k where k.parent_id = c.id) as children,
      (select count(*) from forum_topics t where t.category = c.id) as topics
    from forum_categories c where c.id = ${id}`)[0];
  if (!row) return "Kategori bulunamadı.";
  if (FALLBACK_FORUM_CATS.byId[id]) return "İlk altı bölüm silinemez (mobil uygulama bunları kullanıyor); adını değiştirebilirsiniz.";
  if (Number(row.children) > 0) return "Önce bu bölümün alt kategorilerini silin ya da başka bir bölüme taşıyın.";
  if (Number(row.topics) > 0) {
    if (!moveTo || moveTo === id) return "Bu kategorideki konuların taşınacağı kategoriyi seçin.";
    const target = await sql()`select 1 from forum_categories where id = ${moveTo}`;
    if (!target[0]) return "Konuların taşınacağı kategori bulunamadı.";
    await sql()`update forum_topics set category = ${moveTo} where category = ${id}`;
  }
  await sql()`delete from forum_categories where id = ${id}`;
  return null;
}
