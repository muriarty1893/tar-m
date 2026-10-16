import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { scanPhotoSource } from '@/components/app/photo';
import { RoundButton } from '@/components/app/round-button';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { cropById, type CropId } from '@/domain/crops';
import { diagnose } from '@/domain/diagnosis';
import { useAppStore } from '@/state/store';

const DURATION_MS = 2800;

function stage(p: number) {
  if (p < 30) return 'Yaprak bulunuyor';
  if (p < 70) return 'Hastalık belirtileri aranıyor';
  return 'Sonuç hazırlanıyor';
}

/** "Analiz ediliyor": a scan line sweeps the photo while the (simulated) model works. */
export default function Analysing() {
  const insets = useSafeAreaInsets();
  const { photo, crop, field } = useLocalSearchParams<{ photo: string; crop: CropId; field?: string }>();
  const addScan = useAppStore((s) => s.addScan);
  const [progress, setProgress] = useState(0);
  const [frameH, setFrameH] = useState(0);
  const cancelled = useRef(false);
  const line = useSharedValue(0);

  useEffect(() => {
    line.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.System }), -1, true));
  }, [line]);

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - started) / DURATION_MS) * 100));
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        if (cancelled.current || !photo || !crop) return;
        const result = diagnose({ crop, sampleId: photo, photoKey: photo });
        const scanId = addScan({ crop, fieldId: field, diagnosisId: result.diagnosisId, confidence: result.confidence, photo });
        router.replace({ pathname: '/teshis/[id]', params: { id: scanId } });
      }
    }, 80);
    return () => clearInterval(id);
  }, [photo, crop, field, addScan]);

  const lineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: line.value * Math.max(frameH - 4, 0) }] }));

  const cancel = () => {
    cancelled.current = true;
    router.replace('/tara');
  };

  if (!photo || !crop) return null;

  return (
    <View className="flex-1 bg-foreground">
      <Image source={scanPhotoSource(photo)} style={{ position: 'absolute', inset: 0 }} contentFit="cover" />
      <View className="absolute inset-0 bg-foreground/50" />

      <View className="flex-row items-center justify-between px-6" style={{ paddingTop: insets.top + 8 }}>
        <RoundButton icon="alt-arrow-left-linear" label="Vazgeç ve geri dön" tone="dark" onPress={cancel} />
        <Text className="font-sans-semibold text-base text-background">{cropById(crop).name} · Yaprak</Text>
        <View className="size-12" />
      </View>

      <View className="mx-8 mt-8 max-h-[52vh] flex-1 overflow-hidden rounded-[28px] border-2 border-background/80" onLayout={(e) => setFrameH(e.nativeEvent.layout.height)}>
        <Image source={scanPhotoSource(photo)} style={{ position: 'absolute', inset: 0 }} contentFit="cover" />
        <Animated.View className="absolute inset-x-0 top-0 h-1 bg-accent" style={[{ boxShadow: '0px 0px 18px 6px rgba(192, 100, 59, 0.45)' }, lineStyle]} />
      </View>

      <View className="mx-6 mt-auto rounded-[28px] bg-card p-6" style={{ marginBottom: insets.bottom + 24 }} accessibilityLiveRegion="polite">
        <Text role="heading" className="font-heading text-2xl tracking-tight">
          Analiz ediliyor
        </Text>
        <Text className="mt-2 text-lg text-muted-foreground">Yaprağınızı inceliyoruz, lütfen birkaç saniye bekleyin.</Text>
        <Progress value={progress} className="mt-5 h-3 bg-muted" indicatorClassName="bg-primary" accessibilityLabel={`İlerleme yüzde ${progress}`} />
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-base text-muted-foreground">{stage(progress)}</Text>
          <Text className="font-sans-bold text-base">%{progress}</Text>
        </View>
        <Button variant="outline" className="mt-6" onPress={cancel}>
          <Text>Vazgeç</Text>
        </Button>
      </View>
    </View>
  );
}
