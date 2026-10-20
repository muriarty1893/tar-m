import { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/app/back-header';
import { ChangePill, Sparkline } from '@/components/app/price-bits';
import { MagnifyingGlassIcon, XCircleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatTL } from '@/domain/format';
import { PRICES, PRICE_GROUPS, filterPrices, trendLabel, type CropPrice, type PriceGroupId, type PriceSort } from '@/domain/prices';
import { cn } from '@/lib/utils';
import { COLORS, SHADOW } from '@/theme/tokens';

const SORTS: { id: PriceSort; label: string }[] = [
  { id: 'az', label: 'A–Z' },
  { id: 'degisim', label: 'En çok değişen' },
];

/** "Tarım Borsası Fiyatları": every crop's price per kilo, by group, searchable and sortable. */
export default function Prices() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<PriceGroupId>('tumu');
  const [sort, setSort] = useState<PriceSort>('az');
  const list = useMemo(() => filterPrices(PRICES, { group, query, sort }), [group, query, sort]);
  const clear = () => {
    setQuery('');
    setGroup('tumu');
  };

  const header = (
    <View className="gap-3 pb-3">
      <BackHeader title="Borsa fiyatları" subtitle="Kilo fiyatları · Türkiye geneli" />

      <View className="h-12 flex-row items-center gap-2 rounded-full border border-input bg-card pl-4 pr-1" style={{ boxShadow: SHADOW.soft }}>
        <MagnifyingGlassIcon size={20} weight="bold" color={COLORS.mutedForeground} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ürün ya da borsa ara"
          placeholderTextColorClassName="accent-muted-foreground"
          accessibilityLabel="Fiyatlarda ara"
          returnKeyType="search"
          className="h-full flex-1 font-sans text-[15px] text-foreground"
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Aramayı temizle" onPress={() => setQuery('')} className="size-11 items-center justify-center rounded-full active:bg-secondary">
            <XCircleIcon size={22} weight="fill" color={COLORS.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      <View className="flex-row flex-wrap gap-2" accessibilityRole="tablist" accessibilityLabel="Ürün grupları">
        {PRICE_GROUPS.map((g) => {
          const on = g.id === group;
          return (
            <Pressable
              key={g.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setGroup(g.id)}
              className={cn('min-h-11 justify-center rounded-full border px-3.5', on ? 'border-primary bg-primary' : 'border-border bg-card active:bg-secondary')}>
              <Text className={cn('font-sans-semibold text-[14px]', on ? 'text-primary-foreground' : 'text-foreground')}>{g.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-[13px] text-muted-foreground" accessibilityLiveRegion="polite">
          {list.length} ürün · örnek fiyatlar
        </Text>
        <ToggleGroup type="single" value={sort} onValueChange={(v) => v && setSort(v as PriceSort)} className="rounded-full bg-muted p-1" accessibilityLabel="Sıralama">
          {SORTS.map((s, i) => (
            <ToggleGroupItem
              key={s.id}
              value={s.id}
              isFirst={i === 0}
              isLast={i === SORTS.length - 1}
              accessibilityLabel={`Sırala: ${s.label}`}
              className={cn('h-9 rounded-full px-3', sort === s.id ? 'bg-primary' : 'bg-transparent')}>
              <Text className={cn('font-sans-semibold text-[13px]', sort === s.id ? 'text-primary-foreground' : 'text-muted-foreground')}>{s.label}</Text>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </View>
    </View>
  );

  return (
    <FlatList<CropPrice>
      className="flex-1 bg-background"
      data={list}
      keyExtractor={(p) => p.name}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View className="items-center gap-2 rounded-[22px] border border-dashed border-border px-6 py-8">
          <Text className="font-heading text-[18px]">Sonuç bulunamadı</Text>
          <Text className="text-center text-[14px] leading-5 text-muted-foreground">
            {query.trim() ? `“${query.trim()}” için fiyat yok.` : 'Bu grupta ürün yok.'} Filtreleri temizleyip tüm ürünlere bakın.
          </Text>
          <Button size="sm" className="mt-2 rounded-full" onPress={clear}>
            <Text>Filtreleri temizle</Text>
          </Button>
        </View>
      }
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: insets.bottom + 24, gap: 8, width: '100%', maxWidth: 640, alignSelf: 'center' }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <PriceRow price={item} />}
    />
  );
}

function PriceRow({ price: p }: { price: CropPrice }) {
  return (
    <View className="min-h-[68px] flex-row items-center gap-3 rounded-[18px] border border-border bg-card px-3.5 py-2.5" accessible accessibilityLabel={`${p.name}, ${p.exchange}: kilosu ${formatTL(p.price)}, ${trendLabel(p.change)}`}>
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="font-sans-bold text-[15.5px]">
          {p.name}
        </Text>
        <Text numberOfLines={1} className="text-[12.5px] text-muted-foreground">
          {p.exchange}
        </Text>
      </View>
      <Sparkline line={p.line} change={p.change} width={52} height={21} />
      <View className="w-[104px] items-end gap-1">
        <Text>
          <Text className="font-heading text-[17px]">{formatTL(p.price)}</Text>
          <Text className="text-[12px] text-muted-foreground"> /kg</Text>
        </Text>
        <ChangePill change={p.change} />
      </View>
    </View>
  );
}
