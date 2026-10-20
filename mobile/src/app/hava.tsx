import * as WebBrowser from 'expo-web-browser';
import { Pressable, RefreshControl, View } from 'react-native';

import { BackHeader } from '@/components/app/back-header';
import { SectionTitle, TabScreen } from '@/components/app/screen';
import { WeatherHero } from '@/components/app/weather-hero';
import { WeatherIcon } from '@/components/app/weather-icon';
import { WindIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { clock } from '@/domain/format';
import { dayLabel, describeWeather, farmingHint, tempLabel, weatherIcon, type DailyForecast, type FarmingHint } from '@/domain/weather';
import { useNow } from '@/hooks/use-now';
import { useWeather } from '@/hooks/use-weather';
import { COLORS } from '@/theme/tokens';

// Each tone keeps 4.5:1 contrast on white; the words carry the meaning, the colour only helps.
const HINT_TONE: Record<FarmingHint['kind'], string> = {
  frost: COLORS.destructive,
  rain: '#0369a1',
  spray: COLORS.primary,
  normal: COLORS.mutedForeground,
};

/** "Hava durumu": live weather for the chosen province and a 7-day forecast with a farming hint for each day. */
export default function Weather() {
  const now = useNow();
  const { province, forecast, status, retry } = useWeather();
  return (
    <TabScreen refreshControl={<RefreshControl refreshing={status === 'loading' && !!forecast} onRefresh={() => void retry()} colors={[COLORS.primary]} tintColor={COLORS.primary} />}>
      <BackHeader title="Hava durumu" subtitle={`${province.name} · Open-Meteo`} />
      <WeatherHero />

      <SectionTitle className="mb-2 mt-5">7 günlük tarım tahmini</SectionTitle>
      {forecast ? (
        <View className="gap-2">
          {forecast.data.daily.map((d) => (
            <DayRow key={d.date} day={d} label={dayLabel(d.date, now)} />
          ))}
        </View>
      ) : status === 'error' ? (
        <View className="items-center gap-2 rounded-[22px] border border-dashed border-border px-6 py-7" accessibilityRole="alert">
          <Text className="font-heading text-[18px]">Tahmin alınamadı</Text>
          <Text className="text-center text-[14px] leading-5 text-muted-foreground">İnternet bağlantınızı kontrol edip yeniden deneyin.</Text>
          <Button size="sm" className="mt-2 rounded-full" onPress={() => void retry()}>
            <Text>Tekrar dene</Text>
          </Button>
        </View>
      ) : (
        <View className="gap-2" accessibilityLabel="Tahmin yükleniyor">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[68px] rounded-[18px] bg-muted" />
          ))}
        </View>
      )}

      <View className="mt-4 flex-row flex-wrap items-center justify-center gap-x-1">
        {forecast ? <Text className="text-[12.5px] text-muted-foreground">Güncellendi {clock(new Date(forecast.at))} ·</Text> : null}
        <Pressable accessibilityRole="link" accessibilityLabel="Hava verisi Open-Meteo’dan. Kaynağı tarayıcıda açar" onPress={() => void WebBrowser.openBrowserAsync('https://open-meteo.com').catch(() => undefined)} hitSlop={10} className="min-h-11 justify-center active:opacity-60">
          <Text className="text-[12.5px] text-muted-foreground underline">Hava verisi: Open-Meteo.com</Text>
        </Pressable>
      </View>
    </TabScreen>
  );
}

function DayRow({ day, label }: { day: DailyForecast; label: string }) {
  const hint = farmingHint(day);
  const code = day.code ?? 3;
  return (
    <View
      className="flex-row items-center gap-3 rounded-[18px] border border-border bg-card px-3 py-3"
      accessible
      accessibilityLabel={`${label}: ${describeWeather(code)}, en yüksek ${tempLabel(day.max, 0)}, en düşük ${tempLabel(day.min, 0)}, yağış ihtimali yüzde ${Math.round(day.rainProb)}, rüzgâr ${Math.round(day.windMax)} kilometre. ${hint.text}`}>
      <WeatherIcon kind={weatherIcon(code)} size={30} />
      <View className="min-w-0 flex-1">
        <Text className="font-sans-bold text-[15px]">{label}</Text>
        <Text numberOfLines={2} className="text-[13px] leading-[18px]" style={{ color: HINT_TONE[hint.kind] }}>
          {hint.text}
        </Text>
      </View>
      <View className="items-end">
        <Text className="font-heading text-[16px]">
          {tempLabel(day.max, 0)} / {tempLabel(day.min, 0)}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[12.5px] text-muted-foreground">Yağış %{Math.round(day.rainProb)}</Text>
          <WindIcon size={12} weight="bold" color={COLORS.mutedForeground} />
          <Text className="text-[12.5px] text-muted-foreground">{Math.round(day.windMax)}</Text>
        </View>
      </View>
    </View>
  );
}
