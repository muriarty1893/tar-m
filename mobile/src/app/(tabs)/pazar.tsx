import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MagnifyingGlassIcon, PlusIcon, XCircleIcon } from '@/components/icons';
import { ListingCard } from '@/components/market/listing-card';
import { CATEGORY_ICONS, InboxButton, SafetyStrip } from '@/components/market/parts';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CATEGORIES, LISTINGS, filterListings, type CategoryId, type Listing, type MarketView } from '@/domain/market';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';
import { COLORS, SHADOW } from '@/theme/tokens';

const VIEWS: { id: MarketView; label: string }[] = [
  { id: 'kesfet', label: 'Keşfet' },
  { id: 'favoriler', label: 'Favoriler' },
  { id: 'ilanlarim', label: 'İlanlarım' },
];

/** "Pazar": farmers' listings. Search first, categories in view, then the listings; "İlan ver" is always one tap away. */
export default function Market() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = (Math.min(width, 640) - 16 * 2 - 10) / 2;
  const now = useNow();
  const favorites = useAppStore((s) => s.favorites);
  const myListings = useAppStore((s) => s.myListings);
  const status = useAppStore((s) => s.listingStatus);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId>('tumu');
  const [view, setView] = useState<MarketView>('kesfet');

  const listings = useMemo(() => filterListings([...myListings, ...LISTINGS], { query, category, view, favorites, status }), [myListings, query, category, view, favorites, status]);
  const open = useCallback((id: string) => router.push({ pathname: '/ilan/[id]', params: { id } }), []);
  const filtered = !!query.trim() || category !== 'tumu';
  const clear = () => {
    setQuery('');
    setCategory('tumu');
  };

  const header = (
    <View className="gap-3 pb-3">
      <View className="flex-row items-center justify-between">
        <Text role="heading" className="font-heading text-[24px]">
          Pazar
        </Text>
        <InboxButton />
      </View>

      <View className="h-12 flex-row items-center gap-2 rounded-full border border-input bg-card pl-4 pr-1" style={{ boxShadow: SHADOW.soft }}>
        <MagnifyingGlassIcon size={20} weight="bold" color={COLORS.mutedForeground} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Traktör, buğday, pulverizatör…"
          placeholderTextColorClassName="accent-muted-foreground"
          accessibilityLabel="Pazarda ara"
          returnKeyType="search"
          className="h-full flex-1 font-sans text-[15px] text-foreground"
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Aramayı temizle" onPress={() => setQuery('')} className="size-11 items-center justify-center rounded-full active:bg-secondary">
            <XCircleIcon size={22} weight="fill" color={COLORS.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as MarketView)} className="rounded-full bg-muted p-1">
        {VIEWS.map((v, i) => (
          <ToggleGroupItem
            key={v.id}
            value={v.id}
            isFirst={i === 0}
            isLast={i === VIEWS.length - 1}
            accessibilityLabel={v.label}
            className={cn('h-10 flex-1 rounded-full', view === v.id ? 'bg-primary' : 'bg-transparent')}>
            <Text className={cn('font-sans-semibold text-[14px]', view === v.id ? 'text-primary-foreground' : 'text-muted-foreground')}>{v.label}</Text>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <View className="flex-row flex-wrap gap-2" accessibilityRole="tablist" accessibilityLabel="Kategoriler">
        {CATEGORIES.map((c) => {
          const on = c.id === category;
          const Icon = CATEGORY_ICONS[c.id];
          return (
            <Pressable
              key={c.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setCategory(c.id)}
              className={cn('min-h-11 flex-row items-center gap-1.5 rounded-full border px-3.5', on ? 'border-primary bg-primary' : 'border-border bg-card active:bg-secondary')}>
              <Icon size={18} weight="duotone" color={on ? COLORS.white : COLORS.primary} />
              <Text className={cn('font-sans-semibold text-[14px]', on ? 'text-primary-foreground' : 'text-foreground')}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {view === 'kesfet' ? <SafetyStrip /> : null}

      <Text className="text-[13px] text-muted-foreground" accessibilityLiveRegion="polite">
        {listings.length} ilan{view === 'kesfet' ? ' · Konya ve çevresi' : ''}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <FlatList<Listing>
        data={listings}
        keyExtractor={(l) => l.id}
        numColumns={2}
        ListHeaderComponent={header}
        ListEmptyComponent={<Empty view={view} filtered={filtered} query={query} onClear={clear} onBrowse={() => setView('kesfet')} />}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 96, gap: 10, width: '100%', maxWidth: 640, alignSelf: 'center' }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <ListingCard listing={item} favorite={favorites.includes(item.id)} status={status[item.id]} now={now} onPress={open} onToggleFavorite={toggleFavorite} />
          </View>
        )}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="İlan ver"
        onPress={() => router.push('/ilan/yeni')}
        className="absolute bottom-4 right-4 h-14 flex-row items-center gap-2 rounded-full bg-primary pl-4 pr-5 active:scale-95"
        style={{ boxShadow: SHADOW.lift }}>
        <PlusIcon size={22} weight="bold" color={COLORS.white} />
        <Text className="font-sans-bold text-[16px] text-primary-foreground">İlan ver</Text>
      </Pressable>
    </View>
  );
}

function Empty({ view, filtered, query, onClear, onBrowse }: { view: MarketView; filtered: boolean; query: string; onClear: () => void; onBrowse: () => void }) {
  const copy =
    filtered
      ? { title: 'Sonuç bulunamadı', body: query.trim() ? `“${query.trim()}” için ilan yok. Başka bir kelime deneyin ya da filtreleri temizleyin.` : 'Bu kategoride ilan yok. Filtreleri temizleyip tüm ilanlara bakın.', action: 'Filtreleri temizle', onPress: onClear }
      : view === 'favoriler'
        ? { title: 'Henüz favori yok', body: 'Beğendiğiniz ilanlardaki kalbe dokunun; burada toplansın.', action: 'Pazara göz at', onPress: onBrowse }
        : { title: 'Henüz ilanınız yok', body: 'Ürününüzü, aletinizi ya da aracınızı birkaç adımda satışa çıkarın.', action: 'İlan ver', onPress: () => router.push('/ilan/yeni') };
  return (
    <View className="items-center gap-2 rounded-[22px] border border-dashed border-border px-6 py-8">
      <Text className="font-heading text-[18px]">{copy.title}</Text>
      <Text className="text-center text-[14px] leading-5 text-muted-foreground">{copy.body}</Text>
      <Button size="sm" className="mt-2 rounded-full" onPress={copy.onPress}>
        <Text>{copy.action}</Text>
      </Button>
    </View>
  );
}
