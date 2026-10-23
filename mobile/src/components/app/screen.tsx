import type { ReactElement, ReactNode } from 'react';
import { ScrollView, View, type RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

import { TAB_BAR_HEIGHT } from './tab-bar';

/**
 * A tab screen: scrolls under the status bar and clears the bottom tab bar. A `header` (home's top bar)
 * stays put above the scrolling content and takes care of the status bar itself.
 */
export function TabScreen({ children, className, refreshControl, header }: { children: ReactNode; className?: string; refreshControl?: ReactElement<RefreshControlProps>; header?: ReactNode }) {
  const insets = useSafeAreaInsets();
  const scroll = (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: header ? 16 : insets.top + 8, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}>
      <View className={cn('px-4', className)}>{children}</View>
    </ScrollView>
  );
  if (!header) return scroll;
  return (
    <View className="flex-1 bg-background">
      {header}
      {scroll}
    </View>
  );
}

/** The demo's screen title ("Hava durumu", "Tarım takvimi", "Geçmiş taramalar"). */
export function ScreenTitle({ children }: { children: string }) {
  return (
    <Text role="heading" className="mb-3 font-heading text-[26px] tracking-tight">
      {children}
    </Text>
  );
}

/** A section heading inside a screen ("Tarım Borsası Fiyatları", "7 günlük tarım tahmini"). */
export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Text role="heading" className={cn('font-heading text-[19px]', className)}>
      {children}
    </Text>
  );
}
