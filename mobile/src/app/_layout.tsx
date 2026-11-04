import '@/global.css';

import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/api/queries';
import { AppStatusBar } from '@/components/app/status-bar';
import { CLERK_PUBLISHABLE_KEY } from '@/lib/config';
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

/** Someone else's data never shows after signing out or in as another person: the cache starts over. */
function ClearCacheOnUserChange() {
  const { isLoaded, userId } = useAuth();
  const last = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!isLoaded) return;
    if (last.current !== undefined && last.current !== userId) queryClient.clear();
    last.current = userId ?? null;
  }, [isLoaded, userId]);
  return null;
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
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <ClearCacheOnUserChange />
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
                <Stack.Screen name="konum" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="giris" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="kayit" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="hesap" />
                <Stack.Screen name="tarlalar/index" />
                <Stack.Screen name="tarlalar/[id]" />
                <Stack.Screen name="tarlalar/duzenle" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="harita" />
                <Stack.Screen name="sinir/[id]" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="gorev" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="fiyatlar" />
                <Stack.Screen name="kaynaklar" />
                <Stack.Screen name="haberler/index" />
                <Stack.Screen name="haberler/[slug]" />
                <Stack.Screen name="ilan/[id]" />
                <Stack.Screen name="ilan/yeni" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="mesajlar/[id]" />
                <Stack.Screen name="yonetim/index" />
                <Stack.Screen name="yonetim/haberler" />
                <Stack.Screen name="yonetim/haber" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="yonetim/sikayetler" />
              </Stack>
              <PortalHost />
            </ThemeProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
