import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useMe, useSignedIn } from '@/api/queries';
import type { AdminArticle, ArticleStatus } from '@/api/types';
import { EmptyState, ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import { CaretRightIcon, ShieldCheckIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { longDate } from '@/domain/format';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

/** The admin screens' door: signed-in admins only (the server checks every call again). */
export function AdminGate({ children }: { children: (ready: true) => ReactNode }) {
  const { loaded, signedIn } = useSignedIn();
  const me = useMe();
  if (!loaded || (signedIn && me.isPending)) return <Loading />;
  if (!signedIn) return <SignInPrompt title="Yönetim için giriş yapın" body="Yönetim paneli yalnızca yönetici hesaplarına açıktır." />;
  if (me.isError) return <ErrorState error={me.error} onRetry={() => me.refetch()} />;
  if (!me.data?.admin) return <EmptyState Icon={ShieldCheckIcon} title="Bu bölüm yöneticiler içindir" body="Hesabınızın yönetici yetkisi yok." />;
  return <>{children(true)}</>;
}

export function StatusBadge({ status }: { status: ArticleStatus }) {
  const published = status === 'published';
  return (
    <View className={cn('self-start rounded-full px-2.5 py-0.5', published ? 'bg-secondary' : 'bg-gold-soft')}>
      <Text className={cn('font-sans-bold text-[12px]', published ? 'text-primary' : 'text-gold')}>{published ? 'Yayında' : 'Taslak'}</Text>
    </View>
  );
}

/** An article in the admin lists: status, date, title; opens the editor. */
export function ArticleRow({ a }: { a: AdminArticle }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${a.title}, ${a.status === 'published' ? 'yayında' : 'taslak'}, ${longDate(a.date)}. Düzenle`}
      onPress={() => router.push({ pathname: '/yonetim/haber', params: { id: a.id } })}
      className="min-h-16 flex-row items-center gap-3 rounded-[18px] border border-border bg-card px-3.5 py-3 active:bg-secondary">
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <StatusBadge status={a.status} />
          <Text className="text-[12.5px] text-muted-foreground">{longDate(a.date)}</Text>
        </View>
        <Text numberOfLines={2} className="font-sans-semibold text-[15px] leading-5">
          {a.title}
        </Text>
      </View>
      <CaretRightIcon size={18} weight="bold" color={COLORS.mutedForeground} />
    </Pressable>
  );
}
