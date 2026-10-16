import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { BackHeader } from '@/components/app/headers';
import { scanPhotoSource } from '@/components/app/photo';
import { Screen } from '@/components/app/screen';
import { SolarIcon } from '@/components/icons/solar-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cropById } from '@/domain/crops';
import { DIAGNOSES } from '@/domain/diagnosis';
import { shortDate } from '@/domain/format';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';

export default function History() {
  const scans = useAppStore((s) => s.scans);
  const fields = useAppStore((s) => s.fields);

  return (
    <Screen>
      <BackHeader title="Tarama geçmişi" subtitle={`${scans.length} tarama`} />
      <View className="gap-3 px-4">
        {scans.length ? (
          scans.map((s) => {
            const d = DIAGNOSES[s.diagnosisId];
            const field = fields.find((f) => f.id === s.fieldId);
            return (
              <Pressable key={s.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/teshis/[id]', params: { id: s.id } })} className="flex-row items-center gap-4 rounded-[28px] bg-card p-4 active:opacity-80">
                <Image source={scanPhotoSource(s.photo)} style={{ width: 72, height: 72, borderRadius: 20 }} contentFit="cover" />
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <View className={cn('size-3 rounded-full', d.severity === 'yok' ? 'bg-olive' : d.severity === 'ciddi' ? 'bg-brick' : 'bg-amber')} />
                    <Text className="font-sans-bold text-lg">{d.name}</Text>
                  </View>
                  <Text className="text-base text-muted-foreground">
                    {cropById(s.crop).name}
                    {field ? ` · ${field.name}` : ''}
                  </Text>
                  <Text className="text-base text-muted-foreground">
                    {shortDate(new Date(s.date))} · %{Math.round(s.confidence * 100)} güven
                  </Text>
                </View>
                <SolarIcon name="alt-arrow-right-linear" size={24} color="mutedForeground" />
              </Pressable>
            );
          })
        ) : (
          <View className="gap-4 rounded-[28px] bg-card p-6">
            <Text className="text-lg">Henüz tarama yok.</Text>
            <Button variant="accent" onPress={() => router.push('/tara')}>
              <Text>İlk taramayı yap</Text>
            </Button>
          </View>
        )}
      </View>
    </Screen>
  );
}
