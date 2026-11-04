import { useAuth } from '@clerk/expo';
import { QueryClient, focusManager, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

import { ApiError, api } from './client';
import type {
  AdminArticle,
  AdminCounts,
  Article,
  ArticleSummary,
  CalendarMonth,
  ForumQuery,
  FieldDetail,
  FieldSummary,
  InboxRow,
  ListingDetail,
  ListingPage,
  MarketQuery,
  Me,
  ReportedListing,
  ReportedPost,
  Thread,
  TopicDetail,
  TopicPage,
} from './types';

/** The app's cache of the website's data. Lists are fresh for 30 s; a failed call is retried once (never for 4xx). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, err) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 1,
    },
  },
});

// Polling (chats, the unread badge) pauses while the app is in the background.
if (Platform.OS !== 'web') {
  focusManager.setEventListener((setFocused) => {
    const sub = AppState.addEventListener('change', (s) => setFocused(s === 'active'));
    return () => sub.remove();
  });
}

/** Query keys, so a change refreshes exactly what it touched. */
export const keys = {
  me: ['me'] as const,
  unread: ['unread'] as const,
  listings: ['listings'] as const,
  listing: (id: string) => ['listing', id] as const,
  inbox: ['inbox'] as const,
  thread: (id: string) => ['thread', id] as const,
  calendar: ['calendar'] as const,
  fields: ['fields'] as const,
  field: (id: string) => ['field', id] as const,
  news: ['news'] as const,
  article: (slug: string) => ['article', slug] as const,
  admin: ['admin'] as const,
  forum: ['forum'] as const,
  topic: (id: string) => ['topic', id] as const,
};

/** Refreshes these parts of the cache (after a change). */
export const refresh = (...parts: (readonly unknown[])[]) => Promise.all(parts.map((queryKey) => queryClient.invalidateQueries({ queryKey })));

/** Whether Clerk has loaded and someone is signed in. */
export function useSignedIn() {
  const { isLoaded, isSignedIn } = useAuth();
  return { loaded: isLoaded, signedIn: isLoaded && !!isSignedIn };
}

export function useMe() {
  const { loaded, signedIn } = useSignedIn();
  return useQuery({
    queryKey: [...keys.me, signedIn],
    queryFn: () => api<{ user: Me | null; unread: number }>('/ben'),
    enabled: loaded && signedIn,
    select: (d) => d.user,
  });
}

/** Chats with unread messages, for the bell and the Mesajlar switch; checked every 30 s. */
export function useUnread() {
  const { signedIn } = useSignedIn();
  const q = useQuery({ queryKey: keys.unread, queryFn: () => api<{ count: number }>('/okunmamis'), enabled: signedIn, refetchInterval: 30_000 });
  return signedIn ? (q.data?.count ?? 0) : 0;
}

const marketParams = (q: MarketQuery, page: number) => {
  const p = new URLSearchParams();
  if (q.q.trim()) p.set('q', q.q.trim());
  if (q.kategori !== 'tumu') p.set('kategori', q.kategori);
  if (q.il) p.set('il', q.il);
  if (q.sirala !== 'yeni') p.set('sirala', q.sirala);
  if (q.gorunum !== 'tumu') p.set('gorunum', q.gorunum);
  if (page > 1) p.set('sayfa', String(page));
  const s = p.toString();
  return s ? `?${s}` : '';
};

/**
 * Pazar's listings, a page (24) at a time. Public, but they carry the person's hearts, so they wait
 * for sign-in to load: a call made before it would go out without the account.
 */
export function useListings(q: MarketQuery, enabled = true) {
  const { loaded } = useSignedIn();
  return useInfiniteQuery({
    queryKey: [...keys.listings, q],
    queryFn: ({ pageParam }) => api<ListingPage>(`/ilanlar${marketParams(q, pageParam)}`),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page * last.pageSize < last.total && last.page < 100 ? last.page + 1 : undefined),
    enabled: enabled && loaded,
  });
}

/** A listing; public, but "mine", the heart and the report mark need the account (see useListings). */
export function useListing(id: string) {
  const { loaded } = useSignedIn();
  return useQuery({ queryKey: keys.listing(id), queryFn: () => api<{ listing: ListingDetail; admin: boolean }>(`/ilanlar/${id}`), enabled: loaded && !!id });
}

