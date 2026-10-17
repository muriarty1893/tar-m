import { router } from 'expo-router';
import { useState } from 'react';

import { PriceStrip } from '@/components/app/price-strip';
import { QuickActions } from '@/components/app/quick-actions';
import { TabScreen } from '@/components/app/screen';
import { SoonDialog } from '@/components/app/soon-dialog';
import { WeatherHero } from '@/components/app/weather-hero';
import { MarketStrip } from '@/components/market/market-strip';

/** "Ana sayfa", as in the website demo: weather (with messages), market prices, quick actions, then the newest listings. */
export default function Home() {
  const [soon, setSoon] = useState<string | null>(null);
  return (
    <TabScreen>
      <WeatherHero inbox onForecast={() => router.push('/hava')} />
      <PriceStrip onSeeAll={() => setSoon('Tarım Borsası Fiyatları')} />
      <QuickActions
        onScan={() => router.push('/tara')}
        onFields={() => setSoon('Tarlalarım')}
        onMap={() => setSoon('Tarla Haritası')}
        onCalendar={() => router.navigate('/takvim')}
      />
      <MarketStrip />
      <SoonDialog title={soon} onClose={() => setSoon(null)} />
    </TabScreen>
  );
}
