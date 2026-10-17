import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowLeftIcon } from '@/components/icons';
import { Avatar } from '@/components/market/parts';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { lastAt, lastLine, unreadCount, type Conversation } from '@/domain/chat';
import { listingById, sellerById } from '@/domain/market';
import { agoLabel } from '@/domain/when';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';
import { COLORS, SHADOW } from '@/theme/tokens';

type Filter = 'tumu' | 'buyer' | 'seller';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'tumu', label: 'Tümü' },
  { id: 'buyer', label: 'Alıyorum' },
  { id: 'seller', label: 'Satıyorum' },
];

/** "Mesajlar": every listing chat, newest first, unread ones in bold with a count. */
export default function Inbox() {
  const insets = useSafeAreaInsets();
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
  const unread = conversations.filter((c) => unreadCount(c) > 0).length;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/pazar'));

  return (
    <View className="flex-1 bg-background">
      <View className="gap-3 border-b border-border px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center gap-3">
          <Pressable accessibilityRole="button" accessibilityLabel="Geri" onPress={back} className="size-11 items-center justify-center rounded-full bg-card active:bg-secondary" style={{ boxShadow: SHADOW.soft }}>
            <ArrowLeftIcon size={21} weight="bold" color={COLORS.foreground} />
          </Pressable>
          <View>
            <Text role="heading" className="font-heading text-[22px]">
              Mesajlar
            </Text>
            <Text className="text-[13px] text-muted-foreground">{unread ? `${unread} okunmamış sohbet` : 'Hepsi okundu'}</Text>
          </View>
        </View>
        <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as Filter)} className="rounded-full bg-muted p-1">
          {FILTERS.map((f, i) => (
            <ToggleGroupItem key={f.id} value={f.id} isFirst={i === 0} isLast={i === FILTERS.length - 1} accessibilityLabel={f.label} className={cn('h-10 flex-1 rounded-full', filter === f.id ? 'bg-primary' : 'bg-transparent')}>
              <Text className={cn('font-sans-semibold text-[14px]', filter === f.id ? 'text-primary-foreground' : 'text-muted-foreground')}>{f.label}</Text>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, flexGrow: 1 }}
        renderItem={({ item }) => <Row chat={item} now={now} myListings={myListings} />}
        ListEmptyComponent={
          <View className="m-4 items-center gap-2 rounded-[22px] border border-dashed border-border px-6 py-8">
            <Text className="font-heading text-[18px]">{filter === 'seller' ? 'İlanlarınıza mesaj yok' : 'Henüz mesajınız yok'}</Text>
            <Text className="text-center text-[14px] leading-5 text-muted-foreground">
              {filter === 'seller' ? 'Alıcılar ilanlarınıza yazınca burada görünecek.' : 'Bir ilanda “Mesaj gönder”e dokunarak satıcıyla konuşun.'}
            </Text>
            <Button size="sm" className="mt-2 rounded-full" onPress={() => router.navigate('/pazar')}>
              <Text>Pazara göz at</Text>
            </Button>
          </View>
        }
      />
    </View>
  );
}

function Row({ chat, now, myListings }: { chat: Conversation; now: Date; myListings: Parameters<typeof listingById>[1] }) {
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
