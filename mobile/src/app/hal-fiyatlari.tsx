import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { BackHeader } from '@/components/app/headers';
import { Screen } from '@/components/app/screen';
import { Sparkline } from '@/components/app/sparkline';
import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cropById } from '@/domain/crops';
import { formatPercent, formatTL } from '@/domain/format';
import { PRICES } from '@/domain/prices';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';

export default function MarketPrices() {
  const crops = useAppStore((s) => s.profile.crops);
  const province = useAppStore((s) => s.profile.province);
  const [scope, setScope] = useState<'mine' | 'all'>('mine');
  const rows = scope === 'mine' ? PRICES.filter((p) => crops.includes(p.crop)) : PRICES;

  return (
    <Screen>
      <BackHeader title="Hal fiyatları" subtitle={`Bugün · ${province} Hali (örnek veri)`} />
      <ToggleGroup type="single" value={scope} onValueChange={(v) => v && setScope(v as 'mine' | 'all')} className="mx-4 w-auto rounded-full bg-secondary p-1">
        <ToggleGroupItem value="mine" isFirst className={cn('h-12 flex-1 rounded-full px-4', scope === 'mine' && 'bg-foreground')} accessibilityLabel="Ürünlerim">
          <Text className={cn(scope === 'mine' && 'font-sans-bold text-background')}>Ürünlerim</Text>
        </ToggleGroupItem>
        <ToggleGroupItem value="all" isLast className={cn('h-12 flex-1 rounded-full px-4', scope === 'all' && 'bg-foreground')} accessibilityLabel="Tümü">
          <Text className={cn(scope === 'all' && 'font-sans-bold text-background')}>Tümü</Text>
        </ToggleGroupItem>
      </ToggleGroup>

      <View className="gap-3 px-4">
        {rows.length ? (
          rows.map((p) => {
            const up = p.changePct > 0;
            const down = p.changePct < 0;
            const tone = up ? 'olive' : down ? 'brick' : 'mutedForeground';
            return (
              <View key={p.crop} className="flex-row items-center gap-4 rounded-[28px] bg-card p-4" accessibilityLabel={`${cropById(p.crop).name}, kilosu ${formatTL(p.price)}, ${up ? 'yüzde ' + formatPercent(p.changePct).slice(1) + ' arttı' : down ? 'yüzde ' + formatPercent(p.changePct).slice(1) + ' düştü' : 'değişmedi'}`}>
                <Image source={cropById(p.crop).image} style={{ width: 60, height: 60, borderRadius: 18 }} contentFit="cover" />
                <View className="flex-1">
                  <Text className="font-sans-bold text-lg">{cropById(p.crop).name}</Text>
                  <Text className="font-heading text-2xl">
                    {formatTL(p.price)}
                    <Text className="text-base text-muted-foreground"> /{p.unit}</Text>
                  </Text>
                </View>
                <View className="items-end gap-1">
                  <Sparkline values={p.week} color={tone} />
                  <Text className={cn('font-sans-bold text-base', up ? 'text-olive' : down ? 'text-brick' : 'text-muted-foreground')}>
                    {up ? '▲' : down ? '▼' : '–'} {formatPercent(p.changePct)}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text className="rounded-3xl bg-popover p-5 text-lg text-muted-foreground">Ürünlerin için fiyat yok. “Tümü”ne bak.</Text>
        )}
      </View>
      <Text className="px-5 text-center text-base text-muted-foreground">Son güncelleme 09:30 · Prototip: fiyatlar örnektir.</Text>
    </Screen>
  );
}
