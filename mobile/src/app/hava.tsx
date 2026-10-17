import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { SectionTitle, TabScreen } from '@/components/app/screen';
import { WeatherHero } from '@/components/app/weather-hero';
import { ArrowLeftIcon, CloudRainIcon, CloudSunIcon, SnowflakeIcon, SunIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { forecast, type ForecastDay } from '@/domain/farm-calendar';
import { useNow } from '@/hooks/use-now';
import { COLORS, SHADOW } from '@/theme/tokens';

const ICONS = { sun: SunIcon, 'cloud-sun': CloudSunIcon, 'cloud-rain': CloudRainIcon, snowflake: SnowflakeIcon };
const iconColor = (d: ForecastDay) => (d.rain > 60 ? COLORS.sky600 : d.min < 0 ? COLORS.sky500 : COLORS.gold);

/** "Hava durumu": the demo's weather card and 5-day farm forecast, opened from the home weather card. */
export default function Weather() {
  const now = useNow();
  return (
    <TabScreen>
      <View className="mb-3 flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Geri"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          className="size-11 items-center justify-center rounded-full bg-card active:bg-secondary"
          style={{ boxShadow: SHADOW.soft }}>
          <ArrowLeftIcon size={21} weight="bold" color={COLORS.foreground} />
        </Pressable>
        <Text role="heading" className="font-heading text-[24px]">
          Hava durumu
        </Text>
      </View>
      <WeatherHero />
      <SectionTitle className="mb-2 mt-5">5 günlük tarım tahmini</SectionTitle>
      <View className="gap-2">
        {forecast(now).map((d) => {
          const Icon = ICONS[d.icon];
          return (
            <View key={d.day} className="flex-row items-center gap-3 rounded-[18px] border border-border bg-card px-3 py-3" accessible accessibilityLabel={`${d.day}: en yüksek ${d.max}, en düşük ${d.min} derece, yağış yüzde ${d.rain}. ${d.tip}`}>
              <Icon size={30} weight="duotone" color={iconColor(d)} />
              <View className="min-w-0 flex-1">
                <Text className="font-sans-bold text-[15px]">{d.day}</Text>
                <Text numberOfLines={1} className="text-[13px] text-muted-foreground">
                  {d.tip}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-heading text-[16px]">
                  {d.max}° / {d.min}°
                </Text>
                <Text className="text-[13px] text-muted-foreground">Yağış %{d.rain}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </TabScreen>
  );
}
