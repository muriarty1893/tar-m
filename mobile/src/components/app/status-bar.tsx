import { StatusBar } from 'expo-status-bar';
import { Platform, StatusBar as NativeStatusBar } from 'react-native';

import { COLORS } from '@/theme/tokens';

/**
 * The status bar over a light screen, or over a dark one (the camera). On Android phones that
 * don't draw apps edge to edge (Android 14 and older, in Expo Go) the bar gets its own background,
 * black by default, which hid the dark clock and battery icons; so it's painted to match the screen.
 */
export function AppStatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {Platform.OS === 'android' ? <NativeStatusBar backgroundColor={dark ? COLORS.black : COLORS.background} /> : null}
    </>
  );
}
