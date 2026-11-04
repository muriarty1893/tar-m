import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { ForumCategory, TopicCard } from '@/api/types';
import { ChatsTeardropIcon, HeartIcon } from '@/components/icons';
import { Avatar } from '@/components/market/parts';
import { Text } from '@/components/ui/text';
import { CATEGORY_TONES, forumCategoryLabel, repliesLabel } from '@/domain/forum';
import { agoLabel } from '@/domain/when';
import { COLORS } from '@/theme/tokens';

export function CategoryChip({ category }: { category: ForumCategory }) {
  const tone = CATEGORY_TONES[category];
  return (
    <View className="self-start rounded-full px-2 py-0.5" style={{ backgroundColor: tone.bg }}>
      <Text className="font-sans-semibold text-[12px]" style={{ color: tone.fg }}>
        {forumCategoryLabel(category)}
      </Text>
    </View>
  );
}

/** A topic in a list: the author's initials, the title, kind · time · replies · likes, and its first photo. `excerpt` adds the first lines. */
export const TopicRow = memo(function TopicRow({ topic: t, now, excerpt }: { topic: TopicCard; now: Date; excerpt?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t.title}. ${forumCategoryLabel(t.category)}, ${t.authorName}, ${agoLabel(new Date(t.createdAt), now)}. ${repliesLabel(t.replyCount)}${t.likeCount ? `, ${t.likeCount} beğeni` : ''}${t.photoCount ? `, ${t.photoCount} fotoğraf` : ''}`}
      onPress={() => router.push({ pathname: '/forum/[id]', params: { id: t.id } })}
      className="min-h-[64px] flex-row items-center gap-3 border-b border-border bg-card px-3.5 py-3 active:bg-secondary/70">
      <Avatar name={t.authorName} size={38} />
      <View className="min-w-0 flex-1 gap-1">
        <Text numberOfLines={2} className="font-sans-semibold text-[15px] leading-5">
          {t.title}
        </Text>
        {excerpt && t.excerpt ? (
          <Text numberOfLines={2} className="text-[13.5px] leading-[19px] text-muted-foreground">
            {t.excerpt}
          </Text>
        ) : null}
        <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
          <CategoryChip category={t.category} />
          <Text className="text-[12.5px] text-muted-foreground">{agoLabel(new Date(t.createdAt), now)}</Text>
          <View className="flex-row items-center gap-1">
            <ChatsTeardropIcon size={13} weight="duotone" color={COLORS.primary} />
            <Text className="font-sans-semibold text-[12.5px]">{repliesLabel(t.replyCount)}</Text>
          </View>
          {t.likeCount > 0 ? (
            <View className="flex-row items-center gap-1">
              <HeartIcon size={13} weight="fill" color={COLORS.destructive} />
              <Text className="font-sans-semibold text-[12.5px]">{t.likeCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
      {t.photo ? (
        <View className="size-16 overflow-hidden rounded-[12px] bg-muted">
          <Image source={t.photo} style={{ width: 64, height: 64 }} contentFit="cover" transition={150} accessibilityIgnoresInvertColors />
          {t.photoCount > 1 ? (
            <View className="absolute bottom-1 right-1 rounded-full bg-black/65 px-1.5">
              <Text className="font-sans-bold text-[11px] text-white">+{t.photoCount - 1}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
});
