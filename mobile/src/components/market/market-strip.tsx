import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { useToggleFavorite } from '@/api/actions';
import { useListings, useMe } from '@/api/queries';
import type { MarketQuery } from '@/api/types';
import { CaretRightIcon } from '@/components/icons';
import { ListingCard } from '@/components/market/listing-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useNow } from '@/hooks/use-now';
import { COLORS } from '@/theme/tokens';

const open = (id: string) => router.push({ pathname: '/ilan/[id]', params: { id } });
const LATEST: MarketQuery = { q: '', kategori: 'tumu', il: '', sirala: 'yeni', gorunum: 'tumu' };

/** "Pazarda yeni" on the home screen: the latest listings, sideways, with a way into Pazar. */
export function MarketStrip() {
  const now = useNow();
  const listings = useListings(LATEST);
  const me = useMe();
  const toggleFavorite = useToggleFavorite();
  const latest = listings.data?.pages[0]?.items.slice(0, 6) ?? [];
  if (listings.isError || (listings.isSuccess && latest.length === 0)) return null;
  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="size-2.5 rounded-full bg-gold" />
          <Text role="heading" className="font-heading text-[19px]">
            Pazarda yeni
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Pazar’daki tüm ilanlar" onPress={() => router.navigate('/pazar')} hitSlop={10} className="min-h-11 flex-row items-center">
          <Text className="font-sans-semibold text-[13px] text-primary">Tümünü gör</Text>
          <CaretRightIcon size={14} weight="bold" color={COLORS.primary} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 mt-2" contentContainerClassName="gap-2.5 px-4 pb-3" accessibilityLabel="Yeni ilanlar">
        {listings.isPending
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-[232px] w-[168px] rounded-[20px]" />)
          : latest.map((l) => (
              <View key={l.id} className="w-[168px]">
                <ListingCard listing={l} now={now} onPress={open} onToggleFavorite={toggleFavorite} mine={l.sellerId === me.data?.id} />
              </View>
            ))}
      </ScrollView>
    </View>
  );
}
