import "server-only";
import { del } from "@vercel/blob";
import { sql, str } from "@/lib/db";

/**
 * Who a photo belongs to. Uploads aren't recorded per person, and every photo's address is public (it's
 * in the page), so without these checks anyone could put someone else's photo in their own post, then
 * delete the post and with it, from storage, the other person's photo.
 *
 * - Saving: a photo already in someone else's topic, reply or ad is refused (photosOfOthers).
 * - Deleting: only photos that no topic, reply or ad still shows are removed (deletePhotosNoLongerUsed).
 */

export const PHOTO_OF_OTHERS = "Fotoğraflardan biri başka bir gönderiye ait; kendi fotoğrafınızı yükleyin.";

/** Whether any of these photos is in a topic, reply or ad by someone other than `ownerId`. */
export async function photosOfOthers(urls: string[], ownerId: string): Promise<boolean> {
  if (!urls.length) return false;
  const rows = await sql()`
    select 1 from forum_topics where author_id <> ${ownerId} and photos && ${urls}::text[]
    union all select 1 from forum_replies where author_id <> ${ownerId} and photos && ${urls}::text[]
    union all select 1 from listings where seller_id <> ${ownerId} and photos && ${urls}::text[]
    limit 1`;
  return rows.length > 0;
}

/** Those of these photos that no topic, reply or ad shows any more. */
async function unused(urls: string[]): Promise<string[]> {
  if (!urls.length) return [];
  const rows = await sql()`
    select p from unnest(${urls}::text[]) as p
    where not exists (select 1 from forum_topics where photos @> array[p])
      and not exists (select 1 from forum_replies where photos @> array[p])
      and not exists (select 1 from listings where photos @> array[p])`;
  return rows.map((r) => str(r.p));
}

/**
 * Deletes from storage those of these photos (already taken off their post) that nothing else shows.
 * `isOurs` limits it to the site's own upload folders. Best effort: the post is gone either way.
 */
export async function deletePhotosNoLongerUsed(urls: string[], isOurs: (url: string) => boolean, label: string) {
  try {
    const gone = await unused([...new Set(urls.filter(isOurs))]);
    if (gone.length) await del(gone);
  } catch (err) {
    console.error(`${label}: photos`, err);
  }
}
