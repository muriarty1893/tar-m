import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { goBack } from '@/components/app/headers';
import { RoundButton } from '@/components/app/round-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { CROPS, type CropId } from '@/domain/crops';
import { SAMPLE_PHOTOS, type SamplePhoto } from '@/domain/diagnosis';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';

export default function ScanCamera() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ field?: string }>();
  const profile = useAppStore((s) => s.profile);
  const fields = useAppStore((s) => s.fields);
  const presetField = fields.find((f) => f.id === params.field);
  const [crop, setCrop] = useState<CropId>(presetField?.crop ?? profile.crops[0] ?? 'bugday');
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const camera = useRef<CameraView>(null);

  // Crops the farmer grows first, then the rest.
  const crops = [...CROPS].sort((a, b) => Number(profile.crops.includes(b.id)) - Number(profile.crops.includes(a.id)));
  const fieldFor = (c: CropId) => (presetField?.crop === c ? presetField.id : fields.find((f) => f.crop === c)?.id);

  const analyse = (photo: string, c: CropId) => {
    const field = fieldFor(c);
    router.replace({ pathname: '/analiz', params: { photo, crop: c, ...(field ? { field } : {}) } });
  };

  const shoot = async () => {
    if (!camera.current || !ready || busy) return;
    setBusy(true);
    try {
      const pic = await camera.current.takePictureAsync({ quality: 0.7 });
      if (pic?.uri) analyse(pic.uri, crop);
    } finally {
      setBusy(false);
    }
  };

  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled && res.assets[0]) analyse(res.assets[0].uri, crop);
  };

  const trySample = (s: SamplePhoto) => {
    setHelpOpen(false);
    analyse(s.id, s.crop);
  };

  const granted = !!permission?.granted;

  return (
    <View className="flex-1 bg-foreground">
      {granted ? (
        <CameraView ref={camera} style={{ position: 'absolute', inset: 0 }} facing="back" enableTorch={torch} onCameraReady={() => setReady(true)} />
      ) : (
        <Image source={require('@/assets/images/app/leaf-rust.jpg')} style={{ position: 'absolute', inset: 0, opacity: 0.9 }} contentFit="cover" />
      )}
      <View className="absolute inset-0 bg-foreground/30" pointerEvents="none" />

      <View className="flex-row items-center justify-between px-6" style={{ paddingTop: insets.top + 8 }}>
        <RoundButton icon="close-circle-linear" label="Kapat" tone="dark" onPress={goBack} />
        <Text role="heading" className="font-heading text-2xl text-background">
          Tara
        </Text>
        <RoundButton icon="bolt-linear" label={torch ? 'Flaşı kapat' : 'Flaşı aç'} tone="dark" iconColor={torch ? 'amber' : 'background'} onPress={() => setTorch((t) => !t)} />
      </View>

      <View className="flex-1 items-center justify-center px-10">
        {granted ? (
          <>
            <View className="aspect-[3/4] max-h-[46vh] w-full rounded-[28px] border-2 border-background/80" />
            <Text className="mt-6 overflow-hidden rounded-full bg-foreground/70 px-5 py-3 font-sans-bold text-lg text-background">Yaprağı çerçeveye al</Text>
          </>
        ) : (
          <View className="w-full gap-4 rounded-[28px] bg-card p-6">
            <Text className="font-heading text-2xl">Kamera izni gerekli</Text>
            <Text className="text-lg text-muted-foreground">
              Yaprağın fotoğrafını çekmek için kameraya izin ver. İstersen örnek bir fotoğrafla da deneyebilirsin.
            </Text>
            {permission?.canAskAgain !== false ? (
              <Button onPress={requestPermission}>
                <Text>Kameraya izin ver</Text>
              </Button>
            ) : (
              <Text className="text-base text-muted-foreground">İzin daha önce reddedildi. Telefonun ayarlarından açabilirsin.</Text>
            )}
            <Button variant="outline" onPress={() => setHelpOpen(true)}>
              <Text>Örnek fotoğrafla dene</Text>
            </Button>
          </View>
        )}
      </View>

      <View style={{ paddingBottom: insets.bottom + 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-6">
          {crops.map((c) => {
            const on = c.id === crop;
            return (
              <Pressable
                key={c.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setCrop(c.id)}
                className={cn('h-12 justify-center rounded-full px-5', on ? 'bg-accent' : 'bg-foreground/60')}>
                <Text className={cn('text-lg', on ? 'font-sans-bold text-accent-foreground' : 'font-sans-semibold text-background')}>{c.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View className="mt-6 flex-row items-center justify-around px-8">
          <RoundButton icon="gallery-linear" label="Galeriden seç" tone="dark" onPress={pickFromGallery} className="size-14" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fotoğraf çek"
            accessibilityState={{ disabled: !granted || !ready || busy }}
            onPress={granted ? shoot : () => setHelpOpen(true)}
            className="size-24 items-center justify-center rounded-full border-4 border-background active:opacity-80">
            <View className={cn('size-[72px] rounded-full bg-accent', busy && 'opacity-60')} />
          </Pressable>
          <RoundButton icon="question-circle-linear" label="Yardım ve örnek fotoğraflar" tone="dark" onPress={() => setHelpOpen(true)} className="size-14" />
        </View>
      </View>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="mx-4 rounded-[28px] bg-background">
          <DialogHeader>
            <DialogTitle>İyi bir fotoğraf için</DialogTitle>
            <DialogDescription className="text-lg leading-7">
              Tek bir yaprağı yakından, gölgesiz ve net çek. Lekeli kısım çerçevenin ortasında olsun.
            </DialogDescription>
          </DialogHeader>
          <Text className="font-sans-bold text-lg">{Platform.OS === 'web' ? 'Örnek fotoğrafla dene' : 'Kameran yoksa örnekle dene'}</Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {SAMPLE_PHOTOS.map((s) => (
              <Pressable key={s.id} accessibilityRole="button" accessibilityLabel={`Örnek: ${s.label}`} onPress={() => trySample(s)} className="w-[48%] overflow-hidden rounded-2xl bg-card active:opacity-80">
                <Image source={s.image} style={{ width: '100%', aspectRatio: 1.3 }} contentFit="cover" />
                <Text className="px-3 py-2 font-sans-semibold text-base">{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </DialogContent>
      </Dialog>
    </View>
  );
}
