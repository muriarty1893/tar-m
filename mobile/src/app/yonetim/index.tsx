import { router } from 'expo-router';
import { Pressable, RefreshControl, View } from 'react-native';

import { useAdminOverview, useMe } from '@/api/queries';
import { AdminGate, ArticleRow } from '@/components/admin/admin-gate';
import { BackHeader } from '@/components/app/back-header';
import { TabScreen } from '@/components/app/screen';
import { ErrorState, Loading } from '@/components/app/states';
import { CaretRightIcon, FlagIcon, NewspaperIcon, NotePencilIcon, PlusIcon, StorefrontIcon, UsersIcon, type PhosphorIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/theme/tokens';

/** "Yönetim paneli": the numbers, the latest articles, and the way to news and reports (as /yonetim on the website). */
export default function AdminHome() {
  const me = useMe();
  const overview = useAdminOverview(!!me.data?.admin);
  return (
    <TabScreen refreshControl={<RefreshControl refreshing={overview.isRefetching} onRefresh={() => overview.refetch()} tintColor={COLORS.primary} colors={[COLORS.primary]} />}>
      <BackHeader title="Yönetim paneli" subtitle="Haberler ve şikâyetler" fallback="/hesap" />
      <AdminGate>
        {() =>
          overview.isPending ? (
            <Loading />
          ) : overview.isError ? (
            <ErrorState error={overview.error} onRetry={() => overview.refetch()} />
          ) : (
            <View className="gap-5">
              <Button className="h-14 rounded-full" onPress={() => router.push('/yonetim/haber')}>
                <PlusIcon size={20} weight="bold" color={COLORS.white} />
                <Text className="text-[16px]">Yeni haber yaz</Text>
              </Button>
              <View className="flex-row flex-wrap gap-2.5">
                <Stat Icon={NewspaperIcon} value={overview.data.counts.published} label="Yayındaki haber" onPress={() => router.push('/yonetim/haberler')} />
                <Stat Icon={NotePencilIcon} value={overview.data.counts.drafts} label="Taslak" onPress={() => router.push('/yonetim/haberler')} />
                <Stat Icon={FlagIcon} value={overview.data.counts.reports} label="Şikâyet edilen ilan" onPress={() => router.push('/yonetim/sikayetler')} alert={overview.data.counts.reports > 0} />
                <Stat Icon={StorefrontIcon} value={overview.data.counts.listings} label="Yayındaki ilan" onPress={() => router.navigate('/pazar')} />
                <Stat Icon={UsersIcon} value={overview.data.counts.people} label="Kayıtlı kullanıcı" />
              </View>
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text role="heading" className="font-heading text-[19px]">
                    Son haberler
                  </Text>
                  <Pressable accessibilityRole="button" onPress={() => router.push('/yonetim/haberler')} hitSlop={8} className="min-h-11 flex-row items-center">
                    <Text className="font-sans-semibold text-[14px] text-primary">Tüm haberler</Text>
                    <CaretRightIcon size={14} weight="bold" color={COLORS.primary} />
                  </Pressable>
                </View>
                {overview.data.articles.length ? overview.data.articles.map((a) => <ArticleRow key={a.id} a={a} />) : <Text className="text-[15px] text-muted-foreground">Henüz haber yok.</Text>}
              </View>
            </View>
          )
        }
      </AdminGate>
    </TabScreen>
  );
}

function Stat({ Icon, value, label, onPress, alert }: { Icon: PhosphorIcon; value: number; label: string; onPress?: () => void; alert?: boolean }) {
  const body = (
    <>
      <Icon size={26} weight="duotone" color={alert ? COLORS.destructive : COLORS.primary} />
      <Text className="mt-2 font-heading text-[28px] leading-9">{value.toLocaleString('tr-TR')}</Text>
      <Text className="text-[13.5px] leading-5 text-muted-foreground">{label}</Text>
    </>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} onPress={onPress} className="min-w-[46%] flex-1 rounded-[20px] border border-border bg-card p-3.5 active:bg-secondary">
      {body}
    </Pressable>
  ) : (
    <View accessible accessibilityLabel={`${label}: ${value}`} className="min-w-[46%] flex-1 rounded-[20px] border border-border bg-card p-3.5">
      {body}
    </View>
  );
}
