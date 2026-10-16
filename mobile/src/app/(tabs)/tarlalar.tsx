import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { TabTitle } from '@/components/app/headers';
import { Screen } from '@/components/app/screen';
import { SolarIcon } from '@/components/icons/solar-icon';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { cropById } from '@/domain/crops';
import { DIAGNOSES } from '@/domain/diagnosis';
import { shortDate } from '@/domain/format';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';

export default function Fields() {
  const fields = useAppStore((s) => s.fields);
  const scans = useAppStore((s) => s.scans);
  const total = fields.reduce((n, f) => n + f.areaDonum, 0);

  return (
    <Screen tabs>
      <TabTitle title="Tarlalarım" subtitle={`${fields.length} tarla · ${total} dönüm`} />
      <View className="gap-4 px-4">
        {fields.map((f) => {
          const last = scans.find((s) => s.fieldId === f.id);
          const tone = f.health >= 0.8 ? 'olive' : f.health >= 0.6 ? 'amber' : 'brick';
          return (
            <Pressable
              key={f.id}
              accessibilityRole="button"
              accessibilityLabel={`${f.name}, ${cropById(f.crop).name}, ${f.areaDonum} dönüm, sağlık yüzde ${Math.round(f.health * 100)}`}
              onPress={() => router.push({ pathname: '/tarla/[id]', params: { id: f.id } })}
              className="overflow-hidden rounded-[28px] bg-card active:opacity-90">
              <Image source={f.image} style={{ width: '100%', height: 150 }} contentFit="cover" />
              <View className="gap-3 p-5">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="font-heading text-2xl tracking-tight">{f.name}</Text>
                    <Text className="text-lg text-muted-foreground">
                      {cropById(f.crop).name} · {f.areaDonum} dönüm
                    </Text>
                  </View>
                  <SolarIcon name="alt-arrow-right-linear" size={28} />
                </View>
                <View className="flex-row items-center gap-3">
                  <Progress value={f.health * 100} className="h-3 flex-1 bg-secondary" indicatorClassName={cn(tone === 'olive' ? 'bg-olive' : tone === 'amber' ? 'bg-amber' : 'bg-brick')} />
                  <Text className="font-sans-bold text-lg">Sağlık %{Math.round(f.health * 100)}</Text>
                </View>
                {last ? (
                  <Text className="text-base text-muted-foreground">
                    Son tarama {shortDate(new Date(last.date))}: {DIAGNOSES[last.diagnosisId].name}
                  </Text>
                ) : (
                  <Text className="text-base text-muted-foreground">Henüz taranmadı</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
