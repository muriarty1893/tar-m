import { CloudFogIcon, CloudIcon, CloudLightningIcon, CloudRainIcon, CloudSunIcon, MoonIcon, SnowflakeIcon, SunIcon, type PhosphorIcon } from '@/components/icons';
import type { WeatherIcon as Kind } from '@/domain/weather';
import { COLORS } from '@/theme/tokens';

const ICONS: Record<Kind, { Icon: PhosphorIcon; color: string }> = {
  sun: { Icon: SunIcon, color: COLORS.gold },
  moon: { Icon: MoonIcon, color: COLORS.sky600 },
  'cloud-sun': { Icon: CloudSunIcon, color: COLORS.gold },
  cloud: { Icon: CloudIcon, color: COLORS.mutedForeground },
  fog: { Icon: CloudFogIcon, color: COLORS.mutedForeground },
  rain: { Icon: CloudRainIcon, color: COLORS.sky600 },
  snow: { Icon: SnowflakeIcon, color: COLORS.sky500 },
  storm: { Icon: CloudLightningIcon, color: COLORS.gold },
};

/** The Phosphor icon for a weather kind, in its own colour, or `color` (e.g. white on the photo card). */
export function WeatherIcon({ kind, size = 24, color, weight = 'duotone' }: { kind: Kind; size?: number; color?: string; weight?: 'duotone' | 'fill' }) {
  const { Icon, color: own } = ICONS[kind];
  return <Icon size={size} weight={weight} color={color ?? own} />;
}
