import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';

import { CalendarDotsIcon, CameraIcon, CaretRightIcon, MapTrifoldIcon, TractorIcon, type PhosphorIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { FIELDS } from '@/domain/fields';
import { cn } from '@/lib/utils';
import { COLORS, SHADOW } from '@/theme/tokens';

type Action = { img: number; Icon: PhosphorIcon; title: string; sub: string; badge?: string; onPress: () => void };

/** The demo's "Hızlı İşlemler": four photo cards; scanning is ringed in gold with a "Dene" badge. */
export function QuickActions({ onScan, onFields, onMap, onCalendar }: { onScan: () => void; onFields: () => void; onMap: () => void; onCalendar: () => void }) {
  const actions: Action[] = [
    { img: require('@/assets/images/app/scan-leaf.webp'), Icon: CameraIcon, title: 'Hastalık Tara', sub: 'Kamerayla yaprak teşhisi', badge: 'Dene', onPress: onScan },
    { img: require('@/assets/images/app/tractor-field.webp'), Icon: TractorIcon, title: 'Tarlalarım', sub: `${FIELDS.length} tarla ve harcamalar`, onPress: onFields },
    { img: require('@/assets/images/app/field-map.webp'), Icon: MapTrifoldIcon, title: 'Tarla Haritası', sub: 'Uydu ile izleme', onPress: onMap },
    { img: require('@/assets/images/app/seedlings.webp'), Icon: CalendarDotsIcon, title: 'Tarım Takvimi', sub: 'Ekim ve ilaçlama', onPress: onCalendar },
  ];
  return (
    <View className="mt-5">
      <Text role="heading" className="font-heading text-[17px]">
        Hızlı İşlemler
      </Text>
      <View className="mt-2 flex-row flex-wrap justify-between gap-y-2.5">
        {actions.map((a, i) => (
          <Pressable
            key={a.title}
            accessibilityRole="button"
            accessibilityLabel={`${a.title}. ${a.sub}`}
            onPress={a.onPress}
            className={cn('h-[136px] w-[48.5%] overflow-hidden rounded-[20px] active:scale-[0.97]', i === 0 && 'border-[3px] border-gold')}
            style={{ boxShadow: SHADOW.soft }}>
            <Image source={a.img} style={{ position: 'absolute', inset: 0 }} contentFit="cover" />
            <LinearGradient colors={['rgba(0,0,0,0.72)', 'rgba(0,0,0,0.15)', 'transparent']} locations={[0, 0.55, 1]} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={{ position: 'absolute', inset: 0 }} />
            <View className="absolute left-2.5 top-2.5 size-10 items-center justify-center rounded-full bg-white/95" style={{ boxShadow: SHADOW.soft }}>
              <a.Icon size={21} weight="duotone" color={COLORS.primary} />
            </View>
            {a.badge ? (
              <View className="absolute right-2.5 top-2.5 rounded-full bg-gold px-2 py-0.5">
                <Text className="font-sans-bold text-[12px] text-gold-foreground">{a.badge}</Text>
              </View>
            ) : null}
            <View className="absolute inset-x-2.5 bottom-2.5 flex-row items-end justify-between gap-1">
              <View className="min-w-0 flex-1">
                <Text className="font-heading text-[16px] leading-tight text-white">{a.title}</Text>
                <Text numberOfLines={1} className="text-[12px] text-white/90">
                  {a.sub}
                </Text>
              </View>
              <CaretRightIcon size={16} weight="bold" color={COLORS.white} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
