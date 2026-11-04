import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMe, useSignedIn, useUnread } from '@/api/queries';
import { BellIcon, SignInIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/theme/tokens';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toLocaleUpperCase('tr-TR');

/**
 * The home screen's top bar: the round badge logo, the name with a "Dijital Tarım" tag, the
 * notifications bell (new messages, with a dot) and the account chip (Hesabım), or "Giriş yap".
 */
export function AppHeader() {
  const insets = useSafeAreaInsets();
  const unread = useUnread();
  const { loaded, signedIn } = useSignedIn();
  const me = useMe();
  const name = me.data?.name ?? '';
  const first = name.split(/\s+/)[0] ?? '';
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
      {signedIn ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={unread ? `Mesajlar: ${unread} okunmamış sohbet` : 'Mesajlar'}
          onPress={() => router.navigate({ pathname: '/pazar', params: { bolum: 'mesajlar' } })}
          className="size-12 items-center justify-center rounded-full bg-muted active:bg-border">
          <BellIcon size={22} weight="regular" color={COLORS.foreground} />
          {unread ? <View className="absolute right-3 top-3 size-2.5 rounded-full border-2 border-muted bg-orange-500" /> : null}
        </Pressable>
      ) : null}
      {!loaded ? null : signedIn ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Hesabım${name ? `: ${name}` : ''}`} onPress={() => router.push('/hesap')} className="h-12 flex-row items-center gap-1.5 rounded-full border border-border bg-muted pl-1 pr-3 active:bg-border">
          <View className="size-10 items-center justify-center rounded-full bg-primary">
            <Text className="font-sans-bold text-[13px] text-white">{initials(name) || '?'}</Text>
          </View>
          <Text numberOfLines={1} className="max-w-[72px] font-sans-bold text-[13px]">
            {first || 'Hesabım'}
          </Text>
        </Pressable>
      ) : (
        <Pressable accessibilityRole="button" onPress={() => router.push('/giris')} className="h-12 flex-row items-center gap-1.5 rounded-full bg-primary px-4 active:bg-primary/90">
          <SignInIcon size={19} weight="bold" color={COLORS.white} />
          <Text className="font-sans-bold text-[14px] text-white">Giriş yap</Text>
        </Pressable>
      )}
    </View>
  );
}
