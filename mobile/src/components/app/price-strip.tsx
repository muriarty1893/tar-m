import { Pressable, ScrollView, View } from 'react-native';

import { CaretRightIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { formatTL } from '@/domain/format';
import { PRICES, trendLabel } from '@/domain/prices';
import { COLORS } from '@/theme/tokens';

import { ChangePill, Sparkline } from './price-bits';

/** The demo's "Tarım Borsası Fiyatları": a sideways row of price cards with a tiny trend line. */
export function PriceStrip({ onSeeAll }: { onSeeAll?: () => void }) {
  return (
    <View className="mt-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="size-2 rounded-full bg-primary" />
          <Text role="heading" className="font-heading text-[17px]">
            Tarım Borsası Fiyatları
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Tüm fiyatları gör" onPress={onSeeAll} hitSlop={12} className="flex-row items-center active:opacity-60">
          <Text className="font-sans-semibold text-[13px] text-primary">Tümünü gör</Text>
          <CaretRightIcon size={14} weight="bold" color={COLORS.primary} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 mt-2" contentContainerClassName="gap-2.5 px-4 pb-1" accessibilityLabel="Ürün fiyatları">
        {PRICES.slice(0, 4).map((p) => (
          <View key={p.name} className="w-[148px] rounded-[18px] border border-border bg-card p-3" accessible accessibilityLabel={`${p.name}: kilosu ${formatTL(p.price)}, ${trendLabel(p.change)}`}>
            <View className="flex-row items-center justify-between">
              <Text className="font-sans-bold text-[14.5px]">{p.name}</Text>
              <Sparkline line={p.line} change={p.change} />
            </View>
            <Text className="mt-1">
              <Text className="font-heading text-[20px]">{formatTL(p.price)}</Text>
              <Text className="text-[12px] text-muted-foreground"> /kg</Text>
            </Text>
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <ChangePill change={p.change} />
              <Text numberOfLines={1} className="flex-1 text-[11.5px] text-muted-foreground">
                Türkiye geneli
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
