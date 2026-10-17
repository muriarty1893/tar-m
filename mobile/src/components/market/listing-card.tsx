import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { HeartIcon, MapPinIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { ME, conditionLabel, formatPrice, type Listing, type ListingStatus } from '@/domain/market';
import { agoLabel } from '@/domain/when';
import { cn } from '@/lib/utils';
import { COLORS, SHADOW } from '@/theme/tokens';

type Props = {
  listing: Listing;
  favorite: boolean;
  status?: ListingStatus;
  now: Date;
  onPress: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  className?: string;
};

/** A listing in the grid: photo with a heart, price, title, and place · time. */
export const ListingCard = memo(function ListingCard({ listing: l, favorite, status, now, onPress, onToggleFavorite, className }: Props) {
  const place = l.location.split(',')[0];
  const when = agoLabel(new Date(l.postedAt), now);
  const condition = conditionLabel(l.condition);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${l.title}. ${formatPrice(l.price)}${l.unit ? ` ${l.unit} başına` : ''}. ${l.location}, ${when}${status === 'sold' ? '. Satıldı' : ''}`}
      onPress={() => onPress(l.id)}
      className={cn('overflow-hidden rounded-[20px] border border-border bg-card active:opacity-90', className)}
      style={{ boxShadow: SHADOW.soft }}>
      <View>
        <Image source={l.photos[0]} style={{ width: '100%', aspectRatio: 4 / 3 }} contentFit="cover" transition={150} accessibilityIgnoresInvertColors />
        {condition ? (
          <View className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5">
            <Text className="font-sans-semibold text-[11.5px]">{condition}</Text>
          </View>
        ) : null}
        {l.sellerId === ME.id ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            accessibilityState={{ selected: favorite }}
            onPress={() => onToggleFavorite(l.id)}
            hitSlop={6}
            className="absolute right-1.5 top-1.5 size-10 items-center justify-center rounded-full bg-white/95 active:scale-90">
            <HeartIcon size={20} weight={favorite ? 'fill' : 'bold'} color={favorite ? COLORS.destructive : COLORS.foreground} />
          </Pressable>
        )}
        {l.stockPhoto ? (
          <View className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5">
            <Text className="font-sans-medium text-[11px] text-white">Temsilî görsel</Text>
          </View>
        ) : null}
        {status === 'sold' ? (
          <View className="absolute inset-0 items-center justify-center bg-black/45">
            <Text className="font-heading text-[16px] tracking-[2px] text-white">SATILDI</Text>
          </View>
        ) : null}
      </View>
      <View className="gap-0.5 px-2.5 pb-2.5 pt-2">
        <Text numberOfLines={1} className="font-heading text-[16px] leading-[21px]">
          {formatPrice(l.price)}
          {l.unit ? <Text className="font-sans-medium text-[12.5px] text-muted-foreground"> / {l.unit}</Text> : null}
        </Text>
        <Text numberOfLines={2} className="min-h-[38px] font-sans-medium text-[14px] leading-[19px]">
          {l.title}
        </Text>
        <View className="mt-0.5 flex-row items-center gap-1">
          <MapPinIcon size={13} weight="fill" color={COLORS.mutedForeground} />
          <Text numberOfLines={1} className="flex-1 text-[12.5px] text-muted-foreground">
            {place} · {when}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});
