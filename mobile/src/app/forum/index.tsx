import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSignedIn, useTopics } from '@/api/queries';
import type { ForumCategory, ForumQuery, ForumSort, TopicCard } from '@/api/types';
import { BackHeader } from '@/components/app/back-header';
import { Segmented } from '@/components/app/segmented';
import { EmptyState, ErrorState, Loading } from '@/components/app/states';
import { TopicRow } from '@/components/forum/parts';
import { ChatsTeardropIcon, MagnifyingGlassIcon, NotePencilIcon, XCircleIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { FORUM_CATEGORIES, FORUM_SORTS } from '@/domain/forum';
import { useDebounced } from '@/hooks/use-debounced';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';
import { COLORS, SHADOW } from '@/theme/tokens';

const CATEGORY_OPTIONS: { id: ForumCategory | 'tumu'; label: string }[] = [{ id: 'tumu', label: 'Tümü' }, ...FORUM_CATEGORIES];

/** The forum (the website's /forum): "Konu aç", search, kinds of topic, sorting, and every topic, 20 at a time. */
export default function Forum() {
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { signedIn } = useSignedIn();
  const params = useLocalSearchParams<{ sirala?: string }>();
  const [text, setText] = useState('');
  const q = useDebounced(text);
  const [kategori, setKategori] = useState<ForumCategory | 'tumu'>('tumu');
  const [sirala, setSirala] = useState<ForumSort>(FORUM_SORTS.some((s) => s.id === params.sirala) ? (params.sirala as ForumSort) : 'yeni');
  const query: ForumQuery = useMemo(() => ({ q, kategori, sirala }), [q, kategori, sirala]);
  const topics = useTopics(query);
  const items = useMemo(() => topics.data?.pages.flatMap((p) => p.items) ?? [], [topics.data]);
  const total = topics.data?.pages[0]?.total ?? 0;
  const filtered = !!q.trim() || kategori !== 'tumu';

  const header = (
    <View className="gap-3 pb-3">
      <BackHeader title="Forum" subtitle="Çiftçilere sorun, deneyiminizi paylaşın" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Konu aç"
        onPress={() => router.push(signedIn ? '/forum/yeni' : '/giris')}
        className="h-14 flex-row items-center justify-center gap-2 rounded-[16px] bg-[#063b2f] active:opacity-90">
        <NotePencilIcon size={22} weight="bold" color={COLORS.white} />
        <Text className="font-sans-bold text-[17px] tracking-[0.5px] text-white">KONU AÇ</Text>
      </Pressable>
      <View className="h-12 flex-row items-center gap-2 rounded-full border border-input bg-card pl-4 pr-1" style={{ boxShadow: SHADOW.soft }}>
        <MagnifyingGlassIcon size={20} weight="bold" color={COLORS.mutedForeground} />
        <TextInput value={text} onChangeText={setText} placeholder="Buğday tohumu, süt verimi, mazot desteği…" placeholderTextColorClassName="accent-muted-foreground" accessibilityLabel="Forumda ara" returnKeyType="search" className="h-full flex-1 font-sans text-[15px] text-foreground" />
        {text ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Aramayı temizle" onPress={() => setText('')} className="size-11 items-center justify-center rounded-full active:bg-secondary">
            <XCircleIcon size={22} weight="fill" color={COLORS.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4" contentContainerClassName="gap-2 px-4" accessibilityRole="tablist" accessibilityLabel="Konu türleri">
        {CATEGORY_OPTIONS.map((c) => {
          const on = c.id === kategori;
          return (
            <Pressable key={c.id} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => setKategori(c.id)} className={cn('min-h-11 justify-center rounded-full border px-3.5', on ? 'border-primary bg-primary' : 'border-border bg-card active:bg-secondary')}>
              <Text className={cn('font-sans-semibold text-[14px]', on ? 'text-primary-foreground' : 'text-foreground')}>{c.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Segmented label="Sıralama" value={sirala} options={FORUM_SORTS} onChange={setSirala} />
      {topics.isSuccess ? (
        <Text className="text-[13px] text-muted-foreground" accessibilityLiveRegion="polite">
          {total} konu
        </Text>
      ) : null}
    </View>
  );

  return (
    <FlatList<TopicCard>
      className="flex-1 bg-background"
      data={items}
      keyExtractor={(t) => t.id}
      ListHeaderComponent={header}
      renderItem={({ item, index }) => (
        <View className={cn('overflow-hidden border-x border-border', index === 0 && 'rounded-t-[18px] border-t', index === items.length - 1 && 'rounded-b-[18px]')}>
          <TopicRow topic={item} now={now} excerpt />
        </View>
      )}
      ListEmptyComponent={
        topics.isPending ? (
          <Loading label="Konular yükleniyor…" />
        ) : topics.isError ? (
          <ErrorState error={topics.error} onRetry={() => topics.refetch()} />
        ) : (
          <EmptyState
            Icon={ChatsTeardropIcon}
            title={filtered ? 'Konu bulunamadı' : 'Henüz konu yok'}
            body={filtered ? 'Başka kelimeler deneyin ya da yeni bir konu açın.' : 'İlk soruyu siz sorun; diğer çiftçiler yanıtlasın.'}
            action="Konu aç"
            onAction={() => router.push(signedIn ? '/forum/yeni' : '/giris')}
          />
        )
      }
      ListFooterComponent={topics.isFetchingNextPage ? <ActivityIndicator className="py-4" color={COLORS.primary} /> : null}
      onEndReached={() => topics.hasNextPage && !topics.isFetchingNextPage && topics.fetchNextPage()}
      onEndReachedThreshold={0.6}
      refreshControl={<RefreshControl refreshing={topics.isRefetching && !topics.isFetchingNextPage} onRefresh={() => topics.refetch()} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: insets.bottom + 32, width: '100%', maxWidth: 680, alignSelf: 'center' }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    />
  );
}
