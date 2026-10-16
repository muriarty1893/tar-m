import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/** One cell of a compact stat strip: a muted label over a bold value. */
export function Stat({ label, value, detail, dot, className }: { label: string; value: string; detail?: string; dot?: 'amber' | 'olive' | 'brick'; className?: string }) {
  return (
    <View className={cn('flex-1 rounded-2xl bg-secondary p-4', className)}>
      <Text className="text-base text-muted-foreground">{label}</Text>
      <View className="mt-1 flex-row items-center gap-2">
        {dot ? <View className={cn('size-3 rounded-full', dot === 'amber' ? 'bg-amber' : dot === 'olive' ? 'bg-olive' : 'bg-brick')} /> : null}
        <Text className="font-sans-bold text-lg">{value}</Text>
      </View>
      {detail ? <Text className="text-base text-muted-foreground">{detail}</Text> : null}
    </View>
  );
}

export function StatRow({ children }: { children: ReactNode }) {
  return <View className="flex-row gap-3">{children}</View>;
}

/** A soft card on the cream background, the design's main grouping surface. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <View className={cn('mx-4 rounded-[28px] bg-card p-6', className)}>{children}</View>;
}
