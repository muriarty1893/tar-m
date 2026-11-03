"use server";

import { refresh, updateTag } from "next/cache";
import { getUserId, isAdmin } from "@/lib/auth";
import { isUuid, sql } from "@/lib/db";
import { LISTINGS_TAG } from "@/lib/market-data";

/** A moderator removes the reported listing, or dismisses its reports. Either way they are closed. */
export async function moderate(listingId: string, action: "remove" | "dismiss") {
  const userId = await getUserId();
  if (!isAdmin(userId) || !isUuid(listingId)) return;
  if (action === "remove") {
    await sql()`update listings set status = 'removed', updated_at = now() where id = ${listingId}`;
    updateTag(LISTINGS_TAG);
  }
  await sql()`update reports set resolved_at = now() where listing_id = ${listingId} and resolved_at is null`;
  refresh();
}
