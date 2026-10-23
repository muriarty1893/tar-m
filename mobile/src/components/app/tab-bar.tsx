import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalendarDotsIcon, ClockCounterClockwiseIcon, HouseIcon, ScanIcon, StorefrontIcon, type PhosphorIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

export const TAB_BAR_HEIGHT = 72;
export const SCAN_TAB = 'taramalar';

const TABS: Record<string, { label: string; Icon: PhosphorIcon }> = {
  index: { label: 'Ana sayfa', Icon: HouseIcon },
  [SCAN_TAB]: { label: 'Taramalar', Icon: ScanIcon },
  pazar: { label: 'Pazar', Icon: StorefrontIcon },
  takvim: { label: 'Takvim', Icon: CalendarDotsIcon },
  gecmis: { label: 'Geçmiş', Icon: ClockCounterClockwiseIcon },
};

const tap = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync();
};

/** The bottom bar: five tabs on white, the active one green in a pale-green pill. "Taramalar" opens the camera. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-row items-start justify-around border-t border-border bg-card px-2 pt-1.5" style={{ height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const on = state.index === index;
        const { Icon } = tab;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={tab.label}
            onPress={() => {
              tap();
              if (route.name === SCAN_TAB) return router.push('/tara');
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!on && !event.defaultPrevented) navigation.navigate(route.name, route.params);
            }}
            className="min-h-12 w-[68px] items-center gap-1 rounded-2xl pt-1 active:bg-secondary">
            <View className="h-7 w-12 items-center justify-center">
              {/* Its own view, mounted when active: a toggled background lost its rounded corners on Android. */}
              {on ? <View className="absolute inset-0 rounded-full bg-secondary" /> : null}
              <Icon size={22} weight={on ? 'fill' : 'regular'} color={on ? COLORS.primary : COLORS.mutedForeground} />
            </View>
            <Text className={cn('font-sans-semibold text-[12px]', on ? 'text-primary' : 'text-muted-foreground')}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
