import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Linking, Share, View } from 'react-native';

import { useArticle } from '@/api/queries';
import { BackHeader } from '@/components/app/back-header';
import { TabScreen } from '@/components/app/screen';
import { ErrorState, Loading } from '@/components/app/states';
import ArticleDom from '@/components/dom/article-dom';
import { useDomHeight, useDomStart } from '@/components/dom/use-dom-height';
import { ShareNetworkIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { longDate } from '@/domain/format';
import { siteUrl } from '@/lib/config';
import { COLORS } from '@/theme/tokens';

/** One news article: cover, title, date and its text, as on the website. */
export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = useArticle(slug);
  const body = useDomHeight(200);
  const view = useDomStart();
  const a = article.data;
  const share = () => a && Share.share({ message: `${a.title}: ${siteUrl(`/haberler/${a.slug}`)}` });
  return (
    <TabScreen>
      <BackHeader
        title="Haber"
        fallback="/haberler"
        right={
          a ? (
            <Button variant="outline" size="icon" className="size-12 rounded-full bg-card" accessibilityLabel="Paylaş" onPress={share}>
              <ShareNetworkIcon size={21} weight="bold" color={COLORS.foreground} />
            </Button>
          ) : null
        }
      />
      {article.isPending ? (
        <Loading label="Haber yükleniyor…" />
      ) : article.isError || !a ? (
        <ErrorState error={article.error} onRetry={() => article.refetch()} />
      ) : (
        <View className="gap-3">
          {a.cover ? <Image source={{ uri: siteUrl(a.cover) }} style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 22 }} contentFit="cover" accessible={false} /> : null}
          <Text className="font-sans-semibold text-[13px] text-primary">{longDate(a.date)}</Text>
          <Text role="heading" className="font-heading text-[26px] leading-8">
            {a.title}
          </Text>
          <Text className="text-[16px] leading-6 text-muted-foreground">{a.summary}</Text>
          <View className="mt-1 h-px bg-border" />
          <ArticleDom ref={view} html={a.html} onLink={async (href) => void Linking.openURL(siteUrl(href))} onHeight={body.onHeight} dom={body.dom} />
        </View>
      )}
    </TabScreen>
  );
}
