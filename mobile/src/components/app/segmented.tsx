import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

type Option<T extends string> = { id: T; label: string; badge?: number };

/** A pill switch between two or three views ("İlanlar | Mesajlar", "Tümü | Alıyorum | Satıyorum"), with an optional count. */
export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Option<T>[]; onChange: (v: T) => void }) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v as T)} className="rounded-full bg-muted p-1" accessibilityLabel={label}>
      {options.map((o, i) => {
        const on = value === o.id;
        return (
          <ToggleGroupItem
            key={o.id}
            value={o.id}
            isFirst={i === 0}
            isLast={i === options.length - 1}
            accessibilityLabel={o.badge ? `${o.label}, ${o.badge} okunmamış` : o.label}
            className={cn('h-10 flex-1 flex-row gap-1.5 rounded-full', on ? 'bg-primary' : 'bg-transparent')}>
            <Text className={cn('font-sans-semibold text-[14px]', on ? 'text-primary-foreground' : 'text-muted-foreground')}>{o.label}</Text>
            {o.badge ? (
              <View className={cn('min-w-5 items-center rounded-full px-1.5', on ? 'bg-white' : 'bg-destructive')}>
                <Text className={cn('font-sans-bold text-[11px] leading-4', on ? 'text-primary' : 'text-white')}>{o.badge}</Text>
              </View>
            ) : null}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
