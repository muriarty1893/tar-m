import { absolute, handler, json, requireAppUser } from "@/lib/app-api";
import { listInbox } from "@/lib/chat-data";

/** The inbox: ?rol=all | buyer | seller, latest first. */
export const GET = handler(async (req) => {
  const userId = await requireAppUser(req);
  const rol = new URL(req.url).searchParams.get("rol");
  const role = rol === "buyer" || rol === "seller" ? rol : "all";
  const items = await listInbox(userId, role);
  return json({ items: items.map((c) => ({ ...c, listingPhoto: absolute(req, c.listingPhoto) })) });
});
