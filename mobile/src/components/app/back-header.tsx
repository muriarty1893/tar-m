import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { ArrowLeftIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { COLORS, SHADOW } from '@/theme/tokens';

/** A stack screen's top row: back (home when there's nothing to go back to), the title, and an optional action. */
export function BackHeader({ title, subtitle, right, fallback = '/' }: { title: string; subtitle?: string; right?: ReactNode; fallback?: Href }) {
  return (
    <View className="mb-3 flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Geri"
        onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
        className="size-11 items-center justify-center rounded-full border border-border bg-card active:bg-secondary"
        style={{ boxShadow: SHADOW.soft }}>
        <ArrowLeftIcon size={21} weight="bold" color={COLORS.foreground} />
      </Pressable>
      <View className="min-w-0 flex-1">
        <Text role="heading" numberOfLines={1} className="font-heading text-[24px]">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="text-[13px] text-muted-foreground">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
