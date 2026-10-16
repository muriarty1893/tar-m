import { router } from 'expo-router';
import { useState } from 'react';

import { PriceStrip } from '@/components/app/price-strip';
import { QuickActions } from '@/components/app/quick-actions';
import { TabScreen } from '@/components/app/screen';
import { SoonDialog } from '@/components/app/soon-dialog';
import { WeatherHero } from '@/components/app/weather-hero';

/** "Ana sayfa", as in the website demo: weather, market prices, quick actions. */
export default function Home() {
  const [soon, setSoon] = useState<string | null>(null);
  return (
    <TabScreen>
      <WeatherHero />
      <PriceStrip onSeeAll={() => setSoon('Tarım Borsası Fiyatları')} />
      <QuickActions
        onScan={() => router.push('/tara')}
        onFields={() => setSoon('Tarlalarım')}
        onMap={() => setSoon('Tarla Haritası')}
        onCalendar={() => router.navigate('/takvim')}
      />
      <SoonDialog title={soon} onClose={() => setSoon(null)} />
    </TabScreen>
  );
}
