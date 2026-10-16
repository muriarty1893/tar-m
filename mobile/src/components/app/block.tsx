import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { PhosphorIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/theme/tokens';

/** The demo result's info block: a green icon tile, a small caps label (pass it in capitals), then the content. */
export function Block({ Icon, label, children }: { Icon: PhosphorIcon; label: string; children: ReactNode }) {
  return (
    <View className="flex-row gap-3 rounded-[20px] bg-card p-3.5" style={{ boxShadow: '0px 1px 2px rgba(20, 83, 45, 0.06)' }}>
      <View className="size-10 items-center justify-center rounded-xl bg-secondary">
        <Icon size={21} weight="duotone" color={COLORS.primary} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="font-sans-bold text-[12.5px] tracking-[1.6px] text-muted-foreground">{label}</Text>
        {children}
      </View>
    </View>
  );
}
