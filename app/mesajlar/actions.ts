"use server";

import { requireProfile } from "@/lib/auth";
import { offerConversationId, respondToOfferFor, sendMessageFor, sendOfferFor, type ChatResult } from "@/lib/services/chat";
import type { OfferResponse } from "@/lib/market";

export type { ChatResult };

export async function sendMessage(conversationId: string, text: string): Promise<ChatResult> {
  const profile = await requireProfile(`/mesajlar/${conversationId}`);
  return sendMessageFor(profile.userId, conversationId, text);
}

/** The buyer's offer. Sellers answer offers (or counter them); they don't open with one. */
export async function sendOffer(conversationId: string, rawAmount: string): Promise<ChatResult> {
  const profile = await requireProfile(`/mesajlar/${conversationId}`);
  return sendOfferFor(profile.userId, conversationId, rawAmount);
}

/** Accept, turn down or counter the other person's waiting offer. */
export async function respondToOffer(messageId: string, response: OfferResponse, rawCounter = ""): Promise<ChatResult> {
  const conversationId = await offerConversationId(messageId);
  if (!conversationId) return { error: "Teklif bulunamadı." };
  const profile = await requireProfile(`/mesajlar/${conversationId}`);
  return respondToOfferFor(profile.userId, messageId, response, rawCounter);
}
