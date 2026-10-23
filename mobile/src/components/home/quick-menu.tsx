import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import {
  ArrowRightIcon,
  CalendarDotsIcon,
  ChartLineUpIcon,
  CloudSunIcon,
  MapTrifoldIcon,
  MegaphoneIcon,
  ScanIcon,
  StorefrontIcon,
  TractorIcon,
  type PhosphorIcon,
} from '@/components/icons';
import { Text } from '@/components/ui/text';
import { COLORS, TILE_TONES, type TileTone } from '@/theme/tokens';

type Item = { label: string; Icon: PhosphorIcon; tone: TileTone; href: Href; tab?: boolean };

/** In columns of two, read top to bottom; the first three columns fit, the rest scroll in. */
const ITEMS: Item[] = [
  { label: 'Hastalık Tara', Icon: ScanIcon, tone: 'emerald', href: '/tara' },
  { label: 'Tarlalarım', Icon: TractorIcon, tone: 'amber', href: '/tarlalar' },
  { label: 'Hava Durumu', Icon: CloudSunIcon, tone: 'sky', href: '/hava' },
  { label: 'Tarla Haritası', Icon: MapTrifoldIcon, tone: 'teal', href: '/harita' },
  { label: 'Tarım Takvimi', Icon: CalendarDotsIcon, tone: 'indigo', href: '/takvim', tab: true },
  { label: 'Fiyatlar', Icon: ChartLineUpIcon, tone: 'purple', href: '/fiyatlar' },
  { label: 'Pazar', Icon: StorefrontIcon, tone: 'rose', href: '/pazar', tab: true },
  { label: 'İlan Ver', Icon: MegaphoneIcon, tone: 'orange', href: '/ilan/yeni' },
];

const COLUMNS = Array.from({ length: Math.ceil(ITEMS.length / 2) }, (_, i) => ITEMS.slice(i * 2, i * 2 + 2));
const GAP = 10;
/** Screen gutter (16) and the card's padding (16), each side. */
const INSET = 64;

/** "Hızlı Menü Kısayolları": bright icon tiles in a white card, two rows that scroll sideways. */
export function QuickMenu() {
  const { width } = useWindowDimensions();
  const tile = Math.floor((width - INSET - GAP * 2) / 3);
  return (
    <View className="rounded-[28px] border border-border bg-card py-4">
      <View className="flex-row items-center justify-between px-4">
        <Text role="heading" className="font-sans-bold text-[13.5px] uppercase tracking-[1.2px] text-foreground/80">
          Hızlı Menü Kısayolları
        </Text>
        <View className="flex-row items-center gap-1" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Text className="font-sans-semibold text-[13px] text-muted-foreground">Kaydırın</Text>
          <ArrowRightIcon size={14} weight="bold" color={COLORS.mutedForeground} />
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ paddingHorizontal: 16, gap: GAP }} snapToInterval={tile + GAP} decelerationRate="fast">
        {COLUMNS.map((col) => (
          <View key={col[0].label} style={{ gap: GAP }}>
            {col.map((item) => (
              <Tile key={item.label} item={item} width={tile} />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Tile({ item, width }: { item: Item; width: number }) {
  const tone = TILE_TONES[item.tone];
  const { Icon } = item;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      onPress={() => (item.tab ? router.navigate(item.href) : router.push(item.href))}
      className="items-center gap-2 rounded-[20px] border px-1 pb-3 pt-3.5 active:scale-[0.97] active:opacity-90"
      style={{ width, backgroundColor: tone.bg, borderColor: tone.line }}>
      <View className="size-12 items-center justify-center rounded-2xl" style={{ backgroundColor: tone.solid, boxShadow: `0px 6px 14px -6px ${tone.solid}` }}>
        <Icon size={24} weight="bold" color={COLORS.white} />
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} className="font-sans-bold text-[13.5px]">
        {item.label}
      </Text>
    </Pressable>
  );
}
