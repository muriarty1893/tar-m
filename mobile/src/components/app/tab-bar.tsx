import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SolarIcon } from '@/components/icons/solar-icon';
import type { SolarName } from '@/components/icons/solar';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/** Space a tab screen leaves at the bottom so its content clears the floating bar. */
export const TAB_BAR_SPACE = 108;

const TABS: Record<string, { label: string; icon: SolarName; active: SolarName }> = {
  index: { label: 'Bugün', icon: 'home-2-linear', active: 'home-2-bold' },
  tarlalar: { label: 'Tarlalar', icon: 'leaf-linear', active: 'leaf-bold' },
  takvim: { label: 'Takvim', icon: 'calendar-linear', active: 'calendar-bold' },
  profil: { label: 'Profil', icon: 'user-circle-linear', active: 'user-circle-bold' },
};

export const SCAN_TAB = 'tara-sekmesi';

const tap = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync();
};

/** The floating soil-brown tab bar, with scanning as a raised terracotta button in the middle. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0 px-4" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
      <View className="h-[72px] flex-row items-center justify-around rounded-full bg-foreground px-2" style={{ boxShadow: '0px 10px 30px rgba(59, 42, 30, 0.25)' }}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          if (route.name === SCAN_TAB) {
            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityLabel="Yaprağı tara"
                onPress={() => {
                  tap();
                  router.push('/tara');
                }}
                className="-mt-9 size-[72px] items-center justify-center rounded-full border-[5px] border-background bg-accent active:opacity-90">
                <SolarIcon name="scanner-linear" size={32} color="accentForeground" />
              </Pressable>
            );
          }
          const tab = TABS[route.name];
          if (!tab) return null;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (focused || event.defaultPrevented) return;
                tap();
                navigation.navigate(route.name, route.params);
              }}
              className="min-w-[60px] items-center justify-center gap-0.5 py-2">
              <SolarIcon name={focused ? tab.active : tab.icon} size={26} color={focused ? 'background' : 'wheat'} />
              <Text className={cn('text-[13px]', focused ? 'font-sans-bold text-background' : 'text-wheat')}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
