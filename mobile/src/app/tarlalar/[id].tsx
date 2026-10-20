import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HealthBadge, HEALTH_STYLE } from '@/components/fields/health-badge';
import {
  ArrowLeftIcon,
  CameraIcon,
  CaretRightIcon,
  DropIcon,
  FirstAidKitIcon,
  FlaskIcon,
  GrainsIcon,
  LeafIcon,
  PlantIcon,
  RulerIcon,
  ShovelIcon,
  SnowflakeIcon,
  TractorIcon,
  WalletIcon,
  type PhosphorIcon,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { TASK_KINDS, type TaskKind } from '@/domain/farm-calendar';
import { EXPENSE_KINDS, HEALTH, fieldById, healthOf, tonsLabel, totalExpenses, upcomingTasks } from '@/domain/fields';
import { relativeDayLabel } from '@/domain/format';
import { formatPrice } from '@/domain/market';
import { scenarioById } from '@/domain/scenarios';
import { useNow } from '@/hooks/use-now';
import { useAppStore } from '@/state/store';
import { COLORS, KIND_COLORS, SHADOW } from '@/theme/tokens';

const KIND_ICONS: Record<TaskKind, PhosphorIcon> = {
  analiz: FlaskIcon,
  toprak: ShovelIcon,
  gubre: PlantIcon,
  ilac: FirstAidKitIcon,
  ekim: GrainsIcon,
  sulama: DropIcon,
  hasat: TractorIcon,
  uyari: SnowflakeIcon,
};

/** One field: its health and last scan, this season's expenses, and what's next on the calendar. */
export default function FieldDetail() {
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { id } = useLocalSearchParams<{ id: string }>();
  const field = id ? fieldById(id) : undefined;
  const lastScan = useAppStore((s) => (field ? s.scans.find((x) => x.scenarioId === field.scenarioId) : undefined));
  const back = () => (router.canGoBack() ? router.back() : router.replace('/tarlalar'));

  if (!field) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text className="font-heading text-[20px]">Tarla bulunamadı</Text>
        <Button onPress={() => router.replace('/tarlalar')}>
          <Text>Tarlalarıma dön</Text>
        </Button>
      </View>
    );
  }

  const health = healthOf(field);
  const scenario = scenarioById(field.scenarioId);
  const total = totalExpenses(field);
  const tasks = upcomingTasks(field, now, 4);
  const tone = HEALTH_STYLE[health];

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        <View className="h-[260px] overflow-hidden bg-muted">
          <Image source={field.photo} style={{ position: 'absolute', inset: 0 }} contentFit="cover" accessibilityLabel={`${field.name} fotoğrafı`} />
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent']} locations={[0, 0.4]} style={{ position: 'absolute', inset: 0 }} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Geri"
            onPress={back}
            className="absolute left-4 size-12 items-center justify-center rounded-full bg-white/95 active:scale-95"
            style={{ top: insets.top + 8, boxShadow: SHADOW.soft }}>
            <ArrowLeftIcon size={21} weight="bold" color={COLORS.foreground} />
          </Pressable>
        </View>

        <View className="-mt-4 gap-4 rounded-t-[26px] bg-background px-4 pt-4">
          <View className="gap-1.5">
            <View className="flex-row flex-wrap items-center gap-2">
              <HealthBadge health={health} />
              <View className="rounded-full bg-muted px-2 py-0.5">
                <Text className="font-sans-semibold text-[12.5px] text-muted-foreground">{field.stage}</Text>
              </View>
            </View>
            <Text role="heading" className="font-heading text-[26px] leading-8">
              {field.name}
            </Text>
            <Text className="text-[14px] text-muted-foreground">
              {field.crop} · {field.place}
            </Text>
          </View>

          <View className="flex-row gap-2">
            <Fact Icon={RulerIcon} label="Alan" value={`${field.areaDonum} dönüm`} />
            <Fact Icon={GrainsIcon} label="Beklenen ürün" value={tonsLabel(field.expectedYieldKg)} />
            <Fact Icon={LeafIcon} label="Bitki sağlığı" value={field.ndvi.toFixed(2).replace('.', ',')} />
          </View>

          {scenario ? (
            <View className="gap-2 rounded-[20px] border p-3.5" style={{ borderColor: tone.color, backgroundColor: tone.soft }}>
              <View className="flex-row items-center gap-2">
                <tone.Icon size={20} weight="fill" color={tone.color} />
                <Text className="flex-1 font-sans-bold text-[15px]">{HEALTH[health].hint}</Text>
              </View>
              <Text className="text-[14px] leading-5">
                Son tarama: {scenario.diagnosis}. Hasat başarı tahmini %{scenario.successRate}.
              </Text>
              {lastScan ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={() => router.push({ pathname: '/sonuc/[id]', params: { id: lastScan.id } })}
                  hitSlop={8}
                  className="flex-row items-center self-start py-1 active:opacity-60">
                  <Text className="font-sans-semibold text-[14px] text-primary">Tarama sonucunu gör</Text>
                  <CaretRightIcon size={14} weight="bold" color={COLORS.primary} />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View className="gap-2.5 rounded-[20px] border border-border bg-card p-3.5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <WalletIcon size={20} weight="duotone" color={COLORS.primary} />
                <Text role="heading" className="font-heading text-[17px]">
                  Harcamalar
                </Text>
              </View>
              <Text className="font-heading text-[17px]">{formatPrice(total)}</Text>
            </View>
            {field.expenses.map((e) => {
              const share = Math.round((e.amount / total) * 100);
              return (
                <View key={e.kind} className="gap-1" accessible accessibilityLabel={`${EXPENSE_KINDS[e.kind]}: ${formatPrice(e.amount)}, harcamanın yüzde ${share}'i`}>
                  <View className="flex-row justify-between">
                    <Text className="text-[14px]">{EXPENSE_KINDS[e.kind]}</Text>
                    <Text className="font-sans-semibold text-[14px]">{formatPrice(e.amount)}</Text>
                  </View>
                  <Progress value={share} className="h-1.5" />
                </View>
              );
            })}
            <Text className="text-[12.5px] text-muted-foreground">Dönüm başına {formatPrice(Math.round(total / field.areaDonum))}</Text>
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text role="heading" className="font-heading text-[17px]">
                Yaklaşan görevler
              </Text>
              <Pressable accessibilityRole="link" accessibilityLabel="Tarım takvimini aç" onPress={() => router.navigate('/takvim')} hitSlop={12} className="flex-row items-center active:opacity-60">
                <Text className="font-sans-semibold text-[13px] text-primary">Takvim</Text>
                <CaretRightIcon size={14} weight="bold" color={COLORS.primary} />
              </Pressable>
            </View>
            {tasks.length ? (
              tasks.map(({ task, date }) => {
                const Icon = KIND_ICONS[task.kind];
                const k = KIND_COLORS[task.kind];
                return (
                  <View key={task.title} className="flex-row items-center gap-3 rounded-[18px] border border-border bg-card px-3 py-2.5">
                    <View className="size-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: k.tile }}>
                      <Icon size={22} weight="duotone" color={k.icon} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="font-sans-semibold text-[14.5px]">{task.title}</Text>
                      <Text className="text-[12.5px] text-muted-foreground">
                        {TASK_KINDS[task.kind].label} · {relativeDayLabel(date, now)} {task.time}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text className="rounded-[18px] border border-dashed border-border px-4 py-4 text-center text-[14px] text-muted-foreground">Bu tarla için yaklaşan görev yok.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 border-t border-border bg-card px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <Button className="rounded-full" onPress={() => router.push('/tara')}>
          <CameraIcon size={20} weight="bold" color={COLORS.white} />
          <Text>Bu tarlayı tara</Text>
        </Button>
      </View>
    </View>
  );
}

function Fact({ Icon, label, value }: { Icon: PhosphorIcon; label: string; value: string }) {
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-[16px] border border-border bg-card px-2.5 py-2.5" accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon size={18} weight="duotone" color={COLORS.primary} />
      <Text className="text-[12px] text-muted-foreground">{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit className="font-heading text-[16px]">
        {value}
      </Text>
    </View>
  );
}
