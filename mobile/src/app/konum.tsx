import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';

import { goBack } from '@/components/app/headers';
import { OnboardingSteps } from '@/components/app/onboarding-steps';
import { RoundButton } from '@/components/app/round-button';
import { Screen } from '@/components/app/screen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { CropId } from '@/domain/crops';
import { PROVINCES } from '@/domain/provinces';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';

const fold = (s: string) => s.toLocaleLowerCase('tr');

/** Shown before the farmer types: the big farming provinces. */
const POPULAR = ['Konya', 'Şanlıurfa', 'Ankara', 'Adana', 'Bursa', 'İzmir', 'Antalya', 'Samsun'];

export default function Location() {
  const { crops } = useLocalSearchParams<{ crops?: string }>();
  const profile = useAppStore((s) => s.profile);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [name, setName] = useState(profile.name);
  const [province, setProvince] = useState(profile.province);
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState(profile.district);

  const matches = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return [...new Set([province, ...POPULAR].filter(Boolean))];
    return PROVINCES.filter((p) => fold(p).startsWith(q)).slice(0, 12);
  }, [query, province]);

  const finish = () => {
    const picked = (crops ? crops.split(',') : profile.crops) as CropId[];
    completeOnboarding({ name: name.trim() || 'Çiftçi', province, district: district.trim(), crops: picked });
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        className="px-5"
        footer={
          <Button size="lg" disabled={!province} onPress={finish}>
            <Text>Bitir ve başla</Text>
          </Button>
        }>
        <View className="flex-row items-center justify-between">
          <RoundButton icon="alt-arrow-left-linear" label="Geri" onPress={goBack} className="bg-card" />
          <OnboardingSteps step={3} />
          <View className="size-12" />
        </View>
        <Text role="heading" className="mt-2 font-heading text-4xl tracking-tight">
          Tarlan nerede?
        </Text>
        <Text className="text-lg text-muted-foreground">Hava durumu ve bölgendeki hastalık uyarıları için.</Text>

        <View className="gap-2">
          <Text nativeID="ad" className="font-sans-bold text-lg">
            Adın
          </Text>
          <Input aria-labelledby="ad" value={name} onChangeText={setName} placeholder="Örn. Ahmet" className="h-14 rounded-2xl text-lg" autoComplete="name" />
        </View>

        <View className="gap-2">
          <Text nativeID="il" className="font-sans-bold text-lg">
            İl: <Text className="font-sans-bold text-lg text-olive">{province || 'seçilmedi'}</Text>
          </Text>
          <Input aria-labelledby="il" value={query} onChangeText={setQuery} placeholder="İl ara (örn. Konya)" className="h-14 rounded-2xl text-lg" />
          <View className="flex-row flex-wrap gap-2">
            {matches.map((p) => (
              <Pressable
                key={p}
                accessibilityRole="radio"
                accessibilityState={{ checked: province === p }}
                onPress={() => setProvince(p)}
                className={cn('min-h-11 justify-center rounded-full px-4', province === p ? 'bg-accent' : 'bg-secondary')}>
                <Text className={cn('text-lg', province === p ? 'font-sans-bold text-accent-foreground' : '')}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text nativeID="ilce" className="font-sans-bold text-lg">
            İlçe
          </Text>
          <Input aria-labelledby="ilce" value={district} onChangeText={setDistrict} placeholder="Örn. Ereğli" className="h-14 rounded-2xl text-lg" />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
