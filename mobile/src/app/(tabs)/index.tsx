import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { PriceStrip } from '@/components/app/price-strip';
import { TabScreen } from '@/components/app/screen';
import { WeatherHero } from '@/components/app/weather-hero';
import { AdCards } from '@/components/home/ad-cards';
import { AppHeader } from '@/components/home/app-header';
import { QuickMenu } from '@/components/home/quick-menu';
import { WeekOutlook } from '@/components/home/week-outlook';
import { MarketStrip } from '@/components/market/market-strip';
import { Text } from '@/components/ui/text';

/**
 * "Ana sayfa": the top bar, the ad spaces, the quick menu, the field's live weather and this week's
 * outlook, then market prices and the newest listings.
 */
export default function Home() {
  return (
    <TabScreen header={<AppHeader />}>
      <View className="gap-4">
        <AdCards />
        <QuickMenu />
        <WeatherHero onForecast={() => router.push('/hava')} />
        <WeekOutlook />
      </View>
      <PriceStrip onSeeAll={() => router.push('/fiyatlar')} />
      <MarketStrip />
      <Pressable accessibilityRole="link" onPress={() => router.push('/kaynaklar')} hitSlop={8} className="mt-6 min-h-11 items-center justify-center self-center px-3 active:opacity-60">
        <Text className="text-[13px] text-muted-foreground underline">Görsel kaynakları</Text>
      </Pressable>
    </TabScreen>
  );
}
