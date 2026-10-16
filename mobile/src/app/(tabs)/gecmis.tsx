import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ScreenTitle, TabScreen } from '@/components/app/screen';
import { Text } from '@/components/ui/text';
import { scenarioById, successTone } from '@/domain/scenarios';
import { whenLabel } from '@/domain/when';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';

/** "Geçmiş taramalar", as in the website demo; each opens its result again. */
export default function History() {
  const now = useNow();
  const scans = useAppStore((s) => s.scans);
  return (
    <TabScreen>
      <ScreenTitle>Geçmiş taramalar</ScreenTitle>
      <View className="gap-2.5">
        {scans.map((scan) => {
          const s = scenarioById(scan.scenarioId);
          if (!s) return null;
          const tone = successTone(s.successRate);
          return (
            <Pressable
              key={scan.id}
              accessibilityRole="button"
              accessibilityLabel={`${s.title}: ${s.diagnosis}. ${whenLabel(new Date(scan.date), now)}. Başarı tahmini yüzde ${s.successRate}`}
              onPress={() => router.push({ pathname: '/sonuc/[id]', params: { id: scan.id } })}
              className="flex-row items-center gap-3 rounded-[20px] border border-border bg-card p-2.5 active:bg-secondary">
              <Image source={scan.photo ? { uri: scan.photo } : s.image} style={{ width: 66, height: 66, borderRadius: 14 }} contentFit="cover" />
              <View className="min-w-0 flex-1">
                <Text className="font-sans-bold text-[15px]">{s.title}</Text>
                <Text numberOfLines={1} className="text-[13px] text-muted-foreground">
                  {s.diagnosis}
                </Text>
                <Text className="text-[12px] text-muted-foreground">{whenLabel(new Date(scan.date), now)}</Text>
              </View>
              <View className={cn('rounded-full px-2.5 py-1', tone === 'primary' ? 'bg-secondary' : tone === 'gold' ? 'bg-gold-soft' : 'bg-destructive/10')}>
                <Text className={cn('font-sans-bold text-[13px]', tone === 'primary' ? 'text-primary' : tone === 'gold' ? 'text-gold' : 'text-destructive')}>%{s.successRate}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </TabScreen>
  );
}
