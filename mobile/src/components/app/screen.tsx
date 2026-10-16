import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

import { TAB_BAR_HEIGHT } from './tab-bar';

/** A tab screen: scrolls under the status bar and clears the bottom tab bar. */
export function TabScreen({ children, className }: { children: ReactNode; className?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}>
      <View className={cn('px-4', className)}>{children}</View>
    </ScrollView>
  );
}

/** The demo's screen title ("Hava durumu", "Tarım takvimi", "Geçmiş taramalar"). */
export function ScreenTitle({ children }: { children: string }) {
  return (
    <Text role="heading" className="mb-3 font-heading text-[24px]">
      {children}
    </Text>
  );
}

/** A section heading inside a screen ("Hızlı İşlemler", "5 günlük tarım tahmini"). */
export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Text role="heading" className={cn('font-heading text-[17px]', className)}>
      {children}
    </Text>
  );
}
