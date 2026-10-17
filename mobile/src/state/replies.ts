import { useAppStore } from './store';

/** How long the other person takes to answer, so the chat feels like a person is typing. */
export const REPLY_DELAY_MS = 1400;

const timers = new Map<string, ReturnType<typeof setTimeout>>();

/** Delivers their scripted answer to my last move, after a typing pause. Repeat calls for a chat wait for the same answer. */
export function scheduleReply(conversationId: string, delay = REPLY_DELAY_MS) {
  if (timers.has(conversationId)) return;
  timers.set(
    conversationId,
    setTimeout(() => {
      timers.delete(conversationId);
      useAppStore.getState().deliverReply(conversationId);
    }, delay)
  );
}
