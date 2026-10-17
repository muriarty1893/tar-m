import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';

import { CaretRightIcon, CloudRainIcon, DropIcon, MapPinIcon, SunIcon, UserIcon, WindIcon } from '@/components/icons';
import { InboxButton } from '@/components/market/parts';
import { Text } from '@/components/ui/text';
import { COLORS, SHADOW } from '@/theme/tokens';

/**
 * The demo's weather card: a field photo with the farmer, the location, the temperature and a frosted strip.
 * On the home screen it also carries the messages button and opens the 5-day forecast.
 */
export function WeatherHero({ onForecast, inbox = false }: { onForecast?: () => void; inbox?: boolean }) {
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
              3 tarla (42 dönüm) · Durum iyi
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5">
            <MapPinIcon size={14} weight="fill" color={COLORS.primary} />
            <Text className="font-sans-semibold text-[12.5px] text-primary">Konya</Text>
          </View>
          {inbox ? <InboxButton onPhoto /> : null}
        </View>
      </View>

      <View className="px-4 pt-1">
        <View className="flex-row items-center gap-2.5">
          <Text className="font-heading text-[46px] leading-[50px] tracking-tight text-white">18,5°C</Text>
          <View className="flex-row items-center gap-1">
            <SunIcon size={24} weight="fill" color={COLORS.sun} />
            <Text className="font-sans-semibold text-[15px] text-white">Güneşli</Text>
          </View>
        </View>
        <View className="mt-1 flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-[14px] text-white/95">Tarım havası ve iklim durumu</Text>
          {onForecast ? (
            <Pressable accessibilityRole="button" accessibilityLabel="5 günlük tahmini aç" onPress={onForecast} hitSlop={6} className="min-h-9 flex-row items-center gap-0.5 rounded-full border border-white/50 bg-white/20 pl-3 pr-2 active:bg-white/35">
              <Text className="font-sans-semibold text-[13px] text-white">5 günlük tahmin</Text>
              <CaretRightIcon size={14} weight="bold" color={COLORS.white} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View className="absolute inset-x-0 bottom-0 h-[44px] flex-row items-center justify-between gap-1 px-3.5">
        <Stat Icon={DropIcon} color={COLORS.sky300} label="Nem: %42" />
        <Stat Icon={CloudRainIcon} color={COLORS.sky200} label="Yağış: %5" />
        <Stat Icon={WindIcon} color={COLORS.white} label="Rüzgâr: 8 km/s" bold />
      </View>
    </View>
  );
}

function Stat({ Icon, color, label, bold }: { Icon: typeof SunIcon; color: string; label: string; bold?: boolean }) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon size={16} weight={bold ? 'bold' : 'fill'} color={color} />
      <Text className="font-sans-medium text-[12.5px] text-white">{label}</Text>
    </View>
  );
}
