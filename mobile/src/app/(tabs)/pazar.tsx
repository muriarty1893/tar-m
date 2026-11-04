import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToggleFavorite } from '@/api/actions';
import { useListings, useMe, useSignedIn, useUnread } from '@/api/queries';
import type { ListingCard as Listing, MarketQuery, MarketSort, MarketView } from '@/api/types';
import { Segmented } from '@/components/app/segmented';
import { EmptyState, ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import { ProvinceChip } from '@/components/form/province-select';
import { ArrowsDownUpIcon, CheckIcon, MagnifyingGlassIcon, PlusIcon, StorefrontIcon, XCircleIcon } from '@/components/icons';
import { InboxList } from '@/components/market/inbox-list';
import { ListingCard } from '@/components/market/listing-card';
import { PriceList } from '@/components/market/price-list';
import { CATEGORY_ICONS, SafetyStrip } from '@/components/market/parts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { CATEGORIES, SORTS, type CategoryId } from '@/domain/market';
import { useDebounced } from '@/hooks/use-debounced';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';
import { COLORS, SHADOW } from '@/theme/tokens';

const VIEWS: { id: MarketView; label: string }[] = [
  { id: 'tumu', label: 'Keşfet' },
  { id: 'favoriler', label: 'Favoriler' },
  { id: 'ilanlarim', label: 'İlanlarım' },
];

type Section = 'ilanlar' | 'fiyatlar' | 'mesajlar';
const SECTIONS: Section[] = ['ilanlar', 'fiyatlar', 'mesajlar'];

/**
 * "Pazar": the farmers' market in one place, "İlanlar" (search, categories, province, sorting, the
 * listings; "İlan ver" one tap away), "Fiyatlar" (crop prices per kilo) and "Mesajlar" (the listing
 * chats). The same listings as the website's Pazar. ?bolum=fiyatlar or ?bolum=mesajlar opens that
 * part (the home screen's price strip, the bell).
 */
export default function Market() {
  const insets = useSafeAreaInsets();
  const { bolum } = useLocalSearchParams<{ bolum?: string }>();
  const asked: Section = SECTIONS.includes(bolum as Section) ? (bolum as Section) : 'ilanlar';
  const [section, setSection] = useState<Section>(asked);
  // Opening Pazar again with a section (the bell) switches to it, even when the tab is already open.
  const [lastAsked, setLastAsked] = useState(bolum);
  if (bolum !== lastAsked) {
    setLastAsked(bolum);
    if (bolum) setSection(asked);
  }
  const unread = useUnread();

  const top = (
    <View className="gap-3 px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
      <Text role="heading" className="font-heading text-[26px] tracking-tight">
        Pazar
      </Text>
      <Segmented
        label="Pazar bölümleri"
        value={section}
        onChange={setSection}
        options={[
          { id: 'ilanlar', label: 'İlanlar' },
          { id: 'fiyatlar', label: 'Fiyatlar' },
          { id: 'mesajlar', label: 'Mesajlar', badge: unread },
        ]}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {top}
      {section === 'mesajlar' ? <InboxList onBrowse={() => setSection('ilanlar')} bottomInset={24} /> : section === 'fiyatlar' ? <PriceList /> : <Listings />}
    </View>
  );
}

function Listings() {
  const { width } = useWindowDimensions();
  const cardWidth = (Math.min(width, 640) - 16 * 2 - 10) / 2;
  const now = useNow();
  const { signedIn } = useSignedIn();
  const me = useMe();
  const toggleFavorite = useToggleFavorite();
  const [text, setText] = useState('');
  const q = useDebounced(text);
  const [kategori, setKategori] = useState<CategoryId>('tumu');
  const [il, setIl] = useState('');
  const [sirala, setSirala] = useState<MarketSort>('yeni');
  const [gorunum, setGorunum] = useState<MarketView>('tumu');
  const [sorting, setSorting] = useState(false);
  const query: MarketQuery = useMemo(() => ({ q, kategori, il, sirala, gorunum }), [q, kategori, il, sirala, gorunum]);
  const needsAccount = gorunum !== 'tumu' && !signedIn;
  const listings = useListings(query, !needsAccount);
  const items = useMemo(() => listings.data?.pages.flatMap((p) => p.items) ?? [], [listings.data]);
  const total = listings.data?.pages[0]?.total ?? 0;
  const open = useCallback((id: string) => router.push({ pathname: '/ilan/[id]', params: { id } }), []);
  const filtered = !!q.trim() || kategori !== 'tumu' || !!il;
  const clear = () => {
    setText('');
    setKategori('tumu');
    setIl('');
  };
  const sortLabel = SORTS.find((s) => s.id === sirala)?.label ?? '';

  const header = (
    <View className="gap-3 pb-3">
      <View className="h-12 flex-row items-center gap-2 rounded-full border border-input bg-card pl-4 pr-1" style={{ boxShadow: SHADOW.soft }}>
        <MagnifyingGlassIcon size={20} weight="bold" color={COLORS.mutedForeground} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Traktör, buğday, pulverizatör…"
          placeholderTextColorClassName="accent-muted-foreground"
          accessibilityLabel="Pazarda ara"
          returnKeyType="search"
          className="h-full flex-1 font-sans text-[15px] text-foreground"
        />
        {text ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Aramayı temizle" onPress={() => setText('')} className="size-11 items-center justify-center rounded-full active:bg-secondary">
            <XCircleIcon size={22} weight="fill" color={COLORS.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      <Segmented label="Görünüm" value={gorunum} options={VIEWS} onChange={setGorunum} />

      <View className="flex-row flex-wrap gap-2" accessibilityRole="tablist" accessibilityLabel="Kategoriler">
        {CATEGORIES.map((c) => {
          const on = c.id === kategori;
          const Icon = CATEGORY_ICONS[c.id];
          return (
            <Pressable
              key={c.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setKategori(c.id)}
              className={cn('min-h-11 flex-row items-center gap-1.5 rounded-full border px-3.5', on ? 'border-primary bg-primary' : 'border-border bg-card active:bg-secondary')}>
              <Icon size={18} weight="duotone" color={on ? COLORS.white : COLORS.primary} />
              <Text className={cn('font-sans-semibold text-[14px]', on ? 'text-primary-foreground' : 'text-foreground')}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row flex-wrap gap-2">
        <ProvinceChip value={il} onChange={setIl} />
        <Pressable accessibilityRole="button" accessibilityLabel={`Sırala: ${sortLabel}`} onPress={() => setSorting(true)} className="min-h-11 flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3.5 active:bg-secondary">
          <ArrowsDownUpIcon size={17} weight="bold" color={COLORS.primary} />
          <Text className="font-sans-semibold text-[14px]">{sortLabel}</Text>
        </Pressable>
      </View>

      {gorunum === 'tumu' ? <SafetyStrip /> : null}

      {!needsAccount && listings.isSuccess ? (
        <Text className="text-[13px] text-muted-foreground" accessibilityLiveRegion="polite">
          {total} ilan{il ? ` · ${il}` : ''}
        </Text>
      ) : null}
    </View>
  );

  const empty = needsAccount ? (
    <SignInPrompt title={gorunum === 'favoriler' ? 'Favorileriniz için giriş yapın' : 'İlanlarınız için giriş yapın'} body="Beğendiğiniz ilanları saklamak ve kendi ilanlarınızı yönetmek için giriş yapın." />
  ) : listings.isPending ? (
    <Loading label="İlanlar yükleniyor…" />
  ) : listings.isError ? (
    <ErrorState error={listings.error} onRetry={() => listings.refetch()} />
  ) : filtered ? (
    <EmptyState title="Sonuç bulunamadı" body={q.trim() ? `“${q.trim()}” için ilan yok. Başka bir kelime deneyin ya da filtreleri temizleyin.` : 'Bu filtrelerle ilan yok. Filtreleri temizleyip tüm ilanlara bakın.'} action="Filtreleri temizle" onAction={clear} />
  ) : gorunum === 'favoriler' ? (
    <EmptyState title="Henüz favori yok" body="Beğendiğiniz ilanlardaki kalbe dokunun; burada toplansın." action="Pazara göz at" onAction={() => setGorunum('tumu')} />
  ) : gorunum === 'ilanlarim' ? (
    <EmptyState title="Henüz ilanınız yok" body="Ürününüzü, aletinizi ya da aracınızı birkaç adımda satışa çıkarın." action="İlan ver" onAction={() => router.push('/ilan/yeni')} />
  ) : (
    <EmptyState Icon={StorefrontIcon} title="Pazar henüz boş" body="İlk ilanı siz verin: ürününüzü, aletinizi ya da aracınızı birkaç adımda satışa çıkarın." action="İlan ver" onAction={() => router.push(signedIn ? '/ilan/yeni' : '/giris')} />
  );

  return (
    <>
      <FlatList<Listing>
        data={needsAccount ? [] : items}
        keyExtractor={(l) => l.id}
        numColumns={2}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={listings.isFetchingNextPage ? <ActivityIndicator className="py-4" color={COLORS.primary} /> : null}
        onEndReached={() => listings.hasNextPage && !listings.isFetchingNextPage && listings.fetchNextPage()}
        onEndReachedThreshold={0.6}
        refreshControl={<RefreshControl refreshing={listings.isRefetching && !listings.isFetchingNextPage} onRefresh={() => listings.refetch()} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96, gap: 10, width: '100%', maxWidth: 640, alignSelf: 'center' }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <ListingCard listing={item} now={now} onPress={open} onToggleFavorite={toggleFavorite} mine={item.sellerId === me.data?.id} />
          </View>
        )}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="İlan ver"
        onPress={() => router.push(signedIn ? '/ilan/yeni' : '/giris')}
        className="absolute bottom-4 right-4 h-14 flex-row items-center gap-2 rounded-full bg-primary pl-4 pr-5 active:scale-95"
        style={{ boxShadow: SHADOW.lift }}>
        <PlusIcon size={22} weight="bold" color={COLORS.white} />
        <Text className="font-sans-bold text-[16px] text-primary-foreground">İlan ver</Text>
      </Pressable>

      <Dialog open={sorting} onOpenChange={setSorting}>
        <DialogContent className="mx-4 rounded-[24px] border-border bg-background">
          <DialogHeader>
            <DialogTitle className="font-heading text-[20px]">Sırala</DialogTitle>
          </DialogHeader>
          <View accessibilityRole="radiogroup" className="gap-1">
            {SORTS.map((s) => {
              const on = s.id === sirala;
              return (
                <Pressable
                  key={s.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  onPress={() => {
                    setSirala(s.id);
                    setSorting(false);
                  }}
                  className={cn('min-h-14 flex-row items-center justify-between rounded-[14px] px-4', on ? 'bg-secondary' : 'active:bg-secondary')}>
                  <Text className={cn('text-[16px]', on && 'font-sans-bold text-primary')}>{s.label}</Text>
                  {on ? <CheckIcon size={20} weight="bold" color={COLORS.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        </DialogContent>
      </Dialog>
    </>
  );
}
