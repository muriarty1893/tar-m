import { body, handler, json, requireAppAdmin } from "@/lib/app-api";
import { BODY_MAX, renderMarkdown } from "@/lib/news";

/** The editor's "Önizleme": { body } (Markdown) as the sanitized HTML the site shows. */
export const POST = handler(async (req) => {
  await requireAppAdmin(req);
  const b = await body(req);
  return json({ html: renderMarkdown(String(b.body ?? "").slice(0, BODY_MAX)) });
});
