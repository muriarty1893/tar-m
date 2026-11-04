import { body, handler, invalid, json, requireNamedProfile } from "@/lib/app-api";
import { startConversationFor } from "@/lib/services/market";

/** A buyer's first message or offer on a listing ({ text } or { offer }); answers with the chat's id. */
export const POST = handler<{ id: string }>(async (req, { id }) => {
  const profile = await requireNamedProfile(req);
  const b = await body(req);
  const started = await startConversationFor(profile.userId, id, b.text, b.offer);
  return started.ok ? json({ conversationId: started.conversationId }, 201) : invalid({ message: started.message });
});
