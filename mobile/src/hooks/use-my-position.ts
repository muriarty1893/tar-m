import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, Linking } from 'react-native';

import type { LatLng } from '@/api/types';

const TIMEOUT_MS = 15_000;
const withTimeout = <T,>(p: Promise<T>) => Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS))]);

/**
 * "Konumuma git" on the map: the phone's position, asked only when the farmer taps it. The app asks for
 * approximate location only (see app.json), so it centres the map near the field, not on it.
 */
export function useMyPosition() {
  const [busy, setBusy] = useState(false);
  const locate = async (): Promise<LatLng | null> => {
    setBusy(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Konum izni verilmedi', 'Haritayı bulunduğunuz yere götürmek için konum izni gerekiyor. Haritayı parmağınızla da kaydırabilirsiniz.', [
          { text: 'Tamam', style: 'cancel' },
          ...(perm.canAskAgain ? [] : [{ text: 'Ayarları aç', onPress: () => Linking.openSettings() }]),
        ]);
        return null;
      }
      const pos =
        (await Location.getLastKnownPositionAsync({ maxAge: 10 * 60_000 })) ??
        (await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })).catch(() => withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }))));
      return [pos.coords.latitude, pos.coords.longitude];
    } catch {
      Alert.alert('Konum bulunamadı', 'Telefonun konumu açık mı? Haritayı parmağınızla da kaydırabilirsiniz.');
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { locate, busy };
}
