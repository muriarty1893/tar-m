import { View } from 'react-native';

import { GrainsIcon, PlantIcon, SealCheckIcon, ShieldCheckIcon, ShovelIcon, StarIcon, StorefrontIcon, TractorIcon, WrenchIcon, type PhosphorIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { unreadCount } from '@/domain/chat';
import type { CategoryId, Seller } from '@/domain/market';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';
import { AVATAR_TONES, COLORS } from '@/theme/tokens';

export const CATEGORY_ICONS: Record<CategoryId, PhosphorIcon> = {
  tumu: StorefrontIcon,
  urun: GrainsIcon,
  tohum: PlantIcon,
  alet: ShovelIcon,
  ekipman: WrenchIcon,
  arac: TractorIcon,
};

/** How many chats have unread messages. */
export function useUnreadChats() {
  return useAppStore((s) => s.conversations.filter((c) => unreadCount(c) > 0).length);
}

/** A person's initials in a tinted circle (no photos of real people). */
export function Avatar({ seller, size = 44 }: { seller: Pick<Seller, 'id' | 'name'>; size?: number }) {
  const tone = AVATAR_TONES[[...seller.id].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  const initials = seller.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
  return (
    <View className="items-center justify-center rounded-full" style={{ width: size, height: size, backgroundColor: tone.bg }} importantForAccessibility="no-hide-descendants">
      <Text className="font-heading" style={{ color: tone.fg, fontSize: size * 0.38 }}>
        {initials}
      </Text>
    </View>
  );
}

/** "★ 4,8 (31)" */
export function Rating({ seller }: { seller: Pick<Seller, 'rating' | 'reviews'> }) {
  return (
    <View className="flex-row items-center gap-1" accessible accessibilityLabel={`5 üzerinden ${seller.rating.toFixed(1).replace('.', ',')} puan, ${seller.reviews} değerlendirme`}>
      <StarIcon size={14} weight="fill" color={COLORS.gold} />
      <Text className="font-sans-semibold text-[13px]">{seller.rating.toFixed(1).replace('.', ',')}</Text>
      <Text className="text-[13px] text-muted-foreground">({seller.reviews})</Text>
    </View>
  );
}

export function VerifiedMark({ seller }: { seller: Pick<Seller, 'verified'> }) {
  if (!seller.verified) return null;
  return (
    <View className="flex-row items-center gap-1">
      <SealCheckIcon size={15} weight="fill" color={COLORS.primary} />
      <Text className="font-sans-semibold text-[12.5px] text-primary">Telefonu doğrulandı</Text>
    </View>
  );
}

/** The market's standing safety reminder. */
export function SafetyStrip({ className }: { className?: string }) {
  return (
    <View className={cn('flex-row items-center gap-2.5 rounded-[16px] bg-gold-soft px-3 py-2.5', className)}>
      <ShieldCheckIcon size={22} weight="duotone" color={COLORS.gold} />
      <Text className="flex-1 text-[13px] leading-[18px] text-foreground">
        <Text className="font-sans-bold text-[13px]">Güvenli alışveriş: </Text>
        Ürünü görmeden kapora ya da ödeme göndermeyin.
      </Text>
    </View>
  );
}
