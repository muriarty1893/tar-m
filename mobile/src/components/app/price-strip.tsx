import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { ArrowDownIcon, ArrowUpIcon, CaretRightIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { PRICES } from '@/domain/farm-calendar';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

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
        <Pressable accessibilityRole="button" onPress={onSeeAll} hitSlop={10} className="flex-row items-center">
          <Text className="font-sans-semibold text-[13px] text-primary">Tümünü gör</Text>
          <CaretRightIcon size={14} weight="bold" color={COLORS.primary} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 mt-2" contentContainerClassName="gap-2.5 px-4 pb-1" accessibilityLabel="Ürün fiyatları">
        {PRICES.map((p) => {
          const up = p.change >= 0;
          const tone = up ? COLORS.primary : COLORS.destructive;
          return (
            <View key={p.name} className="w-[148px] rounded-[18px] border border-border bg-card p-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-sans-bold text-[14.5px]">{p.name}</Text>
                <Svg width={40} height={16} viewBox="0 0 40 16" accessibilityElementsHidden>
                  <Polyline points={p.line.map((y, i) => `${i * 8},${y}`).join(' ')} fill="none" stroke={tone} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text className="mt-1">
                <Text className="font-heading text-[20px]">{p.price} ₺</Text>
                <Text className="text-[12px] text-muted-foreground"> /kg</Text>
              </Text>
              <View className="mt-1.5 flex-row items-center gap-1.5">
                <View className={cn('flex-row items-center gap-0.5 rounded-full px-1.5 py-0.5', up ? 'bg-secondary' : 'bg-destructive/10')}>
                  {up ? <ArrowUpIcon size={12} weight="bold" color={tone} /> : <ArrowDownIcon size={12} weight="bold" color={tone} />}
                  <Text className={cn('font-sans-bold text-[12px]', up ? 'text-primary' : 'text-destructive')}>
                    {up ? '+' : '−'}%{String(Math.abs(p.change)).replace('.', ',')}
                  </Text>
                </View>
                <Text numberOfLines={1} className="flex-1 text-[11.5px] text-muted-foreground">
                  Türkiye geneli
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
