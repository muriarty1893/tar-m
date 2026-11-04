"use server";

import { getUserId } from "@/lib/auth";
import { markNotificationsRead } from "@/lib/services/notifications";

/** Opening Bildirimler marks them all as seen. */
export async function markAllRead() {
  const userId = await getUserId();
  if (userId) await markNotificationsRead(userId);
}
