import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { CaretRightIcon } from '@/components/icons';
import { ListingCard } from '@/components/market/listing-card';
import { Text } from '@/components/ui/text';
import { LISTINGS, filterListings } from '@/domain/market';
import { useNow } from '@/hooks/use-now';
import { useAppStore } from '@/state/store';
import { COLORS } from '@/theme/tokens';

const open = (id: string) => router.push({ pathname: '/ilan/[id]', params: { id } });

/** "Pazarda yeni" on the home screen: the latest listings, sideways, with a way into Pazar. */
export function MarketStrip() {
  const now = useNow();
  const favorites = useAppStore((s) => s.favorites);
  const status = useAppStore((s) => s.listingStatus);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const latest = filterListings(LISTINGS, { query: '', category: 'tumu', view: 'kesfet', favorites, status }).slice(0, 5);
  return (
    <View className="mt-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="size-2 rounded-full bg-gold" />
          <Text role="heading" className="font-heading text-[17px]">
            Pazarda yeni
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Pazar’daki tüm ilanlar" onPress={() => router.navigate('/pazar')} hitSlop={10} className="flex-row items-center">
          <Text className="font-sans-semibold text-[13px] text-primary">Tümünü gör</Text>
          <CaretRightIcon size={14} weight="bold" color={COLORS.primary} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 mt-2" contentContainerClassName="gap-2.5 px-4 pb-3" accessibilityLabel="Yeni ilanlar">
        {latest.map((l) => (
          <View key={l.id} className="w-[168px]">
            <ListingCard listing={l} favorite={favorites.includes(l.id)} status={status[l.id]} now={now} onPress={open} onToggleFavorite={toggleFavorite} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
