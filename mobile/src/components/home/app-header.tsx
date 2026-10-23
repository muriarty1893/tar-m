import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BellIcon } from '@/components/icons';
import { useUnreadChats } from '@/components/market/parts';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/theme/tokens';

/**
 * The home screen's top bar: the round badge logo, the name with a "Dijital Tarım" tag, the
 * notifications bell (new messages, with a dot) and the farmer's profile chip (a demo account for now).
 */
export function AppHeader() {
  const insets = useSafeAreaInsets();
  const unread = useUnreadChats();
  return (
    <View className="flex-row items-center gap-2 border-b border-border bg-card px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
      <Image source={require('@/assets/images/brand/logo.webp')} style={{ width: 48, height: 48 }} accessibilityIgnoresInvertColors accessible={false} />
      <View className="min-w-0 flex-1">
        <Text role="heading" numberOfLines={1} className="font-heading text-[20px] leading-tight tracking-tight">
          Çiftçi Destek
        </Text>
        <View className="mt-0.5 self-start rounded-full bg-secondary px-2 py-0.5">
          <Text className="font-sans-bold text-[11.5px] text-primary">Dijital Tarım</Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={unread ? `Bildirimler: ${unread} okunmamış sohbet` : 'Bildirimler'}
        onPress={() => router.navigate({ pathname: '/pazar', params: { bolum: 'mesajlar' } })}
        className="size-11 items-center justify-center rounded-full bg-muted active:bg-border">
        <BellIcon size={22} weight="regular" color={COLORS.foreground} />
        {unread ? <View className="absolute right-2.5 top-2.5 size-2.5 rounded-full border-2 border-muted bg-orange-500" /> : null}
      </Pressable>
      <View
        accessible
        accessibilityLabel="Hesap: Ayşe Yılmaz, demo hesap"
        className="h-11 flex-row items-center gap-1.5 rounded-full border border-border bg-muted pl-1 pr-3">
        <View className="size-9 items-center justify-center rounded-full bg-primary">
          <Text className="font-sans-bold text-[13px] text-white">AY</Text>
        </View>
        <View>
          <Text className="font-sans-bold text-[13px] leading-4">Ayşe Y.</Text>
          <Text className="text-[11px] leading-[14px] text-muted-foreground">Demo</Text>
        </View>
      </View>
    </View>
  );
}
