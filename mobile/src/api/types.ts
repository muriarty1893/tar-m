/**
 * What the website's API (app/api/app/… on the website) sends and takes. These mirror the website's
 * own types (lib/market-data.ts, lib/chat-data.ts, lib/farm-data.ts, lib/news.ts, lib/services/admin.ts):
 * change both together.
 */
import type { ListingCategory } from '@/domain/market';

export type { ListingCategory };
export type ListingStatus = 'active' | 'sold' | 'removed';
export type Condition = 'sifir' | 'ikinci-el';

/** `handle`: the username for forum mentions ("ahmet"); null until the person has a name. */
export type Me = { id: string; name: string; province: string; handle: string | null; email: string; memberSince: string; admin: boolean };

export type ListingCard = {
  id: string;
  title: string;
  category: ListingCategory;
  price: number;
  unit: string | null;
  province: string;
  district: string;
  /** A photo's full address (the category's stock photo when `stockPhoto`). */
  photo: string;
  stockPhoto: boolean;
  status: ListingStatus;
  createdAt: string;
  sellerId: string;
  favorite: boolean;
};

export type ListingDetail = ListingCard & {
  condition: Condition | null;
  quantity: string | null;
  negotiable: boolean;
  description: string;
  photos: string[];
  updatedAt: string;
  seller: { id: string; name: string; memberSince: string; activeListings: number };
  conversationId: string | null;
  reported: boolean;
  mine: boolean;
};

export type MarketView = 'tumu' | 'favoriler' | 'ilanlarim';
export type MarketSort = 'yeni' | 'ucuz' | 'pahali';
export type MarketQuery = { q: string; kategori: ListingCategory | 'tumu'; il: string; sirala: MarketSort; gorunum: MarketView };
export type ListingPage = { items: ListingCard[]; total: number; page: number; pageSize: number };

export type ListingInput = {
  title: string;
  category: string;
  condition: string;
  price: string;
  unit: string;
  quantity: string;
  negotiable: boolean;
  province: string;
  district: string;
  description: string;
  photos: string[];
};

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';
export type ChatRole = 'buyer' | 'seller';

export type ChatMessage = { id: string; mine: boolean; body: string | null; offer: { amount: number; status: OfferStatus } | null; at: string };

export type Thread = {
  id: string;
  role: ChatRole;
  peer: { name: string };
  listing: { id: string; title: string; price: number; unit: string | null; photo: string; status: ListingStatus };
  messages: ChatMessage[];
  /** When the other person last opened the chat: my messages before it are "Görüldü". */
  peerReadAt: string;
};

export type InboxRow = {
  id: string;
  role: ChatRole;
  peerName: string;
  listingTitle: string;
  listingPhoto: string;
  listingStatus: ListingStatus;
  lastLine: string;
  lastAt: string;
  unread: number;
};

export type TaskKind = 'analiz' | 'toprak' | 'gubre' | 'ilac' | 'ekim' | 'sulama' | 'hasat' | 'uyari' | 'diger';

export type Task = {
  id: string;
  title: string;
  kind: TaskKind;
  /** "2026-11-20" */
  date: string;
  /** "08:30", or "" for a task without a time. */
  time: string;
  done: boolean;
  fieldId: string | null;
  fieldName: string | null;
};

export type CalendarMonth = { month: string; today: string; tasks: Task[]; fields: { id: string; name: string }[] };
export type TaskInput = { title: string; kind: string; date: string; time: string; fieldId: string };

export type LatLng = [lat: number, lng: number];

export type FieldSummary = {
  id: string;
  name: string;
  crop: string;
  stage: string;
  areaDonum: number;
  province: string;
  district: string;
  expectedYieldKg: number | null;
  notes: string;
  expenses: number;
  nextTask: { title: string; date: string } | null;
  boundary: LatLng[] | null;
};

export type ExpenseKind = 'tohum' | 'gubre' | 'ilac' | 'mazot' | 'su' | 'iscilik' | 'diger';
export type Expense = { id: string; kind: ExpenseKind; amount: number; date: string; note: string };
export type FieldDetail = { field: FieldSummary; expenses: Expense[]; tasks: Task[]; today: string };

export type FieldInput = { name: string; crop: string; stage: string; area: string; province: string; district: string; expectedYield: string; notes: string };
export type ExpenseInput = { kind: string; amount: string; date: string; note: string };

export type ArticleSummary = { slug: string; title: string; date: string; summary: string; cover?: string };
export type Article = ArticleSummary & { html: string };
export type ArticleStatus = 'draft' | 'published';
export type AdminArticle = ArticleSummary & { id: string; body: string; status: ArticleStatus; updatedAt: string };
export type ArticleInput = { title: string; slug: string; summary: string; body: string; cover: string; date: string; status: ArticleStatus };

export type AdminCounts = { published: number; drafts: number; reports: number; forumReports: number; listings: number; people: number };
export type ReportedListing = { id: string; title: string; status: string; sellerName: string; count: number; lastAt: string; reasons: string[]; notes: string[] };

/** A form's messages under each field. */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export type ForumCategory = 'bitki' | 'hayvan' | 'makine' | 'destek' | 'pazar' | 'genel';
export type ForumSort = 'yeni' | 'aktif' | 'populer';
export type ForumQuery = { q: string; kategori: ForumCategory | 'tumu'; sirala: ForumSort };

export type TopicCard = {
  id: string;
  title: string;
  category: ForumCategory;
  excerpt: string;
  authorId: string;
  authorName: string;
  authorHandle: string | null;
  createdAt: string;
  replyCount: number;
  likeCount: number;
  lastReplyAt: string | null;
  /** The first photo, for the list. */
  photo: string | null;
  photoCount: number;
};
export type TopicPage = { items: TopicCard[]; total: number; page: number; pageSize: number };
export type ForumReply = {
  id: string;
  /** The reply this one answers; null when it answers the topic. */
  parentId: string | null;
  body: string;
  photos: string[];
  authorId: string;
  authorName: string;
  authorHandle: string | null;
  createdAt: string;
  likeCount: number;
  liked: boolean;
  mine: boolean;
  reported: boolean;
  /** "Bu yanıt silindi": kept because others answered it; no text, photos or author. */
  deleted: boolean;
};
export type TopicDetail = TopicCard & { body: string; photos: string[]; liked: boolean; mine: boolean; reported: boolean; replies: ForumReply[] };
export type TopicInput = { category: string; title: string; body: string };

export type MentionSuggestion = { handle: string; name: string };
export type ForumProfile = { handle: string; name: string; memberSince: string; topicCount: number; replyCount: number };

export type NotificationKind = 'reply' | 'mention';
export type AppNotification = {
  id: string;
  kind: NotificationKind;
  actorName: string;
  actorHandle: string | null;
  topicId: string;
  topicTitle: string;
  replyId: string | null;
  excerpt: string;
  createdAt: string;
  read: boolean;
};
export type ReportedPost = { topicId: string; replyId: string | null; topicTitle: string; text: string; authorName: string; count: number; lastAt: string; reasons: string[]; notes: string[] };
