import { View } from 'react-native';

import { GrainsIcon, PlantIcon, ShieldCheckIcon, ShovelIcon, StorefrontIcon, TractorIcon, WrenchIcon, type PhosphorIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import type { CategoryId } from '@/domain/market';
import { cn } from '@/lib/utils';
import { AVATAR_TONES, COLORS } from '@/theme/tokens';

export const CATEGORY_ICONS: Record<CategoryId, PhosphorIcon> = {
  tumu: StorefrontIcon,
  urun: GrainsIcon,
  tohum: PlantIcon,
  alet: ShovelIcon,
  ekipman: WrenchIcon,
  arac: TractorIcon,
};

/** A person's initials in a tinted circle (no photos of people); the tint follows the name. */
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const tone = AVATAR_TONES[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toLocaleUpperCase('tr-TR');
  return (
    <View className="items-center justify-center rounded-full" style={{ width: size, height: size, backgroundColor: tone.bg }} importantForAccessibility="no-hide-descendants">
      <Text className="font-heading" style={{ color: tone.fg, fontSize: size * 0.38 }}>
        {initials || '?'}
      </Text>
    </View>
  );
}

/** The market's standing safety reminder. */
export function SafetyStrip({ className }: { className?: string }) {
  return (
    <View className={cn('flex-row items-center gap-2.5 rounded-[16px] bg-gold-soft px-3 py-2.5', className)}>
      <ShieldCheckIcon size={22} weight="duotone" color={COLORS.gold} />
      <Text className="flex-1 text-[13.5px] leading-[19px] text-foreground">
        <Text className="font-sans-bold text-[13.5px]">Güvenli alışveriş: </Text>
        Ürünü görmeden kapora ya da ödeme göndermeyin.
      </Text>
    </View>
  );
}
