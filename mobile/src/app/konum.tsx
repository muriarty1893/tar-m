import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon, MagnifyingGlassIcon, NavigationArrowIcon, XCircleIcon, XIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { findProvinces, nearestProvince, type Province } from '@/domain/provinces';
import { cn } from '@/lib/utils';
import { useWeatherStore } from '@/state/weather';
import { COLORS, SHADOW } from '@/theme/tokens';

type Locate = { state: 'idle' | 'busy' } | { state: 'denied'; canAsk: boolean } | { state: 'failed' };

const LOCATE_TIMEOUT_MS = 15_000;

const withTimeout = <T,>(p: Promise<T>) => Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), LOCATE_TIMEOUT_MS))]);

/**
 * Approximate position: a recent known one, else a low-accuracy reading. Low accuracy needs the phone's
 * network location; where that is off (or missing, as on phones without Google services), the GPS is
 * asked instead. With only approximate permission, Android still blurs the result.
 */
async function currentProvince(): Promise<Province> {
  const pos =
    (await Location.getLastKnownPositionAsync({ maxAge: 30 * 60_000 })) ??
    (await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low })).catch(() =>
      withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }))
    ));
  return nearestProvince(pos.coords.latitude, pos.coords.longitude);
}

/** "Hava durumu konumu": pick the province the weather is for, or use the phone's location (asked only here). */
export default function PickProvince() {
  const insets = useSafeAreaInsets();
  const current = useWeatherStore((s) => s.province);
  const setProvince = useWeatherStore((s) => s.setProvince);
  const [query, setQuery] = useState('');
  const [locate, setLocate] = useState<Locate>({ state: 'idle' });
  const list = useMemo(() => findProvinces(query), [query]);

  const choose = (p: Province) => {
    setProvince(p);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const locateMe = async () => {
    setLocate({ state: 'busy' });
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return setLocate({ state: 'denied', canAsk: perm.canAskAgain });
      choose(await currentProvince());
    } catch {
      setLocate({ state: 'failed' });
    }
  };

  const header = (
    <View className="gap-3 pb-3">
      <View className="flex-row items-center justify-between">
        <View>
          <Text role="heading" className="font-heading text-[22px]">
            Hava durumu konumu
          </Text>
          <Text className="text-[13px] text-muted-foreground">Şu an: {current.name}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} className="size-11 items-center justify-center rounded-full bg-muted active:bg-secondary">
          <XIcon size={20} weight="bold" color={COLORS.foreground} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: locate.state === 'busy' }}
        disabled={locate.state === 'busy'}
        onPress={() => void locateMe()}
        className="min-h-14 flex-row items-center gap-3 rounded-[18px] border border-primary/30 bg-secondary px-4 active:bg-secondary/70">
        {locate.state === 'busy' ? <ActivityIndicator color={COLORS.primary} /> : <NavigationArrowIcon size={22} weight="fill" color={COLORS.primary} />}
        <View className="flex-1">
          <Text className="font-sans-bold text-[15.5px] text-primary">{locate.state === 'busy' ? 'Konumunuz bulunuyor…' : 'Konumumu kullan'}</Text>
          <Text className="text-[12.5px] text-muted-foreground">Yaklaşık konumunuzdan en yakın ili seçer</Text>
        </View>
      </Pressable>

      {locate.state === 'denied' || locate.state === 'failed' ? (
        <View className="gap-1 rounded-[16px] bg-gold-soft px-3.5 py-3" accessibilityRole="alert">
          <Text className="text-[14px] leading-5">
            {locate.state === 'failed'
              ? 'Konumunuz bulunamadı. Konum servislerinin açık olduğundan emin olun ya da ilinizi listeden seçin.'
              : 'Konum izni verilmedi. İlinizi aşağıdan seçebilirsiniz.'}
          </Text>
          {locate.state === 'denied' && !locate.canAsk ? (
            <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings()} hitSlop={8} className="min-h-9 justify-center self-start active:opacity-60">
              <Text className="font-sans-bold text-[14px] text-gold">Ayarlardan izin ver</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View className="h-12 flex-row items-center gap-2 rounded-full border border-input bg-card pl-4 pr-1" style={{ boxShadow: SHADOW.soft }}>
        <MagnifyingGlassIcon size={20} weight="bold" color={COLORS.mutedForeground} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="İl ara"
          placeholderTextColorClassName="accent-muted-foreground"
          accessibilityLabel="İl ara"
          autoCorrect={false}
          returnKeyType="search"
          className="h-full flex-1 font-sans text-[15px] text-foreground"
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Aramayı temizle" onPress={() => setQuery('')} className="size-11 items-center justify-center rounded-full active:bg-secondary">
            <XCircleIcon size={22} weight="fill" color={COLORS.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  return (
    <FlatList
      className="flex-1 bg-background"
      data={list}
      keyExtractor={(p) => p.name}
      ListHeaderComponent={header}
      ListEmptyComponent={<Text className="py-6 text-center text-[14px] text-muted-foreground">“{query.trim()}” adında bir il yok.</Text>}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      renderItem={({ item }) => {
        const on = item.name === current.name;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => choose(item)}
            className={cn('min-h-12 flex-row items-center justify-between border-b border-border px-1 active:bg-secondary/60')}>
            <Text className={cn('text-[16px]', on ? 'font-sans-bold text-primary' : '')}>{item.name}</Text>
            {on ? <CheckIcon size={20} weight="bold" color={COLORS.primary} /> : null}
          </Pressable>
        );
      }}
    />
  );
}
