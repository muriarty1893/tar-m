"use server";

import { requireProfile } from "@/lib/auth";
import { isUuid, sql } from "@/lib/db";
import { getThread, underMessageLimit, type Thread } from "@/lib/chat-data";
import { MESSAGE_MAX, PRICE_MAX, parsePrice, type OfferResponse } from "@/lib/market";

export type ChatResult = { thread: Thread } | { error: string };

/** The conversation, if `userId` is in it and its listing hasn't been removed. */
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

export async function sendMessage(conversationId: string, text: string): Promise<ChatResult> {
  const profile = await requireProfile(`/mesajlar/${conversationId}`);
  const body = String(text ?? "").trim();
  if (!body) return { error: "Bir mesaj yazın." };
  if (body.length > MESSAGE_MAX) return { error: `Mesaj en fazla ${MESSAGE_MAX} karakter olabilir.` };
  const c = await openConversation(conversationId, profile.userId);
  if (!c) return { error: "Sohbet bulunamadı." };
  if (c.status === "removed") return { error: "İlan kaldırıldığı için bu sohbete yazılamıyor." };
  if (!(await underMessageLimit(profile.userId))) return { error: "Çok hızlı mesaj gönderdiniz; birkaç dakika sonra yeniden deneyin." };
  await sql()`insert into messages (conversation_id, sender_id, body) values (${conversationId}, ${profile.userId}, ${body})`;
  await touch(conversationId, profile.userId, c.buyer_id);
  return result(conversationId, profile.userId);
}

/** A new offer replaces the sender's waiting one and counters the other side's. */
async function placeOffer(conversationId: string, userId: string, amount: number) {
  await sql()`update messages set offer_status = 'withdrawn' where conversation_id = ${conversationId} and offer_status = 'pending' and sender_id = ${userId}`;
  await sql()`update messages set offer_status = 'countered' where conversation_id = ${conversationId} and offer_status = 'pending'`;
  await sql()`insert into messages (conversation_id, sender_id, offer_amount, offer_status) values (${conversationId}, ${userId}, ${amount}, 'pending')`;
}

const readAmount = (raw: string) => {
  const amount = parsePrice(String(raw ?? ""));
  return amount > 0 && amount <= PRICE_MAX ? amount : null;
};

/** The buyer's offer. Sellers answer offers (or counter them); they don't open with one. */
export async function sendOffer(conversationId: string, rawAmount: string): Promise<ChatResult> {
  const profile = await requireProfile(`/mesajlar/${conversationId}`);
  const amount = readAmount(rawAmount);
  if (!amount) return { error: "Geçerli bir teklif tutarı girin (ör. 640.000)." };
  const c = await openConversation(conversationId, profile.userId);
  if (!c) return { error: "Sohbet bulunamadı." };
  if (c.buyer_id !== profile.userId) return { error: "Teklifi alıcı verir; siz gelen teklife karşı teklif verebilirsiniz." };
  if (c.status !== "active") return { error: c.status === "sold" ? "Bu ilan satıldı." : "Bu ilan artık yayında değil." };
  if (!(await underMessageLimit(profile.userId))) return { error: "Çok hızlı mesaj gönderdiniz; birkaç dakika sonra yeniden deneyin." };
  await placeOffer(conversationId, profile.userId, amount);
  await touch(conversationId, profile.userId, c.buyer_id);
  return result(conversationId, profile.userId);
}

/** Accept, turn down or counter the other person's waiting offer. */
export async function respondToOffer(messageId: string, response: OfferResponse, rawCounter = ""): Promise<ChatResult> {
  if (!isUuid(messageId)) return { error: "Teklif bulunamadı." };
  const rows = await sql()`select conversation_id, sender_id, offer_status from messages where id = ${messageId} and offer_amount is not null`;
  const offer = rows[0];
  if (!offer) return { error: "Teklif bulunamadı." };
  const conversationId = String(offer.conversation_id);
  const profile = await requireProfile(`/mesajlar/${conversationId}`);
  const c = await openConversation(conversationId, profile.userId);
  if (!c) return { error: "Teklif bulunamadı." };
  if (offer.sender_id === profile.userId) return { error: "Kendi teklifinizi yanıtlayamazsınız." };
  if (offer.offer_status !== "pending") return { ...(await result(conversationId, profile.userId)) };
  if (c.status === "removed") return { error: "İlan kaldırıldığı için teklif yanıtlanamıyor." };

  if (response === "accept") {
    await sql()`update messages set offer_status = 'accepted' where id = ${messageId} and offer_status = 'pending'`;
  } else if (response === "reject") {
    await sql()`update messages set offer_status = 'rejected' where id = ${messageId} and offer_status = 'pending'`;
  } else {
    const amount = readAmount(rawCounter);
    if (!amount) return { error: "Geçerli bir karşı teklif tutarı girin." };
    await placeOffer(conversationId, profile.userId, amount);
  }
  await touch(conversationId, profile.userId, c.buyer_id);
  return result(conversationId, profile.userId);
}
