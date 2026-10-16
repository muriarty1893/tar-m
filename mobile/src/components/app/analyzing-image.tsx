import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { COLORS } from '@/theme/tokens';

// The website demo's "Analyzing image" loader (21st.dev Loading UI, components/ui/analyzing-image.tsx):
// the same artwork and 2.5 s mirrored sweep, driven by Reanimated.
const FRAME = 'M6.8 21H17.2C18.8802 21 19.7202 21 20.362 20.673C20.9265 20.3854 21.3854 19.9265 21.673 19.362C22 18.7202 22 17.8802 22 16.2V7.8C22 6.11984 22 5.27976 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3H6.8C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8V16.2C2 17.8802 2 18.7202 2.32698 19.362C2.6146 19.9265 3.07354 20.3854 3.63803 20.673C4.27976 21 5.11984 21 6.8 21Z';
const PICTURE = 'M4.27209 20.7279L10.8686 14.1314C11.2646 13.7354 11.4627 13.5373 11.691 13.4632C11.8918 13.3979 12.1082 13.3979 12.309 13.4632C12.5373 13.5373 12.7354 13.7354 13.1314 14.1314L19.6839 20.6839M14 15L16.8686 12.1314C17.2646 11.7354 17.4627 11.5373 17.691 11.4632C17.8918 11.3979 18.1082 11.3979 18.309 11.4632C18.5373 11.5373 18.7354 11.7354 19.1314 12.1314L22 15M10 9C10 10.1046 9.10457 11 8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7C9.10457 7 10 7.89543 10 9Z' + FRAME;
const PIXELS: [number, number, number, number][] = [[6, 19, 1, 1], [7, 18, 1, 1], [7, 19, 3, 1], [9, 18, 1, 1], [14, 19, 3, 1], [15, 18, 1, 1], [5, 18, 2, 1], [5, 17, 1, 1],
  [10, 19, 1, 1], [7, 17, 1, 1], [11, 19, 1, 1], [10, 18, 1, 1], [17, 19, 1, 1], [15, 4, 2, 1], [3, 9, 1, 3], [4, 10, 1, 2],
  [6, 9, 1, 1], [15, 5, 1, 1], [20, 8, 1, 3], [19, 9, 1, 1], [7, 13, 1, 1], [9, 11, 1, 1], [16, 12, 1, 2], [13, 14, 1, 1],
  [12, 11, 1, 1], [10, 9, 1, 1], [10, 15, 1, 1], [10, 13, 1, 1], [15, 9, 1, 1], [13, 10, 1, 1], [12, 14, 1, 1], [5, 4, 3, 1],
  [6, 5, 1, 1], [7, 14, 1, 2], [6, 14, 3, 1], [16, 8, 1, 1], [8, 9, 1, 1], [20, 16, 1, 1], [12, 12, 1, 1], [8, 8, 1, 1],
  [14, 12, 1, 1], [17, 16, 2, 1], [14, 17, 1, 1], [11, 5, 3, 1], [12, 4, 1, 1], [12, 7, 1, 1], [7, 11, 1, 1], [15, 15, 1, 1],
  [11, 11, 1, 1], [13, 9, 1, 1], [12, 15, 1, 1], [9, 12, 2, 1], [19, 13, 2, 1], [9, 6, 1, 1], [20, 4, 1, 1], [19, 4, 1, 1],
  [3, 15, 1, 2], [3, 19, 1, 1],];

const EASE = Easing.bezier(0.175, 0.885, 0.32, 1);
const sweep = (to: number, from: number) =>
  withRepeat(withSequence(withTiming(to, { duration: 1500, easing: EASE }), withTiming(from, { duration: 1000, easing: EASE })), -1, false, undefined, ReduceMotion.System);

export function AnalyzingImage({ size = 56, color = COLORS.primary, background = COLORS.white }: { size?: number; color?: string; background?: string }) {
  const [w, setW] = useState(size);
  const wipe = useSharedValue(1);
  const bar = useSharedValue(1);
  useEffect(() => {
    wipe.set(sweep(0, 1));
    bar.set(sweep(0, 1));
  }, [wipe, bar]);
  const wipeStyle = useAnimatedStyle(() => ({ width: wipe.value * w }));
  const barStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -0.06 * w + bar.value * w }] }));
  const stroke = { stroke: color, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Fotoğraf analiz ediliyor" style={{ width: size, height: size }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Svg viewBox="0 0 24 24" width={size} height={size} style={{ position: 'absolute' }}>
        <Path d={FRAME} {...stroke} />
        {PIXELS.map(([x, y, pw, ph]) => (
          <Rect key={`${x}-${y}`} x={x} y={y} width={pw} height={ph} fill={color} />
        ))}
      </Svg>
      <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, overflow: 'hidden', backgroundColor: background }, wipeStyle]}>
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path d={PICTURE} {...stroke} />
        </Svg>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: size * 0.07, borderRadius: 99, backgroundColor: color }, barStyle]} />
    </View>
  );
}
