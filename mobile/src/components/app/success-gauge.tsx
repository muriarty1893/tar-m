import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { successTone } from '@/domain/scenarios';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

const W = 224;
const R = 92;
const STROKE = 24;
const CX = W / 2;
const CY = R + STROKE / 2;

/** A point on the half circle, 0 = left end, 1 = right end. */
const at = (t: number) => {
  const a = Math.PI * (1 - t);
  return `${CX + R * Math.cos(a)} ${CY - R * Math.sin(a)}`;
};
const arc = (t: number) => `M ${at(0)} A ${R} ${R} 0 0 1 ${at(t)}`;

/** The demo's half-donut "Hasat başarı tahmini", with the number counting up. */
export function SuccessGauge({ value, label = 'Hasat başarı tahmini' }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const tone = successTone(v);
  const color = tone === 'destructive' ? COLORS.destructive : tone === 'gold' ? COLORS.gold : COLORS.primary;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / 900);
      setShown(Math.round(v * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [v]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: v, text: `%${v}` }}
      className="items-center rounded-2xl bg-secondary/60 px-4 pb-3 pt-3">
      <View style={{ width: W, height: CY + 2 }}>
        <Svg width={W} height={CY + 2}>
          <Path d={arc(1)} stroke={COLORS.muted} strokeWidth={STROKE} fill="none" />
          {shown > 0 ? <Path d={arc(shown / 100)} stroke={color} strokeWidth={STROKE} fill="none" /> : null}
        </Svg>
        <Text className={cn('absolute inset-x-0 bottom-0 text-center font-heading text-[30px] leading-[32px]', tone === 'destructive' ? 'text-destructive' : tone === 'gold' ? 'text-gold' : 'text-primary')}>
          %{shown}
        </Text>
      </View>
      <Text className="mt-1.5 text-center font-sans-semibold text-[14px]">{label}</Text>
    </View>
  );
}
