"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { acceptedReply, declinedReply, offerReply, replyText, seedConversations, unreadCount, type Conversation, type Message } from "@/data/demo-chat";
import { listingById, listingFromDraft, type Listing, type ListingDraft, type ListingStatus } from "@/data/demo-market";
import { demoNow } from "@/lib/demo-clock";

/** How long the other person takes to answer, so the chat feels like a person is typing. */
export const REPLY_DELAY_MS = 1400;

type Data = {
  favorites: string[];
  myListings: Listing[];
  listingStatus: Record<string, ListingStatus>;
  conversations: Conversation[];
};

let seq = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;
const setIn = <T,>(list: T[], v: T, on: boolean) => (on ? (list.includes(v) ? list : [...list, v]) : list.filter((x) => x !== v));
const message = (from: Message["from"], body: Pick<Message, "text" | "offer">): Message => ({ id: newId("m"), from, at: demoNow().toISOString(), ...body });

/** The other side's scripted answer to my last move in a chat (the mobile app's deliverReply). */
function deliver(c: Conversation, listing: Listing): Conversation {
  const pending = c.pending;
  if (!pending) return c;
  let messages = c.messages;
  let body: Pick<Message, "text" | "offer">;
  if (pending.kind === "offer") {
    const mine = messages.find((m) => m.id === pending.messageId)?.offer;
    if (!mine) return { ...c, pending: undefined };
    const answer = offerReply(listing, mine.amount);
    messages = messages.map((m) => (m.id === pending.messageId && m.offer ? { ...m, offer: { ...m.offer, status: answer.status } } : m));
    body = answer.reply;
  } else if (pending.kind === "accepted") body = { text: acceptedReply(listing) };
  else if (pending.kind === "declined") body = { text: declinedReply };
  else body = { text: replyText(listing, pending.text, c.role === "buyer" ? "seller" : "buyer") };
  return { ...c, messages: [...messages, message("them", body)], pending: undefined };
}

/**
 * The demo phone's Pazar and Mesajlar state, for one visit (nothing is saved): favourites, my listings and
 * their status, and the chats, with the other side answering by script after a typing pause.
 */
export function useDemoMarket() {
  const [data, setData] = useState<Data>(() => ({ favorites: [], myListings: [], listingStatus: {}, conversations: seedConversations(demoNow()) }));
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  /** Changes one chat; one with a new message moves to the top of the inbox. */
  const updateChat = useCallback((id: string, fn: (c: Conversation, d: Data) => Conversation, toTop = false) => {
    setData((d) => {
      const c = d.conversations.find((x) => x.id === id);
      if (!c) return d;
      const next = fn(c, d);
      const rest = d.conversations.filter((x) => x.id !== id);
      return { ...d, conversations: toTop ? [next, ...rest] : d.conversations.map((x) => (x.id === id ? next : x)) };
    });
  }, []);

  const scheduleReply = useCallback(
    (id: string) => {
      if (timers.current.has(id)) return;
      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id);
          updateChat(id, (c, d) => {
            const listing = listingById(c.listingId, d.myListings);
            return listing ? deliver(c, listing) : c;
          }, true);
        }, REPLY_DELAY_MS),
      );
    },
    [updateChat],
  );

  const toggleFavorite = useCallback((id: string) => setData((d) => ({ ...d, favorites: setIn(d.favorites, id, !d.favorites.includes(id)) })), []);

  const addListing = (draft: ListingDraft) => {
    const id = newId("u");
    setData((d) => ({ ...d, myListings: [listingFromDraft(draft, id, demoNow()), ...d.myListings] }));
    return id;
  };

  const setListingStatus = (id: string, status: ListingStatus | null) =>
    setData((d) => {
      const next = { ...d.listingStatus };
      if (status) next[id] = status;
      else delete next[id];
      return { ...d, listingStatus: next };
    });

  /** My chat about someone's listing, started if there isn't one yet. */
  const openConversation = (listingId: string) => {
    const existing = data.conversations.find((c) => c.listingId === listingId && c.role === "buyer");
    if (existing) return existing.id;
    const listing = listingById(listingId, data.myListings);
    const chat: Conversation = { id: newId("c"), listingId, peerId: listing?.sellerId ?? "", role: "buyer", messages: [], readAt: demoNow().toISOString() };
    setData((d) => ({ ...d, conversations: [chat, ...d.conversations] }));
    return chat.id;
  };

  const sendText = (id: string, text: string) => {
    updateChat(id, (c) => ({ ...c, messages: [...c.messages, message("me", { text })], pending: { kind: "text", text }, readAt: demoNow().toISOString() }), true);
    scheduleReply(id);
  };

  const sendOffer = (id: string, amount: number) => {
    updateChat(
      id,
      (c) => {
        const m = message("me", { offer: { amount, status: "pending" } });
        // A new offer replaces any of theirs still open.
        const messages = c.messages.map((x) => (x.offer?.status === "pending" ? { ...x, offer: { ...x.offer, status: "rejected" as const } } : x));
        return { ...c, messages: [...messages, m], pending: { kind: "offer", messageId: m.id }, readAt: demoNow().toISOString() };
      },
      true,
    );
    scheduleReply(id);
  };

  /** Accept or turn down their (counter-)offer. */
  const answerOffer = (id: string, messageId: string, accept: boolean) => {
    updateChat(id, (c) => ({
      ...c,
      messages: c.messages.map((x) => (x.id === messageId && x.offer ? { ...x, offer: { ...x.offer, status: accept ? "accepted" : "rejected" } } : x)),
      pending: { kind: accept ? "accepted" : "declined" },
      readAt: demoNow().toISOString(),
    }));
    scheduleReply(id);
  };

  const markRead = useCallback((id: string) => updateChat(id, (c) => ({ ...c, readAt: demoNow().toISOString() })), [updateChat]);

  return {
    ...data,
    unreadChats: data.conversations.filter((c) => unreadCount(c) > 0).length,
    toggleFavorite,
    addListing,
    setListingStatus,
    openConversation,
    sendText,
    sendOffer,
    answerOffer,
    markRead,
  };
}

export type DemoMarket = ReturnType<typeof useDemoMarket>;
