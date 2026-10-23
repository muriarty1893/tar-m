import { Tabs } from 'expo-router/js-tabs';

import { SCAN_TAB, TabBar } from '@/components/app/tab-bar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Ana sayfa' }} />
      <Tabs.Screen name={SCAN_TAB} options={{ title: 'Taramalar' }} />
      <Tabs.Screen name="pazar" options={{ title: 'Pazar' }} />
      <Tabs.Screen name="takvim" options={{ title: 'Takvim' }} />
    </Tabs>
  );
}
