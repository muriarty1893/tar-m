import { ApiError, absolute, body, handler, invalid, json, requireAppUser, requireNamedProfile } from "@/lib/app-api";
import { getThread, type Thread } from "@/lib/chat-data";
import { sendMessageFor, sendOfferFor, type ChatResult } from "@/lib/services/chat";

const withPhoto = (req: Request, t: Thread) => ({ ...t, listing: { ...t.listing, photo: absolute(req, t.listing.photo) } });
const reply = (req: Request, r: ChatResult) => ("thread" in r ? json({ thread: withPhoto(req, r.thread) }) : invalid({ error: r.error }));

/** The chat (marked read); the open chat polls this every few seconds. */
export const GET = handler<{ id: string }>(async (req, { id }) => {
  const userId = await requireAppUser(req);
  const thread = await getThread(id, userId);
  if (!thread) throw new ApiError(404, "Sohbet bulunamadı.");
  return json({ thread: withPhoto(req, thread) });
});

/** { text } sends a message; { offer } the buyer's offer. Answers with the chat as it is now. */
export const POST = handler<{ id: string }>(async (req, { id }) => {
  const profile = await requireNamedProfile(req);
  const b = await body(req);
  return reply(req, b.offer !== undefined ? await sendOfferFor(profile.userId, id, b.offer) : await sendMessageFor(profile.userId, id, b.text));
});
