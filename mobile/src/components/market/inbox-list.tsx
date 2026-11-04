import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';

import { useInbox, useSignedIn } from '@/api/queries';
import type { InboxRow } from '@/api/types';
import { Segmented } from '@/components/app/segmented';
import { EmptyState, ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import { ChatCircleDotsIcon } from '@/components/icons';
import { Avatar } from '@/components/market/parts';
import { Text } from '@/components/ui/text';
import { agoLabel } from '@/domain/when';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

type Filter = 'all' | 'buyer' | 'seller';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'buyer', label: 'Alıyorum' },
  { id: 'seller', label: 'Satıyorum' },
];

/** Pazar's "Mesajlar": every listing chat, newest first, unread ones in bold with a count. */
export function InboxList({ onBrowse, bottomInset }: { onBrowse: () => void; bottomInset: number }) {
  const now = useNow();
  const { loaded, signedIn } = useSignedIn();
  const [filter, setFilter] = useState<Filter>('all');
  const inbox = useInbox(filter);

  if (!loaded) return <Loading />;
  if (!signedIn) {
    return (
      <View className="px-4">
        <SignInPrompt title="Mesajlarınız için giriş yapın" body="Satıcılara yazmak, teklif vermek ve ilanlarınıza gelen mesajları görmek için giriş yapın." />
      </View>
    );
  }

  return (
    <FlatList
      data={inbox.data ?? []}
      keyExtractor={(c) => c.id}
      ListHeaderComponent={
        <View className="px-4 pb-2">
          <Segmented label="Sohbetler" value={filter} options={FILTERS} onChange={setFilter} />
        </View>
      }
      refreshControl={<RefreshControl refreshing={inbox.isRefetching} onRefresh={() => inbox.refetch()} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
      contentContainerStyle={{ paddingBottom: bottomInset, flexGrow: 1 }}
      renderItem={({ item }) => <Row chat={item} now={now} />}
      ListEmptyComponent={
        inbox.isPending ? (
          <Loading label="Mesajlar yükleniyor…" />
        ) : inbox.isError ? (
          <ErrorState className="m-4" error={inbox.error} onRetry={() => inbox.refetch()} />
        ) : (
          <EmptyState
            className="m-4"
            Icon={ChatCircleDotsIcon}
            title={filter === 'seller' ? 'İlanlarınıza mesaj yok' : 'Henüz mesajınız yok'}
            body={filter === 'seller' ? 'Alıcılar ilanlarınıza yazınca burada görünecek.' : 'Bir ilanda “Mesaj gönder”e dokunarak satıcıyla konuşun.'}
            action="İlanlara göz at"
            onAction={onBrowse}
          />
        )
      }
    />
  );
}

const Row = memo(function Row({ chat, now }: { chat: InboxRow; now: Date }) {
  const when = agoLabel(new Date(chat.lastAt), now);
  const unread = chat.unread;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${chat.peerName}, ${chat.listingTitle}. ${chat.lastLine.replace(/[.!?]$/, '')}. ${when}${unread ? `. ${unread} okunmamış mesaj` : ''}`}
      onPress={() => router.push({ pathname: '/mesajlar/[id]', params: { id: chat.id } })}
      className="min-h-[84px] flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-secondary/60">
      <View>
        <Image source={{ uri: chat.listingPhoto }} style={{ width: 58, height: 58, borderRadius: 14 }} contentFit="cover" />
        <View className="absolute -bottom-1.5 -right-1.5 rounded-full border-2 border-background">
          <Avatar name={chat.peerName} size={26} />
        </View>
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text numberOfLines={1} className={cn('flex-1 text-[15.5px]', unread ? 'font-sans-bold' : 'font-sans-semibold')}>
            {chat.peerName}
          </Text>
          <Text className={cn('text-[12.5px]', unread ? 'font-sans-semibold text-primary' : 'text-muted-foreground')}>{when}</Text>
        </View>
        <Text numberOfLines={1} className="text-[13px] text-muted-foreground">
          {chat.role === 'seller' ? 'İlanınız · ' : ''}
          {chat.listingTitle}
          {chat.listingStatus === 'sold' ? ' · Satıldı' : chat.listingStatus === 'removed' ? ' · Kaldırıldı' : ''}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text numberOfLines={1} className={cn('flex-1 text-[14px]', unread ? 'font-sans-semibold text-foreground' : 'text-muted-foreground')}>
            {chat.lastLine}
          </Text>
          {unread ? (
            <View className="min-w-6 items-center rounded-full bg-primary px-1.5 py-0.5">
              <Text className="font-sans-bold text-[12px] text-primary-foreground">{unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});
