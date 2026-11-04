import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, RefreshControl, View } from 'react-native';

import { useNews } from '@/api/queries';
import { BackHeader } from '@/components/app/back-header';
import { TabScreen } from '@/components/app/screen';
import { EmptyState, ErrorState, Loading } from '@/components/app/states';
import { NewspaperIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { longDate } from '@/domain/format';
import { siteUrl } from '@/lib/config';
import { COLORS, SHADOW } from '@/theme/tokens';

/** "Haberler": the website's published news, newest first (written on the website's or the app's admin panel). */
export default function News() {
  const news = useNews();
  return (
    <TabScreen refreshControl={<RefreshControl refreshing={news.isRefetching} onRefresh={() => news.refetch()} tintColor={COLORS.primary} colors={[COLORS.primary]} />}>
      <BackHeader title="Haberler" subtitle="Tarım gündemi ve Çiftçi Destek’ten duyurular" />
      {news.isPending ? (
        <Loading label="Haberler yükleniyor…" />
      ) : news.isError ? (
        <ErrorState error={news.error} onRetry={() => news.refetch()} />
      ) : news.data.length === 0 ? (
        <EmptyState Icon={NewspaperIcon} title="Henüz haber yok" body="Yeni haberler yayınlandığında burada görünecek." />
      ) : (
        <View className="gap-3">
          {news.data.map((a, i) => (
            <Pressable
              key={a.slug}
              accessibilityRole="button"
              accessibilityLabel={`${a.title}. ${longDate(a.date)}. ${a.summary}`}
              onPress={() => router.push({ pathname: '/haberler/[slug]', params: { slug: a.slug } })}
              className="overflow-hidden rounded-[22px] border border-border bg-card active:opacity-90"
              style={{ boxShadow: SHADOW.soft }}>
              {a.cover ? <Image source={{ uri: siteUrl(a.cover) }} style={{ width: '100%', aspectRatio: i === 0 ? 16 / 9 : 21 / 9 }} contentFit="cover" transition={150} accessible={false} /> : null}
              <View className="gap-1 p-3.5">
                <Text className="text-[12.5px] font-sans-semibold text-primary">{longDate(a.date)}</Text>
                <Text className="font-heading text-[18px] leading-6">{a.title}</Text>
                <Text numberOfLines={3} className="text-[14.5px] leading-[21px] text-muted-foreground">
                  {a.summary}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </TabScreen>
  );
}
