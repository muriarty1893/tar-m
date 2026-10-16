import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { goBack } from '@/components/app/headers';
import { OnboardingSteps } from '@/components/app/onboarding-steps';
import { RoundButton } from '@/components/app/round-button';
import { Screen } from '@/components/app/screen';
import { SolarIcon } from '@/components/icons/solar-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { CROPS, type CropId } from '@/domain/crops';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';

export default function ChooseCrops() {
  const saved = useAppStore((s) => s.profile.crops);
  const [picked, setPicked] = useState<CropId[]>(saved);
  const toggle = (id: CropId) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <Screen
      className="px-5"
      footer={
        <Button size="lg" disabled={!picked.length} onPress={() => router.push({ pathname: '/konum', params: { crops: picked.join(',') } })}>
          <Text>{picked.length ? 'Devam et' : 'En az bir ürün seç'}</Text>
        </Button>
      }>
      <View className="flex-row items-center justify-between">
        <RoundButton icon="alt-arrow-left-linear" label="Geri" onPress={goBack} className="bg-card" />
        <OnboardingSteps step={2} />
        <View className="size-12" />
      </View>
      <Text role="heading" className="mt-2 font-heading text-4xl tracking-tight">
        Neler yetiştiriyorsun?
      </Text>
      <Text className="text-lg text-muted-foreground">Seçtiğin ürünlere göre uyarı, takvim ve fiyat gösteririz.</Text>
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {CROPS.map((crop) => {
          const on = picked.includes(crop.id);
          return (
            <Pressable
              key={crop.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={crop.name}
              onPress={() => toggle(crop.id)}
              className={cn('w-[48%] overflow-hidden rounded-[28px] border-[3px] bg-card active:opacity-90', on ? 'border-olive' : 'border-transparent')}>
              <Image source={crop.image} style={{ width: '100%', aspectRatio: 1.15 }} contentFit="cover" />
              <View className="flex-row items-center justify-between px-4 py-3">
                <Text className="font-sans-bold text-lg">{crop.name}</Text>
                {on ? <SolarIcon name="check-circle-bold" size={30} color="olive" /> : <View className="size-7 rounded-full border-2 border-sand" />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
