import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import { acceptedReply, declinedReply, offerReply, replyText, seedConversations, unreadCount, type Conversation, type Message } from '@/domain/chat';
import { listingById, listingFromDraft, type Listing, type ListingDraft, type ListingStatus } from '@/domain/market';

export type Scan = {
  id: string;
  scenarioId: string;
  /** ISO timestamp */
  date: string;
  /** A local photo uri, or undefined for the scenario's own photo. */
  photo?: string;
};

type Data = {
  scans: Scan[];
  /** Ticked suggestions per scan (indexes into the scenario's suggestions). */
  doneSuggestions: Record<string, number[]>;
  /** Ticked calendar tasks ("YYYY-MM-DD:title"). */
  doneTasks: string[];
  /** Hearted listing ids. */
  favorites: string[];
  /** Listings I posted, newest first (the sample listings live in domain/market). */
  myListings: Listing[];
  /** Sold or removed listings. */
  listingStatus: Record<string, ListingStatus>;
  /** Listing chats, most recent first. */
  conversations: Conversation[];
};

export type AppState = Data & {
  addScan: (scan: Omit<Scan, 'id' | 'date'>, now?: Date) => string;
  setSuggestion: (scanId: string, index: number, done: boolean) => void;
  setTask: (id: string, done: boolean) => void;
  toggleFavorite: (listingId: string) => void;
  addListing: (draft: ListingDraft, now?: Date) => string;
  setListingStatus: (listingId: string, status: ListingStatus | null) => void;
  /** The chat about a listing I want to buy: the existing one, or a new one with its seller. */
  openConversation: (listingId: string, now?: Date) => string;
  sendText: (conversationId: string, text: string, now?: Date) => void;
  sendOffer: (conversationId: string, amount: number, now?: Date) => void;
  /** Accept or turn down their (counter-)offer. */
  answerOffer: (conversationId: string, messageId: string, accept: boolean, now?: Date) => void;
  /** Their scripted answer to my last move, if one is due. */
  deliverReply: (conversationId: string, now?: Date) => void;
  markRead: (conversationId: string, now?: Date) => void;
  /** How many chats have unread messages. */
  unreadChats: () => number;
};

let seq = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

