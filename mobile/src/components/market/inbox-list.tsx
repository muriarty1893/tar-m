import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { Segmented } from '@/components/app/segmented';
import { Avatar } from '@/components/market/parts';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { lastAt, lastLine, unreadCount, type Conversation } from '@/domain/chat';
import { listingById, sellerById, type Listing } from '@/domain/market';
import { agoLabel } from '@/domain/when';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';

type Filter = 'tumu' | 'buyer' | 'seller';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'tumu', label: 'Tümü' },
  { id: 'buyer', label: 'Alıyorum' },
  { id: 'seller', label: 'Satıyorum' },
];

/** Pazar's "Mesajlar": every listing chat, newest first, unread ones in bold with a count. */
export function InboxList({ onBrowse, bottomInset }: { onBrowse: () => void; bottomInset: number }) {
  const now = useNow();
  const conversations = useAppStore((s) => s.conversations);
  const myListings = useAppStore((s) => s.myListings);
  const [filter, setFilter] = useState<Filter>('tumu');

  const rows = useMemo(
    () =>
      conversations
        .filter((c) => c.messages.length && (filter === 'tumu' || c.role === filter))
        .sort((a, b) => lastAt(b).localeCompare(lastAt(a))),
    [conversations, filter]
  );

  return (
    <FlatList
      data={rows}
      keyExtractor={(c) => c.id}
      ListHeaderComponent={
        <View className="px-4 pb-2">
          <Segmented label="Sohbetler" value={filter} options={FILTERS} onChange={setFilter} />
        </View>
      }
      contentContainerStyle={{ paddingBottom: bottomInset, flexGrow: 1 }}
      renderItem={({ item }) => <Row chat={item} now={now} myListings={myListings} />}
      ListEmptyComponent={
        <View className="m-4 items-center gap-2 rounded-[22px] border border-dashed border-border px-6 py-8">
          <Text className="font-heading text-[18px]">{filter === 'seller' ? 'İlanlarınıza mesaj yok' : 'Henüz mesajınız yok'}</Text>
          <Text className="text-center text-[14px] leading-5 text-muted-foreground">
            {filter === 'seller' ? 'Alıcılar ilanlarınıza yazınca burada görünecek.' : 'Bir ilanda “Mesaj gönder”e dokunarak satıcıyla konuşun.'}
          </Text>
          <Button size="sm" className="mt-2 rounded-full" onPress={onBrowse}>
            <Text>İlanlara göz at</Text>
          </Button>
        </View>
      }
    />
  );
}

function Row({ chat, now, myListings }: { chat: Conversation; now: Date; myListings: Listing[] }) {
  const listing = listingById(chat.listingId, myListings);
  const peer = sellerById(chat.peerId);
  if (!listing || !peer) return null;
  const unread = unreadCount(chat);
  const when = agoLabel(new Date(lastAt(chat)), now);
  const line = lastLine(chat);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${peer.name}, ${listing.title}. ${line.replace(/[.!?]$/, '')}. ${when}${unread ? `. ${unread} okunmamış mesaj` : ''}`}
      onPress={() => router.push({ pathname: '/mesajlar/[id]', params: { id: chat.id } })}
      className="min-h-[84px] flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-secondary/60">
      <View>
        <Image source={listing.photos[0]} style={{ width: 58, height: 58, borderRadius: 14 }} contentFit="cover" />
        <View className="absolute -bottom-1.5 -right-1.5 rounded-full border-2 border-background">
          <Avatar seller={peer} size={26} />
        </View>
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text numberOfLines={1} className={cn('flex-1 text-[15.5px]', unread ? 'font-sans-bold' : 'font-sans-semibold')}>
            {peer.name}
          </Text>
          <Text className={cn('text-[12.5px]', unread ? 'font-sans-semibold text-primary' : 'text-muted-foreground')}>{when}</Text>
        </View>
        <Text numberOfLines={1} className="text-[13px] text-muted-foreground">
          {chat.role === 'seller' ? 'İlanınız · ' : ''}
          {listing.title}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text numberOfLines={1} className={cn('flex-1 text-[14px]', unread ? 'font-sans-semibold text-foreground' : 'text-muted-foreground')}>
            {line}
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
}
