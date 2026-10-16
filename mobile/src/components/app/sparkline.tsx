import Svg, { Polyline } from 'react-native-svg';

import { COLORS, type ColorName } from '@/theme/tokens';

/** A small trend line for a week of prices. */
export function Sparkline({ values, color, width = 72, height = 28 }: { values: number[]; color: ColorName; width?: number; height?: number }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - 3 - ((v - min) / span) * (height - 6)}`).join(' ');
  return (
    <Svg width={width} height={height} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Polyline points={points} fill="none" stroke={COLORS[color]} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