/** The website demo's history: "Bugün, 08:12", "Dün, 17:40", "3 gün önce", "1 hafta önce". */
function seed(now: Date): Data {
  const at = (daysAgo: number, h: number, m: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return {
    scans: [
      { id: 'demo-1', scenarioId: 'bugday-pas', date: at(0, 8, 12) },
      { id: 'demo-2', scenarioId: 'kuru-misir', date: at(1, 17, 40) },
      { id: 'demo-3', scenarioId: 'aycicegi', date: at(3, 9, 30) },
      { id: 'demo-4', scenarioId: 'domates-mildiyo', date: at(7, 11, 0) },
    ],
    doneSuggestions: {},
    doneTasks: [],
    favorites: [],
    myListings: [],
    listingStatus: {},
    conversations: seedConversations(now),
  };
}

const setIn = <T,>(list: T[], v: T, on: boolean) => (on ? (list.includes(v) ? list : [...list, v]) : list.filter((x) => x !== v));

type Set = (fn: (s: AppState) => Partial<AppState>) => void;
type Get = () => AppState;

function actions(set: Set, get: Get): Omit<AppState, keyof Data> {
  /** Changes one chat and moves it to the top of the inbox when it got a new message. */
  const updateChat = (id: string, fn: (c: Conversation) => Conversation, toTop = false) =>
    set((s) => {
      const c = s.conversations.find((x) => x.id === id);
      if (!c) return {};
      const next = fn(c);
      const rest = s.conversations.filter((x) => x.id !== id);
      return { conversations: toTop ? [next, ...rest] : s.conversations.map((x) => (x.id === id ? next : x)) };
    });
  const message = (from: Message['from'], now: Date, body: Pick<Message, 'text' | 'offer'>): Message => ({ id: newId('m'), from, at: now.toISOString(), ...body });

  return {
    addScan: (scan, now = new Date()) => {
      const id = newId('s');
      set((s) => ({ scans: [{ ...scan, id, date: now.toISOString() }, ...s.scans] }));
      return id;
    },
    setSuggestion: (scanId, index, done) =>
      set((s) => ({ doneSuggestions: { ...s.doneSuggestions, [scanId]: setIn(s.doneSuggestions[scanId] ?? [], index, done) } })),
    setTask: (id, done) => set((s) => ({ doneTasks: setIn(s.doneTasks, id, done) })),

    toggleFavorite: (listingId) => set((s) => ({ favorites: setIn(s.favorites, listingId, !s.favorites.includes(listingId)) })),
    addListing: (draft, now = new Date()) => {
      const id = newId('u');
      set((s) => ({ myListings: [listingFromDraft(draft, id, now), ...s.myListings] }));
      return id;
    },
    setListingStatus: (listingId, status) =>
      set((s) => {
        const next = { ...s.listingStatus };
        if (status) next[listingId] = status;
        else delete next[listingId];
        return { listingStatus: next };
      }),

    openConversation: (listingId, now = new Date()) => {
      const existing = get().conversations.find((c) => c.listingId === listingId && c.role === 'buyer');
      if (existing) return existing.id;
      const listing = listingById(listingId, get().myListings);
      const id = newId('c');
      const chat: Conversation = { id, listingId, peerId: listing?.sellerId ?? '', role: 'buyer', messages: [], readAt: now.toISOString() };
      set((s) => ({ conversations: [chat, ...s.conversations] }));
      return id;
    },
    sendText: (id, text, now = new Date()) =>
      updateChat(id, (c) => ({ ...c, messages: [...c.messages, message('me', now, { text })], pending: { kind: 'text', text }, readAt: now.toISOString() }), true),
    sendOffer: (id, amount, now = new Date()) =>
      updateChat(
        id,
        (c) => {
          const m = message('me', now, { offer: { amount, status: 'pending' } });
          // A new offer replaces any of theirs still open.
          const messages = c.messages.map((x) => (x.offer?.status === 'pending' ? { ...x, offer: { ...x.offer, status: 'rejected' as const } } : x));
          return { ...c, messages: [...messages, m], pending: { kind: 'offer', messageId: m.id }, readAt: now.toISOString() };
        },
        true
      ),
    answerOffer: (id, messageId, accept, now = new Date()) =>
      updateChat(id, (c) => ({
        ...c,
        messages: c.messages.map((x) => (x.id === messageId && x.offer ? { ...x, offer: { ...x.offer, status: accept ? 'accepted' : 'rejected' } } : x)),
        pending: { kind: accept ? 'accepted' : 'declined' },
        readAt: now.toISOString(),
      })),
    deliverReply: (id, now = new Date()) => {
      const c = get().conversations.find((x) => x.id === id);
      const listing = c && listingById(c.listingId, get().myListings);
      if (!c?.pending || !listing) return;
      const pending = c.pending;
      updateChat(
        id,
        (chat) => {
          let messages = chat.messages;
          let body: Pick<Message, 'text' | 'offer'>;
          if (pending.kind === 'offer') {
            const mine = messages.find((m) => m.id === pending.messageId)?.offer;
            if (!mine) return { ...chat, pending: undefined };
            const answer = offerReply(listing, mine.amount);
            messages = messages.map((m) => (m.id === pending.messageId && m.offer ? { ...m, offer: { ...m.offer, status: answer.status } } : m));
            body = answer.reply;
          } else if (pending.kind === 'accepted') body = { text: acceptedReply(listing) };
          else if (pending.kind === 'declined') body = { text: declinedReply };
          else body = { text: replyText(listing, pending.text, chat.role === 'buyer' ? 'seller' : 'buyer') };
          return { ...chat, messages: [...messages, message('them', now, body)], pending: undefined };
        },
        true
      );
    },
    markRead: (id, now = new Date()) => updateChat(id, (c) => ({ ...c, readAt: now.toISOString() })),
    unreadChats: () => get().conversations.filter((c) => unreadCount(c) > 0).length,
  };
}

/** A plain store, for tests. */
export function createAppStore(now = new Date()) {
  return createStore<AppState>()((set, get) => ({ ...seed(now), ...actions(set, get) }));
}

/** The app's store, saved on the device. */
export const useAppStore = create<AppState>()(
  persist((set, get) => ({ ...seed(new Date()), ...actions(set, get) }), {
    name: 'ciftci-destek-demo',
    version: 1,
    storage: createJSONStorage(() => AsyncStorage),
    partialize: ({ scans, doneSuggestions, doneTasks, favorites, myListings, listingStatus, conversations }) => ({
      scans,
      doneSuggestions,
      doneTasks,
      favorites,
      myListings,
      listingStatus,
      conversations,
    }),
  })
);
