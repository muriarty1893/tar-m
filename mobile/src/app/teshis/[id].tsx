import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { goBack } from '@/components/app/headers';
import { scanPhotoSource } from '@/components/app/photo';
import { RoundButton } from '@/components/app/round-button';
import { Screen } from '@/components/app/screen';
import { Panel, Stat, StatRow } from '@/components/app/stat';
import { SolarIcon } from '@/components/icons/solar-icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { cropById } from '@/domain/crops';
import { DIAGNOSES, sampleById, type Severity } from '@/domain/diagnosis';
import { relativeDayLabel, shortDate, timeRange } from '@/domain/format';
import { useWeather } from '@/hooks/use-weather';
import { useAppStore } from '@/state/store';
import { COLORS } from '@/theme/tokens';

const SEVERITY: Record<Exclude<Severity, 'yok'>, { label: string; dot: 'olive' | 'amber' | 'brick' }> = {
  hafif: { label: 'Hafif', dot: 'olive' },
  orta: { label: 'Orta', dot: 'amber' },
  ciddi: { label: 'Ciddi', dot: 'brick' },
};

export default function DiagnosisResult() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scan = useAppStore((s) => s.scans.find((x) => x.id === id));
  const scheduled = useAppStore((s) => s.tasks.find((t) => t.scanId === id));
  const field = useAppStore((s) => s.fields.find((f) => f.id === scan?.fieldId));
  const scheduleTreatment = useAppStore((s) => s.scheduleTreatment);
  const w = useWeather();
  const [askOpen, setAskOpen] = useState(false);
  const [asked, setAsked] = useState(false);

  if (!scan) {
    return (
      <Screen className="px-5">
        <Text className="font-heading text-3xl">Tarama bulunamadı</Text>
        <Button onPress={() => router.replace('/')}>
          <Text>Ana sayfaya dön</Text>
        </Button>
      </Screen>
    );
  }

  const d = DIAGNOSES[scan.diagnosisId];
  const healthy = d.severity === 'yok';
  const severity = d.severity === 'yok' ? null : SEVERITY[d.severity];
  const percent = Math.round(scan.confidence * 100);
  const spots = sampleById(scan.photo) ? d.spots : undefined;
  const windowHour = w.window ? w.hours.find((h) => h.time.getTime() === w.window!.start.getTime()) : undefined;
  const whenLabel = (start: Date, end: Date) => `${relativeDayLabel(start, w.now)} ${start.getHours() < 12 ? 'sabah ' : ''}${timeRange(start.getHours(), end.getHours())}`;

  const share = () =>
    Share.share({
      message: `Çiftçi Destek teşhisi: ${cropById(scan.crop).name}${field ? ` (${field.name})` : ''}: ${d.name}, %${percent} güven. ${d.steps.map((s) => s.text).join(' ')}`,
    });

  return (
    <Screen edgeToEdgeTop className="gap-4">
      <View className="h-80 w-full overflow-hidden">
        <Image source={scanPhotoSource(scan.photo)} style={{ position: 'absolute', inset: 0 }} contentFit="cover" accessibilityLabel={`Taranan ${cropById(scan.crop).name} yaprağı`} />
        <LinearGradient colors={[`${COLORS.foreground}66`, 'transparent', 'transparent']} style={{ position: 'absolute', inset: 0 }} />
        {spots?.map((s, i) => (
          <View
            key={i}
            className="absolute rounded-full border-[3px] border-amber bg-amber/15"
            style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: s.size, height: s.size }}
            accessibilityElementsHidden
          />
        ))}
        <View className="absolute inset-x-6 flex-row items-center justify-between" style={{ top: insets.top + 8 }}>
          <RoundButton icon="alt-arrow-left-linear" label="Geri" onPress={goBack} />
          <RoundButton icon="share-linear" label="Paylaş" onPress={share} />
        </View>
      </View>

      <Panel className="-mt-12">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-base text-muted-foreground">Teşhis · {cropById(scan.crop).name}</Text>
            <Text role="heading" className="mt-1 font-heading text-3xl tracking-tight">
              {d.name}
            </Text>
            {d.latin ? <Text className="mt-1 font-sans-italic text-base text-muted-foreground">{d.latin}</Text> : <Text className="mt-1 text-base text-muted-foreground">{d.kind}</Text>}
          </View>
          <View className="items-end">
            <Text className="font-heading text-5xl leading-[52px]">%{percent}</Text>
            <Text className="text-base text-muted-foreground">güven</Text>
          </View>
        </View>
        {healthy ? (
          <View className="mt-5 flex-row items-center gap-3 rounded-2xl bg-olive/15 p-4">
            <SolarIcon name="check-circle-bold" size={32} color="olive" />
            <Text className="flex-1 font-sans-bold text-lg">Hastalık belirtisi bulunmadı</Text>
          </View>
        ) : severity ? (
          <View className="mt-5">
            <StatRow>
              <Stat label="Şiddet" value={severity.label} dot={severity.dot} />
              <Stat label="Yayılma hızı" value={d.spread?.label ?? '—'} detail={d.spread?.detail} />
            </StatRow>
          </View>
        ) : null}
      </Panel>

      <Panel>
        <Text role="heading" className="font-heading text-2xl tracking-tight">
          Ne yapmalısın?
        </Text>
        <View className="mt-4 gap-5">
          {d.steps.map((s, i) => (
            <View key={i} className="flex-row gap-4">
              <View className="size-9 items-center justify-center rounded-full bg-primary">
                <Text className="font-sans-bold text-lg text-primary-foreground">{i + 1}</Text>
              </View>
              <View className="flex-1 pt-1">
                <Text className="text-lg leading-6">{s.text}</Text>
                {s.note ? <Text className="mt-1 text-base text-muted-foreground">{s.note}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      </Panel>

      {!healthy && w.window ? (
        <View className="mx-4 flex-row items-center gap-4 rounded-[28px] bg-secondary p-6">
          <SolarIcon name="cloud-sun-linear" size={40} color="olive" />
          <View className="flex-1">
            <Text className="text-base text-muted-foreground">İlaçlama için en iyi zaman</Text>
            <Text className="font-sans-bold text-lg">{whenLabel(w.window.start, w.window.end)}</Text>
            {windowHour ? (
              <Text className="text-base text-muted-foreground">
                Rüzgâr {windowHour.windKmh} km/s, sıcaklık {windowHour.tempC} °C
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <View className="mx-4 mt-2 gap-3">
        {healthy ? (
          <Button size="lg" onPress={() => router.replace('/')}>
            <Text>Tamam</Text>
          </Button>
        ) : scheduled ? (
          <Button size="lg" variant="secondary" onPress={() => router.push('/takvim')} accessibilityHint="Takvimi açar">
            <SolarIcon name="check-circle-bold" color="olive" />
            <Text>Takvimde: {relativeDayLabel(new Date(`${scheduled.date}T${scheduled.time ?? '08:00'}`), w.now)} {scheduled.time}</Text>
          </Button>
        ) : (
          <Button size="lg" disabled={!w.window} onPress={() => w.window && scheduleTreatment(scan.id, w.window.start)}>
            <SolarIcon name="calendar-add-linear" color="primaryForeground" />
            <Text>Takvime ekle</Text>
          </Button>
        )}
        <View className="flex-row gap-3">
          <Button variant="outline" className="flex-1 px-3" onPress={() => setAskOpen(true)}>
            <SolarIcon name="user-speak-linear" />
            <Text>Uzmana sor</Text>
          </Button>
          <Button variant="outline" className="flex-1 px-3" onPress={() => router.replace({ pathname: '/tara', params: scan.fieldId ? { field: scan.fieldId } : {} })}>
            <SolarIcon name="restart-linear" />
            <Text>Yeniden tara</Text>
          </Button>
        </View>
        <Text className="mt-1 text-center text-base text-muted-foreground">
          {shortDate(new Date(scan.date))}
          {field ? ` · ${field.name}` : ''} · Bu bir prototip sonucudur
        </Text>
      </View>

      <Dialog open={askOpen} onOpenChange={setAskOpen}>
        <DialogContent className="mx-4 rounded-[28px] bg-background">
          <DialogHeader>
            <DialogTitle>{asked ? 'Talebin alındı' : 'Ziraat mühendisine sor'}</DialogTitle>
            <DialogDescription className="text-lg leading-7">
              {asked
                ? 'Bir ziraat mühendisi fotoğrafına ve teşhise bakıp sana dönecek. (Prototip: talep gerçekte gönderilmez.)'
                : 'Fotoğrafın ve bu teşhis, bölgendeki bir ziraat mühendisine gönderilir. Genellikle aynı gün içinde cevap gelir.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {asked ? (
              <Button onPress={() => setAskOpen(false)}>
                <Text>Tamam</Text>
              </Button>
            ) : (
              <Button onPress={() => setAsked(true)}>
                <Text>Talep gönder</Text>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Screen>
  );
}
