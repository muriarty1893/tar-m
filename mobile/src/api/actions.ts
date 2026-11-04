import type { InfiniteData } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { errorMessage, redirectForError } from '@/lib/api-errors';

import { api } from './client';
import { keys, queryClient, useSignedIn } from './queries';
import type { ListingDetail, ListingPage } from './types';

/** Sets a listing's heart everywhere it's cached (lists and its own page). */
function setFavorite(id: string, favorite: boolean) {
  queryClient.setQueriesData<InfiniteData<ListingPage>>({ queryKey: keys.listings }, (data) =>
    data ? { ...data, pages: data.pages.map((p) => ({ ...p, items: p.items.map((l) => (l.id === id ? { ...l, favorite } : l)) })) } : data
  );
  queryClient.setQueryData<{ listing: ListingDetail; admin: boolean }>(keys.listing(id), (d) => (d ? { ...d, listing: { ...d.listing, favorite } } : d));
}

/** The heart on a listing: shown at once, then saved; signed out, it asks to sign in first. */
export function useToggleFavorite() {
  const { signedIn } = useSignedIn();
  return useCallback(
    async (l: { id: string; favorite: boolean }) => {
      if (!signedIn) return router.push('/giris');
      setFavorite(l.id, !l.favorite);
      try {
        const { favorite } = await api<{ favorite: boolean }>(`/ilanlar/${l.id}/favori`, { method: 'POST' });
        setFavorite(l.id, favorite);
        // "Favoriler" is loaded again the next time it's opened.
        void queryClient.invalidateQueries({ queryKey: keys.listings, refetchType: 'none' });
      } catch (err) {
        setFavorite(l.id, l.favorite);
        if (!redirectForError(err)) Alert.alert('Favori kaydedilemedi', errorMessage(err));
      }
    },
    [signedIn]
  );
}
