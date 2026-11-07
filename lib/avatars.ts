import "server-only";
import { createClerkClient } from "@clerk/nextjs/server";
import { cacheLife } from "next/cache";

/**
 * Profile photos, shown beside people's names (topics, replies, the seller box, chats, Bildirimler).
 * They live in Clerk: the photo someone set in Hesabım, or the one their Google account brought.
 * People without one, sample members ("demo_…") and any Clerk trouble fall back to initials.
 */

/** Photos are served by Clerk from this host (next.config.ts allows it for next/image). */
const PHOTO_HOST = "img.clerk.com";
const CLERK_BATCH = 100;
const TIMEOUT_MS = 2500;

/**
 * One Clerk call for a whole list of people, kept for an hour. `clerkClient()` reads the request,
 * which a cached function may not, so this makes its own client from the secret key.
 */
async function clerkPhotos(ids: string[]): Promise<Record<string, string>> {
  "use cache";
  cacheLife("hours");
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const { data } = await clerk.users.getUserList({ userId: ids, limit: ids.length });
  const photos: Record<string, string> = {};
  for (const u of data) {
    if (u.hasImage && URL.canParse(u.imageUrl) && new URL(u.imageUrl).hostname === PHOTO_HOST) photos[u.id] = u.imageUrl;
  }
  return photos;
}

/** Photo addresses by user id, for those of these people who have one. Never throws. */
export async function photosOf(userIds: Iterable<string>): Promise<Record<string, string>> {
  const ids = [...new Set(userIds)].filter((id) => id.startsWith("user_")).sort();
  if (!ids.length || !process.env.CLERK_SECRET_KEY) return {};
  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += CLERK_BATCH) batches.push(ids.slice(i, i + CLERK_BATCH));
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // A slow Clerk must not hold the page: after the time limit everyone gets initials.
    const late = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Clerk photo lookup timed out")), TIMEOUT_MS);
    });
    const found = await Promise.race([Promise.all(batches.map(clerkPhotos)), late]);
    return Object.assign({}, ...found);
  } catch (err) {
    console.error("[avatars]", err);
    return {};
  } finally {
    clearTimeout(timer);
  }
}

/** One person's photo, or null. */
export async function photoOf(userId: string): Promise<string | null> {
  return (await photosOf([userId]))[userId] ?? null;
}
