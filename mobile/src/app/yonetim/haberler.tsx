import { router } from 'expo-router';
import { RefreshControl, View } from 'react-native';

import { useAdminNews, useMe } from '@/api/queries';
import { AdminGate, ArticleRow } from '@/components/admin/admin-gate';
import { BackHeader } from '@/components/app/back-header';
import { TabScreen } from '@/components/app/screen';
import { EmptyState, ErrorState, Loading } from '@/components/app/states';
import { NewspaperIcon, PlusIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/theme/tokens';

/** Every article, drafts first; drafts are only seen here. */
export default function AdminNews() {
  const me = useMe();
  const news = useAdminNews(!!me.data?.admin);
  return (
    <TabScreen refreshControl={<RefreshControl refreshing={news.isRefetching} onRefresh={() => news.refetch()} tintColor={COLORS.primary} colors={[COLORS.primary]} />}>
      <BackHeader
        title="Haberler"
        subtitle="Taslaklar yalnızca burada görünür"
        fallback="/yonetim"
        right={
          <Button size="icon" className="size-12 rounded-full" accessibilityLabel="Yeni haber" onPress={() => router.push('/yonetim/haber')}>
            <PlusIcon size={22} weight="bold" color={COLORS.white} />
          </Button>
        }
      />
      <AdminGate>
        {() =>
          news.isPending ? (
            <Loading />
          ) : news.isError ? (
            <ErrorState error={news.error} onRetry={() => news.refetch()} />
          ) : news.data.length === 0 ? (
            <EmptyState Icon={NewspaperIcon} title="Henüz haber yok" action="İlk haberi yazın" onAction={() => router.push('/yonetim/haber')} />
          ) : (
            <View className="gap-2">
              {news.data.map((a) => (
                <ArticleRow key={a.id} a={a} />
              ))}
              <Text className="mt-2 text-center text-[13px] text-muted-foreground">{news.data.length} haber</Text>
            </View>
          )
        }
      </AdminGate>
    </TabScreen>
  );
}
