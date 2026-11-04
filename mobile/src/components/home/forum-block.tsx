import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { useSignedIn, useTopics } from '@/api/queries';
import type { ForumQuery, ForumSort } from '@/api/types';
import { TopicRow } from '@/components/forum/parts';
import { CheckIcon, ListIcon, NewspaperIcon, NotePencilIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { FORUM_SORTS } from '@/domain/forum';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

const FOREST = '#063b2f';
const SLATE = '#3b4556';

/**
 * The forum on the home screen: "KONU AÇ", then the latest topics ("Son Açılan", or by the latest
 * reply or the most replies, from the menu), then the way into the whole forum.
 */
export function ForumBlock() {
  const now = useNow();
  const { signedIn } = useSignedIn();
  const [sort, setSort] = useState<ForumSort>('yeni');
  const [choosing, setChoosing] = useState(false);
  const query: ForumQuery = useMemo(() => ({ q: '', kategori: 'tumu', sirala: sort }), [sort]);
  const topics = useTopics(query);
  const list = topics.data?.pages[0]?.items.slice(0, 6) ?? [];
  const label = FORUM_SORTS.find((s) => s.id === sort)?.label ?? 'Son açılan';

  return (
    <View className="gap-3 rounded-[28px] border border-border bg-card p-4">
      <Text role="heading" className="font-sans-bold text-[13.5px] uppercase tracking-[1.2px] text-foreground/80">
        Çiftçi forumu
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Konu aç"
        onPress={() => router.push(signedIn ? '/forum/yeni' : '/giris')}
        className="h-14 flex-row items-center justify-center gap-2 rounded-[16px] active:opacity-90"
        style={{ backgroundColor: FOREST }}>
        <NotePencilIcon size={22} weight="bold" color={COLORS.white} />
        <Text className="font-sans-bold text-[17px] tracking-[0.5px] text-white">KONU AÇ</Text>
      </Pressable>

      <View className="overflow-hidden rounded-[18px] border border-border">
        <View className="h-12 flex-row items-center gap-2 pl-3.5 pr-1" style={{ backgroundColor: SLATE }}>
          <NewspaperIcon size={19} weight="bold" color={COLORS.white} />
          <Text className="flex-1 font-sans-bold text-[15px] text-white">{label}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`Sırala: ${label}`} onPress={() => setChoosing(true)} className="size-11 items-center justify-center rounded-full active:bg-white/15">
            <ListIcon size={20} weight="bold" color={COLORS.white} />
          </Pressable>
        </View>
        {topics.isPending ? (
          <View className="gap-2 bg-card p-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 rounded-[12px] bg-muted" />
            ))}
          </View>
        ) : topics.isError ? (
          <Pressable accessibilityRole="button" onPress={() => topics.refetch()} className="items-center bg-card px-4 py-5 active:bg-secondary">
            <Text className="text-center text-[14px] text-muted-foreground">Konular yüklenemedi. Yeniden denemek için dokunun.</Text>
          </Pressable>
        ) : list.length === 0 ? (
          <View className="items-center bg-card px-4 py-5">
            <Text className="text-center text-[14.5px] leading-5 text-muted-foreground">Henüz konu yok. İlk soruyu siz sorun!</Text>
          </View>
        ) : (
          list.map((t) => <TopicRow key={t.id} topic={t} now={now} />)
        )}
      </View>

      <Button variant="outline" className="h-12 rounded-[14px] bg-card" onPress={() => router.push({ pathname: '/forum', params: sort === 'yeni' ? {} : { sirala: sort } })}>
        <Text className="text-[15px]">Daha Fazla İçerik Göster</Text>
      </Button>

      <Dialog open={choosing} onOpenChange={setChoosing}>
        <DialogContent className="mx-4 rounded-[24px] border-border bg-background">
          <DialogHeader>
            <DialogTitle className="font-heading text-[20px]">Sırala</DialogTitle>
          </DialogHeader>
          <View accessibilityRole="radiogroup" className="gap-1">
            {FORUM_SORTS.map((s) => {
              const on = s.id === sort;
              return (
                <Pressable
                  key={s.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  onPress={() => {
                    setSort(s.id);
                    setChoosing(false);
                  }}
                  className={cn('min-h-14 flex-row items-center justify-between rounded-[14px] px-4', on ? 'bg-secondary' : 'active:bg-secondary')}>
                  <Text className={cn('text-[16px]', on && 'font-sans-bold text-primary')}>{s.label}</Text>
                  {on ? <CheckIcon size={20} weight="bold" color={COLORS.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        </DialogContent>
      </Dialog>
    </View>
  );
}
