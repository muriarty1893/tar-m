import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { sql, str } from "./db";

/**
 * The home page's two ad spaces (Yönetim → Reklam): the sponsor strip and the "Bu alanda reklam
 * vermek için" box. Read on every home page view, so cached and refreshed when an admin saves.
 */

export const SLOTS_TAG = "site-slots";

export type SlotId = "sponsor" | "reklam";
export type Slot = { id: SlotId; enabled: boolean; name: string; text: string; url: string; sample: boolean };
export type SlotInput = Omit<Slot, "id">;
export type SlotErrors = Partial<Record<keyof SlotInput, string>>;

export const isSlotId = (v: unknown): v is SlotId => v === "sponsor" || v === "reklam";

/** What the site showed before the table existed: also used if the database can't be read. */
export const DEFAULT_SLOTS: Record<SlotId, Slot> = {
  sponsor: { id: "sponsor", enabled: true, name: "sukocu.com", text: "Yakıtsız, elektriksiz su pompası", url: "", sample: true },
  reklam: { id: "reklam", enabled: true, name: "İletişim", text: "Bu alanda reklam vermek için", url: "/is-birligi", sample: false },
};

export async function getSlots(): Promise<Record<SlotId, Slot>> {
  "use cache";
  cacheLife("hours");
  cacheTag(SLOTS_TAG);
  if (!process.env.DATABASE_URL) return DEFAULT_SLOTS;
  try {
    const rows = await sql()`select id, enabled, name, text, url, sample from site_slots`;
    const out = { ...DEFAULT_SLOTS };
    for (const r of rows) {
      const id = str(r.id);
      if (isSlotId(id)) out[id] = { id, enabled: r.enabled === true, name: str(r.name), text: str(r.text), url: str(r.url), sample: r.sample === true };
    }
    return out;
  } catch (err) {
    console.error("site_slots", err);
    return DEFAULT_SLOTS;
  }
}

/** A link on this site ("/is-birligi") or an https address; anything else (javascript:, http:) is refused. */
export const isSlotUrl = (url: string) => url === "" || (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\")) || /^https:\/\/[^\s/$.?#][^\s]*$/i.test(url);

export function cleanSlot(raw: Partial<Record<keyof SlotInput, unknown>>): SlotInput {
  const s = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
  return { enabled: raw.enabled === true || raw.enabled === "on", name: s(raw.name), text: s(raw.text), url: s(raw.url), sample: raw.sample === true || raw.sample === "on" };
}

export function validateSlot(id: SlotId, v: SlotInput): SlotErrors {
  const e: SlotErrors = {};
  if (v.name.length > 60) e.name = "En fazla 60 karakter.";
  if (v.text.length > 120) e.text = "En fazla 120 karakter.";
  if (v.url.length > 300) e.url = "En fazla 300 karakter.";
  else if (!isSlotUrl(v.url)) e.url = "https:// ile başlayan bir adres ya da sitedeki bir sayfa (ör. /is-birligi) yazın.";
  if (v.enabled) {
    if (id === "sponsor" && !v.name) e.name = "Sponsorun adını yazın.";
    if (!v.text) e.text = "Gösterilecek yazıyı girin.";
    if (id === "reklam" && !v.url) e.url = "Kutunun açacağı sayfayı yazın.";
  }
  return e;
}

export async function saveSlotFor(adminId: string, id: SlotId, v: SlotInput) {
  await sql()`
    insert into site_slots (id, enabled, name, text, url, sample, updated_at, updated_by)
    values (${id}, ${v.enabled}, ${v.name}, ${v.text}, ${v.url}, ${v.sample}, now(), ${adminId})
    on conflict (id) do update set enabled = excluded.enabled, name = excluded.name, text = excluded.text, url = excluded.url,
      sample = excluded.sample, updated_at = now(), updated_by = excluded.updated_by`;
}
