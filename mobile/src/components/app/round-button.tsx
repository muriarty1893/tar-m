import { Pressable } from 'react-native';

import { SolarIcon } from '@/components/icons/solar-icon';
import type { SolarName } from '@/components/icons/solar';
import { cn } from '@/lib/utils';
import type { ColorName } from '@/theme/tokens';

type Props = {
  icon: SolarName;
  label: string;
  onPress: () => void;
  /** "light" sits on photos, "dark" on camera views. */
  tone?: 'light' | 'dark';
  iconColor?: ColorName;
  className?: string;
};

/** The design's 48 px round icon button (back, share, close, flash). */
export function RoundButton({ icon, label, onPress, tone = 'light', iconColor, className }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      className={cn(
        'size-12 items-center justify-center rounded-full active:opacity-80',
        tone === 'light' ? 'bg-background/90' : 'bg-foreground/45',
        className
      )}>
      <SolarIcon name={icon} size={26} color={iconColor ?? (tone === 'light' ? 'foreground' : 'background')} />
    </Pressable>
  );
}
