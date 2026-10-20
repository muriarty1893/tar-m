import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { PriceStrip } from '@/components/app/price-strip';
import { QuickActions } from '@/components/app/quick-actions';
import { TabScreen } from '@/components/app/screen';
import { WeatherHero } from '@/components/app/weather-hero';
import { MarketStrip } from '@/components/market/market-strip';
import { Text } from '@/components/ui/text';

/** "Ana sayfa", as in the website demo: weather (with messages), market prices, quick actions, then the newest listings. */
export default function Home() {
  return (
    <TabScreen>
      <WeatherHero inbox onForecast={() => router.push('/hava')} />
      <PriceStrip onSeeAll={() => router.push('/fiyatlar')} />
      <QuickActions onScan={() => router.push('/tara')} onFields={() => router.push('/tarlalar')} onMap={() => router.push('/harita')} onCalendar={() => router.navigate('/takvim')} />
      <MarketStrip />
      <Pressable accessibilityRole="link" onPress={() => router.push('/kaynaklar')} hitSlop={8} className="mt-6 min-h-11 items-center justify-center self-center px-3 active:opacity-60">
        <Text className="text-[13px] text-muted-foreground underline">Görsel kaynakları</Text>
      </Pressable>
    </TabScreen>
  );
}
