import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/utils';

import { TAB_BAR_SPACE } from './tab-bar';

type Props = {
  children: ReactNode;
  /** Leaves room for the floating tab bar on tab screens. */
  tabs?: boolean;
  /** Skip the top inset when the screen draws its own image header. */
  edgeToEdgeTop?: boolean;
  className?: string;
  /** Pinned below the scrolling content (e.g. a primary action), above the home indicator. */
  footer?: ReactNode;
};

/** A scrolling screen on the cream background that owns its safe-area insets. */
export function Screen({ children, tabs, edgeToEdgeTop, className, footer }: Props) {
  const insets = useSafeAreaInsets();
  const bottom = tabs ? TAB_BAR_SPACE + insets.bottom : footer ? 16 : insets.bottom + 24;
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: edgeToEdgeTop ? 0 : insets.top + 12, paddingBottom: bottom }}
        showsVerticalScrollIndicator={false}>
        <View className={cn('gap-4', className)}>{children}</View>
      </ScrollView>
      {footer ? <View style={{ paddingBottom: insets.bottom + 12 }} className="gap-3 bg-background px-4 pt-3">{footer}</View> : null}
    </View>
  );
}
