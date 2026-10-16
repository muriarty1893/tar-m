import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

import { RoundButton } from './round-button';

export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** Title row for pushed screens: a back button, then the title. */
export function BackHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View className="flex-row items-center gap-3 px-4">
      <RoundButton icon="alt-arrow-left-linear" label="Geri" onPress={goBack} className="bg-card" />
      <View className="flex-1">
        <Text role="heading" className="font-heading text-3xl tracking-tight">
          {title}
        </Text>
        {subtitle ? <Text className="text-base text-muted-foreground">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

/** A big tab-screen title. */
export function TabTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="px-5">
      <Text role="heading" className="font-heading text-4xl tracking-tight">
        {title}
      </Text>
      {subtitle ? <Text className="mt-1 text-lg text-muted-foreground">{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <View className="mt-2 flex-row items-end justify-between px-5">
      <Text role="heading" className="font-heading text-2xl tracking-tight">
        {children}
      </Text>
      {action}
    </View>
  );
}
