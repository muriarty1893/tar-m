import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionTitle, goBack } from '@/components/app/headers';
import { HealthRing } from '@/components/app/health-ring';
import { scanPhotoSource } from '@/components/app/photo';
import { RoundButton } from '@/components/app/round-button';
import { Screen } from '@/components/app/screen';
import { Panel, Stat } from '@/components/app/stat';
import { TaskRow } from '@/components/app/task-row';
import { SolarIcon } from '@/components/icons/solar-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cropById } from '@/domain/crops';
import { DIAGNOSES } from '@/domain/diagnosis';
import { addDays, dayKey, shortDate } from '@/domain/format';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';
import { COLORS } from '@/theme/tokens';

export default function FieldDetail() {
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { id } = useLocalSearchParams<{ id: string }>();
  const field = useAppStore((s) => s.fields.find((f) => f.id === id));
  const allScans = useAppStore((s) => s.scans);
  const allTasks = useAppStore((s) => s.tasks);
  if (!field) return null;

  const scans = allScans.filter((s) => s.fieldId === field.id);
  const upcoming = allTasks.filter((t) => t.fieldId === field.id && !t.done && t.date >= dayKey(now)).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Screen
      edgeToEdgeTop
      footer={
        <Button size="lg" variant="accent" onPress={() => router.push({ pathname: '/tara', params: { field: field.id } })}>
          <SolarIcon name="scanner-linear" color="accentForeground" />
          <Text>Bu tarlayı tara</Text>
        </Button>
      }>
      <View className="h-64 w-full">
        <Image source={field.image} style={{ position: 'absolute', inset: 0 }} contentFit="cover" />
        <LinearGradient colors={['transparent', COLORS.background]} locations={[0.45, 1]} style={{ position: 'absolute', inset: 0 }} />
        <View className="absolute left-6" style={{ top: insets.top + 8 }}>
          <RoundButton icon="alt-arrow-left-linear" label="Geri" onPress={goBack} />
        </View>
      </View>

      <View className="-mt-10 flex-row items-end justify-between px-5">
        <View className="flex-1">
          <Text role="heading" className="font-heading text-4xl tracking-tight">
            {field.name}
          </Text>
          <Text className="text-xl text-muted-foreground">
            {cropById(field.crop).name} · {field.areaDonum} dönüm
          </Text>
        </View>
        <HealthRing value={field.health} />
      </View>

      <View className="flex-row gap-3 px-4">
        <Stat label="Ekim" value={shortDate(addDays(now, -field.sownDaysAgo))} />
        <Stat label="Son tarama" value={scans[0] ? shortDate(new Date(scans[0].date)) : '—'} />
        <Stat label="Hasada" value={`${field.harvestInDays} gün`} />
      </View>

      <SectionTitle>Tarama geçmişi</SectionTitle>
      <Panel className="gap-0 py-3">
        {scans.length ? (
          scans.map((s, i) => {
            const d = DIAGNOSES[s.diagnosisId];
            const tone = d.severity === 'yok' ? 'bg-olive' : d.severity === 'ciddi' ? 'bg-brick' : 'bg-amber';
            return (
              <Pressable key={s.id} onPress={() => router.push({ pathname: '/teshis/[id]', params: { id: s.id } })} accessibilityRole="button" className="flex-row items-center gap-4 py-3 active:opacity-70">
                <View className="items-center self-stretch">
                  <View className={cn('mt-6 size-3.5 rounded-full', tone)} />
                  {i < scans.length - 1 ? <View className="-mb-3 mt-1 w-0.5 flex-1 bg-border" /> : null}
                </View>
                <Image source={scanPhotoSource(s.photo)} style={{ width: 56, height: 56, borderRadius: 16 }} contentFit="cover" />
                <View className="flex-1">
                  <Text className="font-sans-bold text-lg">{d.name}</Text>
                  <Text className="text-base text-muted-foreground">
                    {shortDate(new Date(s.date))} · %{Math.round(s.confidence * 100)} güven
                  </Text>
                </View>
                <SolarIcon name="alt-arrow-right-linear" size={24} color="mutedForeground" />
              </Pressable>
            );
          })
        ) : (
          <Text className="py-3 text-lg text-muted-foreground">Bu tarla henüz taranmadı.</Text>
        )}
      </Panel>

      <SectionTitle>Yaklaşan işler</SectionTitle>
      <View className="gap-3 px-4">
        {upcoming.length ? upcoming.map((t) => <TaskRow key={t.id} task={t} />) : <Text className="px-1 text-lg text-muted-foreground">Yaklaşan iş yok.</Text>}
      </View>
    </Screen>
  );
}
