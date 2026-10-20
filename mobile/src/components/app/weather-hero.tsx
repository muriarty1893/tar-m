import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { CaretRightIcon, CloudRainIcon, DropIcon, MapPinIcon, UserIcon, WifiSlashIcon, WindIcon } from '@/components/icons';
import { InboxButton } from '@/components/market/parts';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { FIELDS, healthOf, seasonSummary } from '@/domain/fields';
import { clock } from '@/domain/format';
import { describeWeather, farmingHint, tempLabel, weatherIcon } from '@/domain/weather';
import { useWeather } from '@/hooks/use-weather';
import { COLORS, SHADOW } from '@/theme/tokens';

import { WeatherIcon } from './weather-icon';

const RISKY = FIELDS.filter((f) => healthOf(f) === 'riskli').length;
/** "4 tarla (103 dönüm) · 1 tarla riskli", from Tarlalarım's fields. */
const FIELD_LINE = `${FIELDS.length} tarla (${seasonSummary(FIELDS).areaDonum} dönüm) · ${RISKY ? `${RISKY} tarla riskli` : 'Durum iyi'}`;

/**
 * The demo's weather card, with live weather (Open-Meteo) for the chosen province: a field photo with the
 * farmer, the place (tap to change), the temperature, today's farming hint and a frosted strip.
 * On the home screen it also carries the messages button and opens the 7-day forecast.
 */
export function WeatherHero({ onForecast, inbox = false }: { onForecast?: () => void; inbox?: boolean }) {
  const { province, forecast, status, retry } = useWeather();
  const now = forecast?.data.current;
  const today = forecast?.data.daily[0];
  const kind = now ? weatherIcon(now.code, now.isDay) : 'sun';

  return (
    <View className="h-[248px] rounded-[26px]" style={{ boxShadow: SHADOW.lift }}>
      <View className="absolute inset-0 overflow-hidden rounded-[26px]">
        <Image source={require('@/assets/images/app/hero-field.webp')} style={{ position: 'absolute', inset: 0 }} contentFit="cover" />
        <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.65)']} locations={[0, 0.42, 1]} style={{ position: 'absolute', inset: 0 }} />
        <BlurView intensity={20} tint="dark" className="absolute inset-x-0 bottom-0 h-[44px]" />
      </View>

      <View className="flex-row items-start justify-between gap-2 p-3.5">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <View className="size-10 items-center justify-center rounded-full border border-white/40 bg-white/25">
            <UserIcon size={20} weight="bold" color={COLORS.white} />
          </View>
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="font-heading text-[17px] leading-tight text-white">
              Ayşe Yılmaz
            </Text>
            <Text numberOfLines={1} className="text-[12.5px] text-white/90">
              {FIELD_LINE}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Hava durumu konumu: ${province.name}. Değiştir`}
            onPress={() => router.push('/konum')}
            hitSlop={6}
            className="min-h-9 flex-row items-center gap-1 rounded-full bg-white/95 px-2.5 active:bg-white/80">
            <MapPinIcon size={14} weight="fill" color={COLORS.primary} />
            <Text numberOfLines={1} className="max-w-[110px] font-sans-semibold text-[12.5px] text-primary">
              {province.name}
            </Text>
          </Pressable>
          {inbox ? <InboxButton onPhoto /> : null}
        </View>
      </View>

      <View className="px-4 pt-1" accessibilityLiveRegion="polite">
        {now && today ? (
          <View accessible accessibilityLabel={`${province.name}: ${tempLabel(now.temp)}C, ${describeWeather(now.code)}`} className="flex-row items-center gap-2.5">
            <Text className="font-heading text-[46px] leading-[50px] tracking-tight text-white">{tempLabel(now.temp)}C</Text>
            <View className="min-w-0 flex-1 flex-row items-center gap-1">
              <WeatherIcon kind={kind} size={24} weight="fill" color={kind === 'sun' ? COLORS.sun : COLORS.white} />
              <Text numberOfLines={1} className="flex-1 font-sans-semibold text-[15px] text-white">
                {describeWeather(now.code)}
              </Text>
            </View>
          </View>
        ) : status === 'error' ? (
          <View className="h-[50px] flex-row items-center gap-3" accessibilityRole="alert">
            <Text numberOfLines={2} className="flex-1 font-heading text-[19px] leading-6 text-white">
              Hava durumu alınamadı
            </Text>
            <Pressable accessibilityRole="button" onPress={() => void retry()} className="min-h-11 justify-center rounded-full bg-white/95 px-4 active:bg-white/80">
              <Text className="font-sans-bold text-[14px] text-primary">Tekrar dene</Text>
            </Pressable>
          </View>
        ) : (
          <View className="h-[50px] flex-row items-center gap-3" accessibilityLabel="Hava durumu yükleniyor">
            <Skeleton className="h-10 w-36 rounded-xl bg-white/35" />
            <Skeleton className="h-5 w-24 rounded-lg bg-white/30" />
          </View>
        )}
        <View className="mt-1 flex-row items-center justify-between gap-2">
          {forecast && status === 'error' ? (
            <View className="flex-1 flex-row items-center gap-1.5">
              <WifiSlashIcon size={15} weight="bold" color={COLORS.white} />
              <Text numberOfLines={1} className="flex-1 text-[13.5px] text-white/95">
                Çevrimdışı · {clock(new Date(forecast.at))} verisi
              </Text>
            </View>
          ) : (
            <Text numberOfLines={1} className="flex-1 text-[14px] text-white/95">
              {today ? farmingHint(today).text : status === 'error' ? 'Bağlantınızı kontrol edin' : 'Tarım havası ve iklim durumu'}
            </Text>
          )}
          {onForecast ? (
            <Pressable accessibilityRole="button" accessibilityLabel="7 günlük tahmini aç" onPress={onForecast} hitSlop={6} className="min-h-9 flex-row items-center gap-0.5 rounded-full border border-white/50 bg-white/20 pl-3 pr-2 active:bg-white/35">
              <Text className="font-sans-semibold text-[13px] text-white">7 günlük tahmin</Text>
              <CaretRightIcon size={14} weight="bold" color={COLORS.white} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View className="absolute inset-x-0 bottom-0 h-[44px] flex-row items-center justify-between gap-1 px-3.5">
        <Stat Icon={DropIcon} color={COLORS.sky300} label={`Nem: ${now ? `%${Math.round(now.humidity)}` : '–'}`} />
        <Stat Icon={CloudRainIcon} color={COLORS.sky200} label={`Yağış: ${today ? `%${Math.round(today.rainProb)}` : '–'}`} />
        <Stat Icon={WindIcon} color={COLORS.white} label={`Rüzgâr: ${now ? `${Math.round(now.wind)} km/s` : '–'}`} bold />
      </View>
    </View>
  );
}

function Stat({ Icon, color, label, bold }: { Icon: typeof DropIcon; color: string; label: string; bold?: boolean }) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon size={16} weight={bold ? 'bold' : 'fill'} color={color} />
      <Text className="font-sans-medium text-[12.5px] text-white">{label}</Text>
    </View>
  );
}
