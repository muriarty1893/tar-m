import { body, handler, invalid, json, requireNamedProfile } from "@/lib/app-api";
import { FORUM_PAGE_SIZE, parseForumQuery } from "@/lib/forum";
import { listTopics } from "@/lib/forum-data";
import { createTopicFor } from "@/lib/services/forum";
import { connection } from "next/server";

/** The forum: one page of topics for ?q, kategori, sirala (yeni | aktif | populer), sayfa. Public. */
export const GET = handler(async (req) => {
  await connection();
  const query = parseForumQuery(Object.fromEntries(new URL(req.url).searchParams));
  const { items, total } = await listTopics(query);
  return json({ items, total, page: query.sayfa, pageSize: FORUM_PAGE_SIZE });
});

/** "Konu aç": { category, title, body }. */
export const POST = handler(async (req) => {
  const profile = await requireNamedProfile(req);
  const created = await createTopicFor(profile.userId, await body(req));
  return created.ok ? json({ id: created.id }, 201) : invalid({ errors: created.errors, message: created.message });
});
