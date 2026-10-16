import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { SCAN_TAB, TabBar } from '@/components/app/tab-bar';
import { useAppStore } from '@/state/store';

export default function TabsLayout() {
  const onboarded = useAppStore((s) => s.onboarded);
  if (!onboarded) return <Redirect href="/hos-geldin" />;

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Bugün' }} />
      <Tabs.Screen name="tarlalar" options={{ title: 'Tarlalar' }} />
      <Tabs.Screen name={SCAN_TAB} options={{ title: 'Tara' }} />
      <Tabs.Screen name="takvim" options={{ title: 'Takvim' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
