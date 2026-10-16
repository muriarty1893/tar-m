import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/theme/tokens';

/** A ring showing a field's health (0–1): olive when good, amber when it needs attention. */
export function HealthRing({ value, size = 96 }: { value: number; size?: number }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = value >= 0.8 ? COLORS.olive : value >= 0.6 ? COLORS.amber : COLORS.brick;
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center" accessibilityLabel={`Sağlık yüzde ${Math.round(value * 100)}`}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={COLORS.secondary} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c * value} ${c}`} />
      </Svg>
      <Text className="font-heading text-2xl">%{Math.round(value * 100)}</Text>
    </View>
  );
}
