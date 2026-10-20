import { View } from 'react-native';

import { SealCheckIcon, WarningIcon, WarningOctagonIcon, type PhosphorIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { HEALTH, type Health } from '@/domain/fields';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

/** Each health level has its own icon and word, so it never rests on colour alone. */
export const HEALTH_STYLE: Record<Health, { Icon: PhosphorIcon; color: string; fill: string; line: string; soft: string; badge: string; text: string }> = {
  saglikli: { Icon: SealCheckIcon, color: COLORS.primary, fill: 'rgba(34, 197, 94, 0.28)', line: '#86efac', soft: '#f0fdf4', badge: 'bg-secondary', text: 'text-primary' },
  izlenmeli: { Icon: WarningIcon, color: COLORS.gold, fill: 'rgba(250, 204, 21, 0.32)', line: '#facc15', soft: '#fefce8', badge: 'bg-gold-soft', text: 'text-gold' },
  riskli: { Icon: WarningOctagonIcon, color: COLORS.destructive, fill: 'rgba(239, 68, 68, 0.32)', line: '#f87171', soft: '#fef2f2', badge: 'bg-destructive/10', text: 'text-destructive' },
};

export function HealthBadge({ health, className }: { health: Health; className?: string }) {
  const { Icon, color, badge, text } = HEALTH_STYLE[health];
  return (
    <View className={cn('flex-row items-center gap-1 self-start rounded-full px-2 py-0.5', badge, className)}>
      <Icon size={14} weight="fill" color={color} />
      <Text className={cn('font-sans-bold text-[12.5px]', text)}>{HEALTH[health].label}</Text>
    </View>
  );
}
