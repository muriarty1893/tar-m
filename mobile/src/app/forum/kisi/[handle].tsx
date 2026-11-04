import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { useForumProfile } from '@/api/queries';
import { BackHeader } from '@/components/app/back-header';
import { TabScreen } from '@/components/app/screen';
import { ErrorState, Loading } from '@/components/app/states';
import { TopicRow } from '@/components/forum/parts';
import { Avatar } from '@/components/market/parts';
import { Text } from '@/components/ui/text';
import { useNow } from '@/hooks/use-now';

const since = (iso: string) => new Date(iso).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

/** @ahmet's forum page (a mention or a name opens it): who they are, how much they wrote, their latest topics. */
export default function ForumPerson() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const q = useForumProfile(handle);
  const now = useNow();
  return (
    <TabScreen>
      <BackHeader title={`@${handle}`} fallback="/forum" />
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <View className="gap-5">
          <View className="flex-row items-center gap-3.5 rounded-[22px] border border-border bg-card p-4">
            <Avatar name={q.data.profile.name} size={60} />
            <View className="min-w-0 flex-1">
              <Text role="heading" className="font-heading text-[22px] leading-7">
                {q.data.profile.name}
              </Text>
              <Text className="text-[15px] text-muted-foreground">@{q.data.profile.handle}</Text>
              <Text className="mt-1 text-[13px] text-muted-foreground">
                {since(q.data.profile.memberSince)} tarihinden beri üye · {q.data.profile.topicCount} konu · {q.data.profile.replyCount} yanıt
              </Text>
            </View>
          </View>
          <View className="gap-2">
            <Text role="heading" className="font-heading text-[18px]">
              Açtığı konular
            </Text>
            {q.data.topics.length ? (
              <View className="overflow-hidden rounded-[18px] border border-border">
                {q.data.topics.map((t) => (
                  <TopicRow key={t.id} topic={t} now={now} excerpt />
                ))}
              </View>
            ) : (
              <Text className="text-[15px] text-muted-foreground">Henüz konu açmadı.</Text>
            )}
          </View>
        </View>
      )}
    </TabScreen>
  );
}
