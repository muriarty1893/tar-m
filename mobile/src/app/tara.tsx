import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyzingImage } from '@/components/app/analyzing-image';
import { ArrowsClockwiseIcon, CheckCircleIcon, ImageSquareIcon, LightningIcon, XIcon } from '@/components/icons';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { SCENARIOS, pickScenario, type Scenario } from '@/domain/scenarios';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';
import { COLORS } from '@/theme/tokens';

/** How long the (simulated) AI takes, as in the website demo. */
const ANALYSIS_MS = 2000;

const BRACKETS = [
  { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 24 },
  { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 24 },
  { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 24 },
  { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 24 },
] as const;

/** The demo's live camera, then "Analiz ediliyor…" over the frozen frame, then the result. */
export default function Scan() {
  const insets = useSafeAreaInsets();
  const addScan = useAppStore((s) => s.addScan);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState(false);
  const [ready, setReady] = useState(false);
  const [sample, setSample] = useState<Scenario>(SCENARIOS[0]);
  const [shot, setShot] = useState<{ photo?: string; scenario: Scenario } | null>(null);
  const [picking, setPicking] = useState(false);
  const [progress, setProgress] = useState(0);
  const camera = useRef<CameraView>(null);
  const live = !!permission?.granted;

  // The scan line sweeps while analysing.
  const line = useSharedValue(0);
  const flash = useSharedValue(0);
  useEffect(() => {
    if (!shot) return;
    line.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.System }), -1, true));
    flash.set(withSequence(withTiming(0.9, { duration: 1 }), withTiming(0, { duration: 450, reduceMotion: ReduceMotion.System })));
  }, [shot, line, flash]);
  const lineStyle = useAnimatedStyle(() => ({ top: `${2 + line.value * 94}%` }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  // Analysing: fill the bar, then open the result.
  useEffect(() => {
    if (!shot) return;
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / ANALYSIS_MS) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        const scanId = addScan({ scenarioId: shot.scenario.id, photo: shot.photo });
        router.replace({ pathname: '/sonuc/[id]', params: { id: scanId } });
      }
    }, 50);
    return () => clearInterval(id);
  }, [shot, addScan]);

  const shoot = async () => {
    if (shot) return;
    if (live && ready && camera.current) {
      const pic = await camera.current.takePictureAsync({ quality: 0.7 });
      if (pic?.uri) return setShot({ photo: pic.uri, scenario: pickScenario(pic.uri) });
    }
    setShot({ scenario: sample });
  };

  const fromGallery = async () => {
    setPicking(false);
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled && res.assets[0]) setShot({ photo: res.assets[0].uri, scenario: pickScenario(res.assets[0].uri) });
  };

  const frame = shot ? (shot.photo ? { uri: shot.photo } : shot.scenario.image) : sample.image;

  return (
    <View className="flex-1 bg-black">
      {live && !shot ? (
        <CameraView ref={camera} style={{ position: 'absolute', inset: 0 }} facing={facing} enableTorch={torch} onCameraReady={() => setReady(true)} />
      ) : (
        <Image source={frame} style={{ position: 'absolute', inset: 0, transform: [{ scale: shot?.photo ? 1 : 1.35 }] }} contentFit="cover" accessibilityLabel={shot ? shot.scenario.imageAlt : sample.imageAlt} />
      )}

      <View className="absolute inset-x-0 z-10 flex-row items-center justify-between px-5" style={{ top: insets.top + 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Kamerayı kapat" onPress={() => router.back()} className="size-12 items-center justify-center rounded-full bg-black/40 active:bg-black/70">
          <XIcon size={21} weight="bold" color={COLORS.white} />
        </Pressable>
        <View className="flex-row items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5">
          <View className="size-2 rounded-full bg-red-500" />
          <Text className="font-sans-semibold text-[14px] text-white">{shot ? 'CANLI · Tarama' : 'CANLI · Kamera'}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={torch ? 'Flaşı kapat' : 'Flaşı aç'} onPress={() => setTorch((t) => !t)} className="size-12 items-center justify-center rounded-full bg-black/40 active:bg-black/70">
          <LightningIcon size={21} weight="fill" color={torch ? COLORS.sun : COLORS.white} />
        </Pressable>
      </View>

      {/* Framing brackets; the scan line sweeps only while analysing. */}
      <View pointerEvents="none" className="absolute inset-x-8 h-[300px]" style={{ top: insets.top + 96 }}>
        {BRACKETS.map((b, i) => (
          <View key={i} className="absolute size-12" style={{ ...b, borderColor: shot ? COLORS.gold : 'rgba(255,255,255,0.9)' }} />
        ))}
        {shot ? <Animated.View className="absolute inset-x-3 h-1 rounded-full bg-gold" style={[{ boxShadow: `0px 0px 18px 4px ${COLORS.gold}` }, lineStyle]} /> : null}
      </View>

      {!shot ? (
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']} className="absolute inset-x-0 bottom-0 z-10 items-center gap-4 px-6 pt-12" style={{ paddingBottom: insets.bottom + 24 }}>
          {!live ? (
            <Pressable accessibilityRole="button" onPress={requestPermission} className="rounded-full bg-gold px-4 py-2 active:opacity-80">
              <Text className="font-sans-semibold text-[14px] text-gold-foreground">Kameraya izin ver · ya da örnekle dene</Text>
            </Pressable>
          ) : null}
          <Text className="overflow-hidden rounded-full bg-black/50 px-3.5 py-1.5 font-sans-semibold text-[14px] text-white">Hastalıklı bölgeyi çerçeveye alın</Text>
          <View className="w-full flex-row items-center justify-between">
            <Pressable accessibilityRole="button" accessibilityLabel="Örnek fotoğraf veya galeri" onPress={() => setPicking(true)} className="size-14 overflow-hidden rounded-xl border-2 border-white/70">
              <Image source={sample.image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Fotoğraf çek" onPress={shoot} className="size-[82px] items-center justify-center rounded-full border-4 border-white active:scale-90">
              <View className="size-[64px] rounded-full bg-white" />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Kamerayı çevir" onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} className="size-14 items-center justify-center rounded-full bg-black/40">
              <ArrowsClockwiseIcon size={26} weight="bold" color={COLORS.white} />
            </Pressable>
          </View>
          <Text className="font-sans-bold text-[13px] tracking-[2.6px] text-gold">FOTOĞRAF</Text>
        </LinearGradient>
      ) : (
        <>
          <Animated.View pointerEvents="none" className="absolute inset-0 z-20 bg-white" style={flashStyle} />
          <View className="absolute inset-x-0 bottom-0 z-10 rounded-t-[30px] bg-card px-5 pt-5" style={{ paddingBottom: insets.bottom + 28 }} accessibilityLiveRegion="polite">
            <View className="flex-row items-center gap-3.5">
              <AnalyzingImage size={56} />
              <View>
                <Text className="font-heading text-[19px]">Analiz ediliyor…</Text>
                <Text className="text-[14px] text-muted-foreground">Yapay zekâ fotoğrafı inceliyor</Text>
              </View>
            </View>
            <Progress value={progress} className="mt-4 h-2 bg-muted" indicatorClassName="bg-primary" />
            <View className="mt-3 gap-1.5">
              <Step done label="Yaprak ve toprak dokusu" />
              <Step done={progress > 50} label="Renk ve leke örüntüleri" />
              <Step done={progress > 95} label="Öneriler hazırlanıyor" />
            </View>
          </View>
        </>
      )}

      <Dialog open={picking} onOpenChange={setPicking}>
        <DialogContent className="mx-4 rounded-[24px] border-border bg-background">
          <DialogHeader>
            <DialogTitle className="font-heading text-[20px]">Fotoğraf seçin</DialogTitle>
            <DialogDescription className="text-[14px] text-muted-foreground">Örnek bir tarla seçin ya da galeriden fotoğraf yükleyin.</DialogDescription>
          </DialogHeader>
          <View className="flex-row flex-wrap justify-between gap-y-2.5">
            {SCENARIOS.map((s) => (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                accessibilityState={{ selected: s.id === sample.id }}
                onPress={() => {
                  setSample(s);
                  setPicking(false);
                }}
                className={cn('w-[48.5%] overflow-hidden rounded-[16px] border-2 bg-card', s.id === sample.id ? 'border-primary' : 'border-border')}>
                <Image source={s.image} style={{ width: '100%', aspectRatio: 1.4 }} contentFit="cover" />
                <Text className="px-2.5 py-2 font-sans-semibold text-[14px]">{s.title}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={fromGallery} className="flex-row items-center justify-center gap-2 rounded-full border border-border py-3 active:bg-secondary">
            <ImageSquareIcon size={20} color={COLORS.primary} />
            <Text className="font-sans-semibold text-[15px] text-primary">Galeriden seç</Text>
          </Pressable>
        </DialogContent>
      </Dialog>
    </View>
  );
}

function Step({ done, label }: { done: boolean; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      {done ? <CheckCircleIcon size={17} weight="fill" color={COLORS.primary} /> : <View className="size-4 rounded-full border-2 border-border" />}
      <Text className="text-[15px] text-muted-foreground">{label}</Text>
    </View>
  );
}
