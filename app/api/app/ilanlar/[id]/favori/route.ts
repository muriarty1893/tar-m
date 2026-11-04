import { handler, json, requireNamedProfile } from "@/lib/app-api";
import { toggleFavoriteFor } from "@/lib/services/market";

/** Hearts or un-hearts the listing. */
export const POST = handler<{ id: string }>(async (req, { id }) => {
  const profile = await requireNamedProfile(req);
  return json({ favorite: await toggleFavoriteFor(profile.userId, id) });
});
