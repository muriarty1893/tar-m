import { View } from 'react-native';

import { CalendarBlankIcon, CloudRainIcon, SnowflakeIcon, SprayBottleIcon, type PhosphorIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { weekOutlook, type OutlookRow } from '@/domain/weather';
import { useNow } from '@/hooks/use-now';
import { useWeather } from '@/hooks/use-weather';
import { COLORS, TILE_TONES } from '@/theme/tokens';

const ROW_STYLE: Record<OutlookRow['kind'], { Icon: PhosphorIcon; tone: (typeof TILE_TONES)[keyof typeof TILE_TONES] }> = {
  spray: { Icon: SprayBottleIcon, tone: TILE_TONES.emerald },
  frost: { Icon: SnowflakeIcon, tone: TILE_TONES.sky },
  rain: { Icon: CloudRainIcon, tone: TILE_TONES.indigo },
};

/** "Bu Hafta Tarlada": from the 7-day forecast, the days that suit spraying and any frost or heavy rain. */
export function WeekOutlook() {
  const now = useNow();
  const { forecast, status } = useWeather();
  const rows = forecast ? weekOutlook(forecast.data.daily, now) : null;
  if (!rows && status === 'error') return null;
  return (
    <View className="rounded-[28px] border border-border bg-card p-4">
      <View className="mb-3 flex-row items-center gap-2.5">
        <CalendarBlankIcon size={24} weight="bold" color={COLORS.primary} />
        <Text role="heading" className="font-heading text-[19px]">
          Bu Hafta Tarlada
        </Text>
      </View>
      <View className="gap-2.5">
        {rows
          ? rows.map((r) => {
              const { Icon, tone } = ROW_STYLE[r.kind];
              const quiet = r.days.length === 0;
              return (
                <View key={r.kind} accessible accessibilityLabel={`${r.title}: ${r.text}`} className="flex-row items-center gap-3 rounded-[20px] border px-3 py-3" style={{ backgroundColor: tone.bg, borderColor: tone.line }}>
                  <View className="size-12 items-center justify-center rounded-2xl bg-white/80">
                    <Icon size={24} weight={quiet ? 'regular' : 'duotone'} color={tone.ink} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="font-sans-bold text-[15.5px]">{r.title}</Text>
                    <Text className="text-[13.5px] leading-[19px] text-muted-foreground">{r.text}</Text>
                  </View>
                </View>
              );
            })
          : [0, 1, 2].map((i) => <Skeleton key={i} className="h-[74px] rounded-[20px] bg-muted" />)}
      </View>
    </View>
  );
}
