import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { api } from '@/api/client';
import { keys, refresh, useSignedIn } from '@/api/queries';
import { HeartIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { redirectForError } from '@/lib/api-errors';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

/** ♥ and the count under a topic or a reply. Changes at once; signed out, it opens sign-in. */
export function LikeButton({ topicId, replyId = null, liked, count }: { topicId: string; replyId?: string | null; liked: boolean; count: number }) {
  const { signedIn } = useSignedIn();
  const [state, setState] = useState({ liked, count });
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    if (!signedIn) return router.push('/giris');
    if (busy) return;
    const before = state;
    setState({ liked: !before.liked, count: before.count + (before.liked ? -1 : 1) });
    setBusy(true);
    try {
      const r = await api<{ liked: boolean; count: number }>('/forum/begen', { method: 'POST', body: { topicId, replyId } });
      setState(r);
      void refresh(keys.forum);
    } catch (err) {
      setState(before);
      redirectForError(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: state.liked, busy }}
      accessibilityLabel={`${state.liked ? 'Beğeniyi geri al' : 'Beğen'}${state.count ? `, ${state.count} beğeni` : ''}`}
      onPress={toggle}
      hitSlop={4}
      className="min-h-11 flex-row items-center gap-1.5 active:opacity-60">
      <HeartIcon size={18} weight={state.liked ? 'fill' : 'bold'} color={state.liked ? COLORS.destructive : COLORS.mutedForeground} />
      {state.count > 0 ? <Text className={cn('font-sans-semibold text-[13.5px]', state.liked ? 'text-destructive' : 'text-muted-foreground')}>{state.count}</Text> : null}
    </Pressable>
  );
}
