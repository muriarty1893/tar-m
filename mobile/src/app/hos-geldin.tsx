import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingSteps } from '@/components/app/onboarding-steps';
import { SolarIcon } from '@/components/icons/solar-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAppStore } from '@/state/store';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  return (
    <View className="flex-1 bg-background px-6" style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }}>
      <View className="flex-1 items-center justify-center gap-6">
        <View className="items-center gap-3">
          <Image source={require('@/assets/brand/logo.webp')} style={{ width: 132, height: 132 }} contentFit="contain" accessibilityLabel="Çiftçi Destek logosu" />
          <Text role="heading" className="font-heading-black text-[40px] leading-[44px] tracking-tight">
            Çiftçi Destek
          </Text>
          <Text className="text-xl text-muted-foreground">Çiftçinin Akıllı Rehberi</Text>
        </View>
        <Image source={require('@/assets/images/app/wheat-field.jpg')} style={{ width: '100%', aspectRatio: 1.6, borderRadius: 32 }} contentFit="cover" accessibilityLabel="Altın sarısı buğday tarlası" />
        <Text className="text-center text-xl leading-8">Tarlanızdaki hastalığı fotoğrafla öğrenin, ne yapacağınızı adım adım görün.</Text>
        <OnboardingSteps step={1} />
      </View>
      <View className="gap-2">
        <Button size="lg" onPress={() => router.push('/urunler')}>
          <Text>Başlayalım</Text>
          <SolarIcon name="arrow-right-linear" color="primaryForeground" />
        </Button>
        <Button
          variant="ghost"
          onPress={() => {
            completeOnboarding(profile);
            router.replace('/');
          }}>
          <Text>Zaten hesabım var</Text>
        </Button>
      </View>
    </View>
  );
}
