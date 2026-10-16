import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { SectionTitle } from '@/components/app/headers';
import { Screen } from '@/components/app/screen';
import { Panel, Stat, StatRow } from '@/components/app/stat';
import { TaskRow } from '@/components/app/task-row';
import { SolarIcon } from '@/components/icons/solar-icon';
import type { SolarName } from '@/components/icons/solar';
import { Text } from '@/components/ui/text';
import { cropById } from '@/domain/crops';
import { dayKey, formatTL, relativeDayLabel, timeRange } from '@/domain/format';
import { PRICES } from '@/domain/prices';
import { useWeather } from '@/hooks/use-weather';
import { useAppStore } from '@/state/store';

const greeting = (h: number) => (h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar');

/** A regional outbreak warning matched to what the farmer grows (sample data). */
function regionalAlert(crops: string[]) {
  if (crops.includes('bugday') || crops.includes('arpa')) return { title: 'Bölgende sarı pas yayılıyor', detail: '12 km içinde 8 bildirim · Buğday yapraklarını kontrol et' };
  if (crops.includes('domates')) return { title: 'Bölgende mildiyö riski yüksek', detail: 'Nemli günler · Domates yapraklarını kontrol et' };
  return null;
}

export default function Today() {
  const profile = useAppStore((s) => s.profile);
  const tasks = useAppStore((s) => s.tasks);
  const w = useWeather();
  const today = tasks.filter((t) => t.date === dayKey(w.now));
  const alert = regionalAlert(profile.crops);
  const myPrice = PRICES.find((p) => profile.crops.includes(p.crop)) ?? PRICES[0];

  return (
    <Screen tabs>
      <View className="flex-row items-center gap-3 px-5">
        <View className="flex-1">
          <Text role="heading" className="font-heading text-3xl tracking-tight">
            {greeting(w.now.getHours())}, {profile.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <SolarIcon name="map-point-linear" size={20} color="mutedForeground" />
            <Text className="text-lg text-muted-foreground">
              {profile.district ? `${profile.district}, ` : ''}
              {profile.province}
            </Text>
          </View>
        </View>
        <Image source={require('@/assets/brand/logo.webp')} style={{ width: 52, height: 52 }} contentFit="contain" accessibilityLabel="Çiftçi Destek" />
      </View>

      <Panel className="gap-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-heading-black text-[64px] leading-[68px] tracking-tighter">{w.current.tempC}°</Text>
            <Text className="text-xl text-muted-foreground">{w.condition.label}</Text>
          </View>
          <SolarIcon name={w.condition.icon} size={72} color="olive" />
        </View>
        <View className="flex-row items-center gap-3 rounded-2xl bg-background px-4 py-3">
          <SolarIcon name={w.verdict.ok ? 'check-circle-bold' : 'danger-triangle-linear'} size={28} color={w.verdict.ok ? 'olive' : 'amber'} />
          <View className="flex-1">
            <Text className="font-sans-bold text-lg leading-6">{w.verdict.reason}</Text>
            {!w.verdict.ok && w.window ? (
              <Text className="text-base text-muted-foreground">
                En uygun zaman: {relativeDayLabel(w.window.start, w.now)} {timeRange(w.window.start.getHours(), w.window.end.getHours())}
              </Text>
            ) : null}
          </View>
        </View>
        <StatRow>
          <Stat label="Rüzgâr" value={`${w.current.windKmh} km/s`} className="bg-secondary px-3" />
          <Stat label="Nem" value={`%${w.current.humidity}`} className="bg-secondary px-3" />
          <Stat label="Yağış" value={w.current.rainMm > 0 ? 'Var' : w.rainLater ? `${w.rainLater.time.getHours()}:00'da` : 'Yok'} className="bg-secondary px-3" />
        </StatRow>
      </Panel>

      {w.frost ? <Notice icon="snowflake-linear" title="Bu gece don riski var" detail="Fideleri ört, sabah erken sulama yapma." /> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Yaprağı tara. Hastalığı 10 saniyede öğren."
        onPress={() => router.push('/tara')}
        className="mx-4 flex-row items-center gap-4 rounded-[28px] bg-accent p-5 active:opacity-90">
        <View className="size-16 items-center justify-center rounded-full bg-accent-foreground/20">
          <SolarIcon name="scanner-linear" size={34} color="accentForeground" />
        </View>
        <View className="flex-1">
          <Text className="font-heading text-2xl text-accent-foreground">Yaprağı tara</Text>
          <Text className="text-lg text-accent-foreground">Hastalığı 10 saniyede öğren</Text>
        </View>
        <SolarIcon name="arrow-right-linear" size={28} color="accentForeground" />
      </Pressable>

      {alert ? <Notice icon="danger-triangle-linear" title={alert.title} detail={alert.detail} /> : null}

      <SectionTitle action={<Text className="text-lg text-muted-foreground">{today.filter((t) => !t.done).length} iş kaldı</Text>}>Bugünkü işler</SectionTitle>
      <View className="gap-3 px-4">
        {today.length ? (
          today.map((t) => <TaskRow key={t.id} task={t} />)
        ) : (
          <Text className="rounded-3xl bg-popover p-5 text-lg text-muted-foreground">Bugün için planlanmış iş yok. Takvimden yeni iş ekleyebilirsin.</Text>
        )}
      </View>

      <SectionTitle>Kısayollar</SectionTitle>
      <View className="flex-row gap-3 px-4">
        <Shortcut icon="chart-2-linear" title="Hal fiyatları" detail={`${cropById(myPrice.crop).name} ${formatTL(myPrice.price)}`} onPress={() => router.push('/hal-fiyatlari')} />
        <Shortcut icon="microphone-3-bold" title="Sesli asistan" detail="Sor, cevaplasın" onPress={() => router.push('/asistan')} />
      </View>
    </Screen>
  );
}

function Notice({ icon, title, detail }: { icon: SolarName; title: string; detail: string }) {
  return (
    <View className="mx-4 flex-row items-center gap-4 rounded-[28px] border-2 border-amber/50 bg-amber/15 p-5" accessibilityRole="alert">
      <SolarIcon name={icon} size={32} color="amber" />
      <View className="flex-1">
        <Text className="font-sans-bold text-lg leading-6">{title}</Text>
        <Text className="text-base text-muted-foreground">{detail}</Text>
      </View>
    </View>
  );
}

function Shortcut({ icon, title, detail, onPress }: { icon: SolarName; title: string; detail: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="flex-1 gap-3 rounded-[28px] bg-card p-5 active:opacity-80">
      <View className="size-12 items-center justify-center rounded-full bg-background">
        <SolarIcon name={icon} size={26} color="foreground" />
      </View>
      <View>
        <Text className="font-sans-bold text-lg leading-6">{title}</Text>
        <Text className="text-base text-muted-foreground">{detail}</Text>
      </View>
    </Pressable>
  );
}
