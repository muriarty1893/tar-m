import { currentUser } from "@clerk/nextjs/server";
import { ApiError, appUserId, body, expireTag, handler, invalid, json, requireAppUser } from "@/lib/app-api";
import { ensureProfile, isAdmin } from "@/lib/auth";
import { unreadConversations } from "@/lib/chat-data";
import { LISTINGS_TAG } from "@/lib/market-data";
import { deleteAccountFor, updateProfileFor } from "@/lib/services/account";

/** The app's "who am I": the profile (created on first use), admin rights and the unread count. Signed out: { user: null }. */
async function me(userId: string) {
  const [profile, admin, unread, user] = await Promise.all([ensureProfile(userId), isAdmin(userId), unreadConversations(userId), currentUser()]);
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? "";
  return { user: { id: userId, name: profile.name, province: profile.province, handle: profile.handle, email, memberSince: profile.createdAt, admin }, unread };
}

export const GET = handler(async (req) => {
  const userId = await appUserId(req);
  return json(userId ? await me(userId) : { user: null, unread: 0 });
});

/** Hesabım: the name other people see, the home province and (when sent) the username for mentions. */
export const PATCH = handler(async (req) => {
  const userId = await requireAppUser(req);
  const b = await body(req);
  const { errors } = await updateProfileFor(userId, b.name, b.province, typeof b.handle === "string" ? b.handle : undefined);
  if (Object.keys(errors).length) return invalid({ errors });
  expireTag(LISTINGS_TAG);
  return json(await me(userId));
});

/** Deletes the account and everything in it (KVKK). The app must send { confirm: true }. */
export const DELETE = handler(async (req) => {
  const userId = await requireAppUser(req);
  const b = await body(req);
  if (b.confirm !== true) throw new ApiError(400, "Silmek için onay kutusunu işaretleyin.");
  await deleteAccountFor(userId);
  expireTag(LISTINGS_TAG);
  return json({ ok: true });
});
