import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowLeftIcon, CrosshairIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { COLORS, SHADOW } from '@/theme/tokens';

/** The map screens' top row over the map: back, the title in a pill, and "Konumuma git". */
export function MapTopBar({ title, subtitle, onLocate, locating, fallback = '/tarlalar' }: { title: string; subtitle?: string; onLocate?: () => void; locating?: boolean; fallback?: '/tarlalar' }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="absolute inset-x-3 flex-row items-center gap-2" style={{ top: insets.top + 8 }} pointerEvents="box-none">
      <MapButton label="Geri" onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}>
        <ArrowLeftIcon size={21} weight="bold" color={COLORS.foreground} />
      </MapButton>
      <View className="min-w-0 flex-1 rounded-[18px] bg-white/95 px-3.5 py-2" style={{ boxShadow: SHADOW.soft }}>
        <Text role="heading" numberOfLines={1} className="font-heading text-[17px]">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="text-[12.5px] text-muted-foreground">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onLocate ? (
        <MapButton label="Konumuma git" onPress={onLocate}>
          {locating ? <ActivityIndicator color={COLORS.primary} /> : <CrosshairIcon size={22} weight="bold" color={COLORS.primary} />}
        </MapButton>
      ) : null}
    </View>
  );
}

export function MapButton({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} className="size-12 items-center justify-center rounded-full bg-white/95 active:scale-95" style={{ boxShadow: SHADOW.soft }}>
      {children}
    </Pressable>
  );
}

/** The card at the bottom of a map screen. */
export function MapSheet({ children, onHeight }: { children: ReactNode; onHeight?: (h: number) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      onLayout={(e: LayoutChangeEvent) => onHeight?.(Math.round(e.nativeEvent.layout.height))}
      className="absolute inset-x-0 bottom-0 gap-3 rounded-t-[26px] border-t border-border bg-background px-4 pt-4"
      style={{ paddingBottom: insets.bottom + 14, boxShadow: '0px -10px 30px -18px rgba(15,23,42,0.35)' }}>
      {children}
    </View>
  );
}

/** How much of the map the top bar and the bottom sheet cover, for FieldMapDom's `inset`. */
export function useMapInset() {
  const insets = useSafeAreaInsets();
  const [bottom, setBottom] = useState(220);
  return { inset: { top: insets.top + 8 + 56 + 8, bottom: bottom + 8 }, onSheetHeight: setBottom };
}
