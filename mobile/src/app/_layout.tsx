import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStatusBar } from '@/components/app/status-bar';
import { useAppStore } from '@/state/store';
import { APP_FONTS } from '@/theme/fonts';
import { COLORS } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

const NAV_THEME: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: COLORS.background, card: COLORS.background, text: COLORS.foreground, border: COLORS.border, primary: COLORS.primary, notification: COLORS.primary },
};

/** True once the saved state has been read from the device. */
function useHydrated() {
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());
  useEffect(() => useAppStore.persist.onFinishHydration(() => setHydrated(true)), []);
  return hydrated;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(APP_FONTS);
  const hydrated = useHydrated();
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={NAV_THEME}>
          <AppStatusBar />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="tara" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
            <Stack.Screen name="sonuc/[id]" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="soru/[id]" />
            <Stack.Screen name="hava" />
            <Stack.Screen name="tarlalar/index" />
            <Stack.Screen name="tarlalar/[id]" />
            <Stack.Screen name="harita" />
            <Stack.Screen name="fiyatlar" />
            <Stack.Screen name="kaynaklar" />
            <Stack.Screen name="ilan/[id]" />
            <Stack.Screen name="ilan/yeni" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="mesajlar/index" />
            <Stack.Screen name="mesajlar/[id]" />
          </Stack>
          <PortalHost />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
