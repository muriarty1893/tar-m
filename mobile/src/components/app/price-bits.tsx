import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { ArrowDownIcon, ArrowUpIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

const toneOf = (change: number) => (change > 0 ? COLORS.primary : change < 0 ? COLORS.destructive : COLORS.mutedForeground);

/** A price's last six weeks as a tiny line, green when up, red when down (decorative: the pill says it in words). */
export function Sparkline({ line, change, width = 40, height = 16 }: { line: number[]; change: number; width?: number; height?: number }) {
  const step = 40 / (line.length - 1);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={width} height={height} viewBox="0 0 40 16">
        <Polyline points={line.map((y, i) => `${i * step},${y}`).join(' ')} fill="none" stroke={toneOf(change)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

/** "+%2,1" with an arrow; "%0,0" with no arrow when the price didn't move. */
export function ChangePill({ change }: { change: number }) {
  const tone = toneOf(change);
  const size = `%${String(Math.abs(change).toFixed(1)).replace('.', ',')}`;
  return (
    <View className={cn('flex-row items-center gap-0.5 rounded-full px-1.5 py-0.5', change > 0 ? 'bg-secondary' : change < 0 ? 'bg-destructive/10' : 'bg-muted')}>
      {change > 0 ? <ArrowUpIcon size={12} weight="bold" color={tone} /> : change < 0 ? <ArrowDownIcon size={12} weight="bold" color={tone} /> : null}
      <Text className={cn('font-sans-bold text-[12px]', change > 0 ? 'text-primary' : change < 0 ? 'text-destructive' : 'text-muted-foreground')}>
        {change > 0 ? '+' : change < 0 ? '−' : ''}
        {size}
      </Text>
    </View>
  );
}
