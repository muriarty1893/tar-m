import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';

import { api } from '@/api/client';
import { keys, queryClient, useNotifications, useSignedIn, useUnreadCounts } from '@/api/queries';
import type { AppNotification } from '@/api/types';
import { BackHeader } from '@/components/app/back-header';
import { TabScreen } from '@/components/app/screen';
import { EmptyState, ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import { AtIcon, BellIcon, CaretRightIcon, ChatsCircleIcon, ChatsTeardropIcon } from '@/components/icons';
import { Avatar } from '@/components/market/parts';
import { Text } from '@/components/ui/text';
import { agoLabel } from '@/domain/when';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

const what = (n: AppNotification) => (n.kind === 'mention' ? 'sizden bahsetti' : n.replyId ? 'size yanıt verdi' : 'konunuza yanıt verdi');

/**
 * "Bildirimler" (the bell): answers to your topics and replies, and mentions of you, newest first;
 * opening it marks them seen. The chats are one tap away at the top.
 */
export default function Notifications() {
  const { signedIn } = useSignedIn();
  const list = useNotifications();
  const { messages } = useUnreadCounts();
  const now = useNow();
  const unread = list.data?.filter((n) => !n.read).length ?? 0;

  useEffect(() => {
    if (!unread) return;
    void api('/bildirimler', { method: 'POST' })
      .then(() => queryClient.invalidateQueries({ queryKey: keys.unread }))
      .catch(() => undefined);
  }, [unread]);

  return (
    <TabScreen refreshControl={signedIn ? <RefreshControl refreshing={list.isRefetching} onRefresh={() => list.refetch()} tintColor={COLORS.primary} colors={[COLORS.primary]} /> : undefined}>
      <BackHeader title="Bildirimler" subtitle="Yanıtlar ve sizden bahsedenler" />
      {!signedIn ? (
        <SignInPrompt title="Bildirimler için giriş yapın" body="Konunuza ya da yanıtınıza yanıt geldiğinde, ya da biri sizden bahsettiğinde burada görürsünüz." />
      ) : (
        <View className="gap-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={messages ? `Mesajlar: ${messages} okunmamış sohbet` : 'Mesajlar'}
            onPress={() => router.navigate({ pathname: '/pazar', params: { bolum: 'mesajlar' } })}
            className="min-h-16 flex-row items-center gap-3 rounded-[18px] border border-border bg-card px-3.5 py-3 active:bg-secondary">
            <View className="size-11 items-center justify-center rounded-full bg-secondary">
              <ChatsCircleIcon size={24} weight="duotone" color={COLORS.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-sans-bold text-[16px]">Mesajlar</Text>
              <Text className="text-[13.5px] text-muted-foreground">{messages ? `${messages} okunmamış sohbet` : 'Pazar’daki alıcı ve satıcılarla sohbetleriniz'}</Text>
            </View>
            {messages ? (
              <View className="min-w-6 items-center rounded-full bg-destructive px-1.5">
                <Text className="font-sans-bold text-[12px] leading-6 text-white">{messages}</Text>
              </View>
            ) : null}
            <CaretRightIcon size={18} weight="bold" color={COLORS.mutedForeground} />
          </Pressable>

          {list.isPending ? (
            <Loading />
          ) : list.isError ? (
            <ErrorState error={list.error} onRetry={() => list.refetch()} />
          ) : list.data.length === 0 ? (
            <EmptyState Icon={BellIcon} title="Henüz bildirim yok" body="Biri konunuza ya da yanıtınıza yanıt verdiğinde, ya da sizden bahsettiğinde burada görünür." action="Foruma git" onAction={() => router.push('/forum')} />
          ) : (
            <View className="overflow-hidden rounded-[18px] border border-border">
              {list.data.map((n) => {
                const Icon = n.kind === 'mention' ? AtIcon : ChatsTeardropIcon;
                return (
                  <Pressable
                    key={n.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${n.actorName} ${what(n)}${n.read ? '' : ', yeni'}: ${n.topicTitle}. ${n.excerpt}`}
                    onPress={() => router.push({ pathname: '/forum/[id]', params: { id: n.topicId } })}
                    className={cn('flex-row gap-3 border-b border-border px-3.5 py-3 active:bg-secondary', n.read ? 'bg-card' : 'bg-secondary/70')}>
                    <View>
                      <Avatar name={n.actorName} size={42} />
                      <View className="absolute -bottom-1 -right-1 size-6 items-center justify-center rounded-full border-2 border-card bg-primary">
                        <Icon size={12} weight="bold" color={COLORS.white} />
                      </View>
                    </View>
                    <View className="min-w-0 flex-1 gap-0.5">
                      <Text className="text-[15px] leading-5">
                        <Text className="font-sans-bold text-[15px]">{n.actorName}</Text> {what(n)}
                      </Text>
                      <Text numberOfLines={1} className="text-[13px] text-muted-foreground">
                        {n.topicTitle}
                      </Text>
                      {n.excerpt ? (
                        <Text numberOfLines={2} className="text-[14px] leading-5">
                          “{n.excerpt}”
                        </Text>
                      ) : null}
                    </View>
                    <Text className="text-[12.5px] text-muted-foreground">{agoLabel(new Date(n.createdAt), now)}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}
    </TabScreen>
  );
}
