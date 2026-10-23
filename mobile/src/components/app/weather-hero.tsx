import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { CaretDownIcon, CaretRightIcon, CloudRainIcon, MapPinIcon, PlantIcon, SnowflakeIcon, SprayBottleIcon, WifiSlashIcon, type PhosphorIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { clock } from '@/domain/format';
import { describeWeather, farmingHint, tempLabel, weatherIcon, type FarmingHint } from '@/domain/weather';
import { useWeather } from '@/hooks/use-weather';
import { COLORS, FIELD_CARD_GRADIENT, SHADOW } from '@/theme/tokens';

import { WeatherIcon } from './weather-icon';

export const HINT_ICONS: Record<FarmingHint['kind'], PhosphorIcon> = { spray: SprayBottleIcon, frost: SnowflakeIcon, rain: CloudRainIcon, normal: PlantIcon };

/**
 * "Tarla Konumu": live weather (Open-Meteo) for the chosen province on a dark green card: the place
 * (tap to change) with a live/offline badge, the temperature, rain, wind and sunrise tiles, and
 * today's farming hint on a white card. With `onForecast`, the hint opens the 7-day forecast.
 */
export function WeatherHero({ onForecast }: { onForecast?: () => void }) {
  const { province, forecast, status, retry } = useWeather();
  const now = forecast?.data.current;
  const today = forecast?.data.daily[0];
  const kind = now ? weatherIcon(now.code, now.isDay) : 'sun';
  const offline = !!forecast && status === 'error';
  const hint = today ? farmingHint(today) : null;
  const HintIcon = hint ? HINT_ICONS[hint.kind] : PlantIcon;

  const hintCard = (
    <View className="flex-row items-center gap-3 overflow-hidden rounded-[20px] border-l-4 border-emerald-400 bg-card py-3 pl-3 pr-3.5">
      <View className="size-12 items-center justify-center rounded-2xl bg-secondary">
        <HintIcon size={24} weight="duotone" color={COLORS.primary} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="font-sans-bold text-[12px] uppercase tracking-[1px] text-primary">Bugün tarlada</Text>
        <Text numberOfLines={2} className="font-sans-bold text-[15.5px] leading-5">
          {hint ? `${hint.text}.` : status === 'error' ? 'Bağlantınızı kontrol edin.' : 'Tahmin yükleniyor…'}
        </Text>
      </View>
      {onForecast ? <CaretRightIcon size={18} weight="bold" color={COLORS.mutedForeground} /> : null}
    </View>
  );

  return (
    <View className="rounded-[28px]" style={{ boxShadow: SHADOW.lift }}>
      <LinearGradient colors={FIELD_CARD_GRADIENT} locations={[0, 0.35, 0.75, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 28, padding: 16 }}>
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Tarla konumu: ${province.name}. Değiştir`}
            onPress={() => router.push('/konum')}
            className="min-w-0 flex-1 flex-row items-center gap-3 rounded-2xl active:opacity-75">
            <View className="size-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <MapPinIcon size={22} weight="duotone" color={COLORS.emerald300} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-sans-bold text-[12px] uppercase tracking-[1px] text-emerald-300">Tarla konumu</Text>
              <View className="flex-row items-center gap-1">
                <Text numberOfLines={1} className="shrink font-heading text-[21px] leading-7 text-white">
                  {province.name}
                </Text>
                <CaretDownIcon size={15} weight="bold" color={COLORS.white} />
              </View>
            </View>
          </Pressable>
          <LiveBadge offline={offline} at={forecast?.at} loading={!forecast && status !== 'error'} />
        </View>

        <View className="my-3.5 h-px bg-white/15" />

        <View accessibilityLiveRegion="polite">
          {now ? (
            <View accessible accessibilityLabel={`${province.name}: ${tempLabel(now.temp)}C, ${describeWeather(now.code)}, nem yüzde ${Math.round(now.humidity)}`} className="flex-row items-center gap-3">
              <Text className="font-heading text-[44px] leading-[50px] tracking-tight text-white">{tempLabel(now.temp)}C</Text>
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-1.5">
                  <WeatherIcon kind={kind} size={22} weight="fill" color={kind === 'sun' ? COLORS.sun : COLORS.white} />
                  <Text numberOfLines={1} className="flex-1 font-sans-bold text-[15px] text-white">
                    {describeWeather(now.code)}
                  </Text>
                </View>
                <Text className="text-[13px] text-white/80">Nem %{Math.round(now.humidity)}</Text>
              </View>
            </View>
          ) : status === 'error' ? (
            <View className="h-[50px] flex-row items-center gap-3" accessibilityRole="alert">
              <Text numberOfLines={2} className="flex-1 font-heading text-[18px] leading-6 text-white">
                Hava durumu alınamadı
              </Text>
              <Pressable accessibilityRole="button" onPress={() => void retry()} className="min-h-11 justify-center rounded-full bg-white px-4 active:bg-white/80">
                <Text className="font-sans-bold text-[14px] text-primary">Tekrar dene</Text>
              </Pressable>
            </View>
          ) : (
            <View className="h-[50px] flex-row items-center gap-3" accessibilityLabel="Hava durumu yükleniyor">
              <Skeleton className="h-10 w-32 rounded-xl bg-white/20" />
              <Skeleton className="h-5 w-24 rounded-lg bg-white/15" />
            </View>
          )}
        </View>

        <View className="mt-3.5 flex-row gap-2.5">
          <Stat label="Yağış" value={today ? `%${Math.round(today.rainProb)}` : '–'} />
          <Stat label="Rüzgâr" value={now ? `${Math.round(now.wind)} km/s` : '–'} />
          <Stat label="Gün doğumu" value={today?.sunrise ?? '–'} />
        </View>

        <View className="mt-3.5">
          {onForecast ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Bugün tarlada: ${hint?.text ?? 'tahmin yok'}. 7 günlük tahmini aç`} onPress={onForecast} className="active:opacity-90">
              {hintCard}
            </Pressable>
          ) : (
            hintCard
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

/** "Canlı Hava" with a green dot; "Çevrimdışı · 13:13" on old data; "Yükleniyor" before the first forecast. */
function LiveBadge({ offline, at, loading }: { offline: boolean; at?: string; loading: boolean }) {
  if (offline && at)
    return (
      <View className="h-9 flex-row items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-400/15 px-3">
        <WifiSlashIcon size={14} weight="bold" color="#fcd34d" />
        <Text className="font-sans-bold text-[12.5px] text-amber-200">Çevrimdışı · {clock(new Date(at))}</Text>
      </View>
    );
  return (
    <View className="h-9 flex-row items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-500/20 px-3">
      <View className={loading ? 'size-2 rounded-full bg-white/50' : 'size-2 rounded-full bg-emerald-400'} />
      <Text className="font-sans-bold text-[12.5px] text-white">{loading ? 'Yükleniyor' : 'Canlı Hava'}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value === '–' ? 'bilinmiyor' : value}`} className="flex-1 items-center gap-0.5 rounded-[18px] border border-white/15 bg-white/10 px-1 py-3">
      <Text numberOfLines={1} className="text-[12.5px] text-white/80">
        {label}
      </Text>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} className="font-heading text-[20px] text-white">
        {value}
      </Text>
    </View>
  );
}