export function useInbox(role: 'all' | 'buyer' | 'seller') {
  const { signedIn } = useSignedIn();
  return useQuery({ queryKey: [...keys.inbox, role], queryFn: () => api<{ items: InboxRow[] }>(`/mesajlar?rol=${role}`), enabled: signedIn, refetchInterval: 30_000, select: (d) => d.items });
}

/** An open chat, checked every 4 s for new messages and answers to offers (as on the website). */
export function useThread(id: string) {
  const { signedIn } = useSignedIn();
  return useQuery({ queryKey: keys.thread(id), queryFn: () => api<{ thread: Thread }>(`/mesajlar/${id}`), enabled: signedIn && !!id, refetchInterval: 4000, select: (d) => d.thread });
}

/** "2026-11" */
export function useCalendar(month: string) {
  const { signedIn } = useSignedIn();
  return useQuery({ queryKey: [...keys.calendar, month], queryFn: () => api<CalendarMonth>(`/takvim?ay=${month}`), enabled: signedIn, placeholderData: (prev) => prev });
}

export function useFields() {
  const { signedIn } = useSignedIn();
  return useQuery({ queryKey: keys.fields, queryFn: () => api<{ fields: FieldSummary[] }>('/tarlalar'), enabled: signedIn, select: (d) => d.fields });
}

export function useField(id: string) {
  const { signedIn } = useSignedIn();
  return useQuery({ queryKey: keys.field(id), queryFn: () => api<FieldDetail>(`/tarlalar/${id}`), enabled: signedIn && !!id });
}

export function useNews() {
  return useQuery({ queryKey: keys.news, queryFn: () => api<{ items: ArticleSummary[] }>('/haberler'), select: (d) => d.items, staleTime: 5 * 60_000 });
}

export function useArticle(slug: string) {
  return useQuery({ queryKey: keys.article(slug), queryFn: () => api<{ article: Article }>(`/haberler/${slug}`), enabled: !!slug, select: (d) => d.article, staleTime: 5 * 60_000 });
}

export function useAdminOverview(enabled: boolean) {
  return useQuery({ queryKey: [...keys.admin, 'overview'], queryFn: () => api<{ counts: AdminCounts; articles: AdminArticle[] }>('/yonetim'), enabled });
}

export function useAdminNews(enabled: boolean) {
  return useQuery({ queryKey: [...keys.admin, 'news'], queryFn: () => api<{ items: AdminArticle[] }>('/yonetim/haberler'), enabled, select: (d) => d.items });
}

export function useAdminArticle(id: string) {
  return useQuery({ queryKey: [...keys.admin, 'article', id], queryFn: () => api<{ article: AdminArticle }>(`/yonetim/haberler/${id}`), enabled: !!id, select: (d) => d.article, staleTime: Infinity });
}

export function useReports(enabled: boolean) {
  return useQuery({ queryKey: [...keys.admin, 'reports'], queryFn: () => api<{ items: ReportedListing[] }>('/yonetim/sikayetler'), enabled, select: (d) => d.items });
}

const forumParams = (q: ForumQuery, page: number) => {
  const p = new URLSearchParams();
  if (q.q.trim()) p.set('q', q.q.trim());
  if (q.kategori !== 'tumu') p.set('kategori', q.kategori);
  if (q.sirala !== 'yeni') p.set('sirala', q.sirala);
  if (page > 1) p.set('sayfa', String(page));
  const s = p.toString();
  return s ? `?${s}` : '';
};

/** The forum's topics, 20 at a time (the same as the website's /forum). Public. */
export function useTopics(q: ForumQuery) {
  return useInfiniteQuery({
    queryKey: [...keys.forum, q],
    queryFn: ({ pageParam }) => api<TopicPage>(`/forum${forumParams(q, pageParam)}`),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page * last.pageSize < last.total && last.page < 100 ? last.page + 1 : undefined),
  });
}

/** A topic with its replies; checked every 20 s while open. Waits for sign-in to load ("siz", "Sil", reports). */
export function useTopic(id: string) {
  const { loaded } = useSignedIn();
  return useQuery({ queryKey: keys.topic(id), queryFn: () => api<{ topic: TopicDetail; admin: boolean }>(`/forum/${id}`), enabled: loaded && !!id, refetchInterval: 20_000 });
}

export function useForumReports(enabled: boolean) {
  return useQuery({ queryKey: [...keys.admin, 'forum'], queryFn: () => api<{ items: ReportedPost[] }>('/yonetim/forum'), enabled, select: (d) => d.items });
}
