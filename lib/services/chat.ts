import "server-only";
import { isUuid, sql } from "@/lib/db";
import { getThread, underMessageLimit, type Thread } from "@/lib/chat-data";
import { MESSAGE_MAX, PRICE_MAX, parsePrice, type OfferResponse } from "@/lib/market";
import { placeOffer } from "./market";

/**
 * Mesajlar's writes, shared by the website's server actions (app/mesajlar/actions.ts) and the mobile
 * app's API. Every one checks that the person is in the conversation.
 */

export type ChatResult = { thread: Thread } | { error: string };

/** The conversation, if `userId` is in it. */
async function openConversation(conversationId: string, userId: string) {
  if (!isUuid(conversationId)) return null;
  const rows = await sql()`
    select c.id, c.buyer_id, l.status from conversations c join listings l on l.id = c.listing_id
    where c.id = ${conversationId} and (c.buyer_id = ${userId} or c.seller_id = ${userId})`;
  return rows[0] ?? null;
}

async function touch(conversationId: string, userId: string, buyerId: unknown) {
  if (buyerId === userId) await sql()`update conversations set last_message_at = now(), buyer_read_at = now() where id = ${conversationId}`;
  else await sql()`update conversations set last_message_at = now(), seller_read_at = now() where id = ${conversationId}`;
}

async function result(conversationId: string, userId: string): Promise<ChatResult> {
  const thread = await getThread(conversationId, userId);
  return thread ? { thread } : { error: "Sohbet bulunamadı." };
}

const readAmount = (raw: unknown) => {
  const amount = parsePrice(String(raw ?? ""));
  return amount > 0 && amount <= PRICE_MAX ? amount : null;
};

/** The conversation an offer message belongs to (to check who may answer it). */
export async function offerConversationId(messageId: string): Promise<string | null> {
  if (!isUuid(messageId)) return null;
  const rows = await sql()`select conversation_id from messages where id = ${messageId} and offer_amount is not null`;
  return rows[0] ? String(rows[0].conversation_id) : null;
}

export async function sendMessageFor(userId: string, conversationId: string, text: unknown): Promise<ChatResult> {
  const body = String(text ?? "").trim();
  if (!body) return { error: "Bir mesaj yazın." };
  if (body.length > MESSAGE_MAX) return { error: `Mesaj en fazla ${MESSAGE_MAX} karakter olabilir.` };
  const c = await openConversation(conversationId, userId);
  if (!c) return { error: "Sohbet bulunamadı." };
  if (c.status === "removed") return { error: "İlan kaldırıldığı için bu sohbete yazılamıyor." };
  if (!(await underMessageLimit(userId))) return { error: "Çok hızlı mesaj gönderdiniz; birkaç dakika sonra yeniden deneyin." };
  await sql()`insert into messages (conversation_id, sender_id, body) values (${conversationId}, ${userId}, ${body})`;
  await touch(conversationId, userId, c.buyer_id);
  return result(conversationId, userId);
}

/** The buyer's offer. Sellers answer offers (or counter them); they don't open with one. */
export async function sendOfferFor(userId: string, conversationId: string, rawAmount: unknown): Promise<ChatResult> {
  const amount = readAmount(rawAmount);
  if (!amount) return { error: "Geçerli bir teklif tutarı girin (ör. 640.000)." };
  const c = await openConversation(conversationId, userId);
  if (!c) return { error: "Sohbet bulunamadı." };
  if (c.buyer_id !== userId) return { error: "Teklifi alıcı verir; siz gelen teklife karşı teklif verebilirsiniz." };
  if (c.status !== "active") return { error: c.status === "sold" ? "Bu ilan satıldı." : "Bu ilan artık yayında değil." };
  if (!(await underMessageLimit(userId))) return { error: "Çok hızlı mesaj gönderdiniz; birkaç dakika sonra yeniden deneyin." };
  await placeOffer(conversationId, userId, amount);
  await touch(conversationId, userId, c.buyer_id);
  return result(conversationId, userId);
}

export const isOfferResponse = (s: unknown): s is OfferResponse => s === "accept" || s === "reject" || s === "counter";

/** Accept, turn down or counter the other person's waiting offer. */
export async function respondToOfferFor(userId: string, messageId: string, response: OfferResponse, rawCounter: unknown = ""): Promise<ChatResult> {
  if (!isUuid(messageId) || !isOfferResponse(response)) return { error: "Teklif bulunamadı." };
  const rows = await sql()`select conversation_id, sender_id, offer_status from messages where id = ${messageId} and offer_amount is not null`;
  const offer = rows[0];
  if (!offer) return { error: "Teklif bulunamadı." };
  const conversationId = String(offer.conversation_id);
  const c = await openConversation(conversationId, userId);
  if (!c) return { error: "Teklif bulunamadı." };
  if (offer.sender_id === userId) return { error: "Kendi teklifinizi yanıtlayamazsınız." };
  if (offer.offer_status !== "pending") return result(conversationId, userId);
  if (c.status === "removed") return { error: "İlan kaldırıldığı için teklif yanıtlanamıyor." };

  if (response === "accept") {
    await sql()`update messages set offer_status = 'accepted' where id = ${messageId} and offer_status = 'pending'`;
  } else if (response === "reject") {
    await sql()`update messages set offer_status = 'rejected' where id = ${messageId} and offer_status = 'pending'`;
  } else {
    const amount = readAmount(rawCounter);
    if (!amount) return { error: "Geçerli bir karşı teklif tutarı girin." };
    await placeOffer(conversationId, userId, amount);
  }
  await touch(conversationId, userId, c.buyer_id);
  return result(conversationId, userId);
}
