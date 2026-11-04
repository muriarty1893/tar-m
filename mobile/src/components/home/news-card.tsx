import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useNews } from '@/api/queries';
import { CaretRightIcon, NewspaperIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/theme/tokens';

/** "HABERLER" on the home screen: the latest headline; opens the news. */
export function NewsCard() {
  const news = useNews();
  const latest = news.data?.[0];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={latest ? `Haberler. Son haber: ${latest.title}` : 'Haberler'}
      onPress={() => router.push('/haberler')}
      className="overflow-hidden rounded-[20px] active:opacity-90">
      <LinearGradient colors={['#059669', '#10b981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 }}>
        <View className="size-11 items-center justify-center rounded-[14px] bg-white/20">
          <NewspaperIcon size={24} weight="duotone" color={COLORS.white} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-sans-bold text-[15px] tracking-[0.6px] text-white">HABERLER</Text>
          <Text numberOfLines={1} className="text-[13.5px] text-white/90">
            {latest?.title ?? (news.isPending ? 'Yükleniyor…' : 'Tarım gündemi ve duyurular')}
          </Text>
        </View>
        <CaretRightIcon size={20} weight="bold" color={COLORS.white} />
      </LinearGradient>
    </Pressable>
  );
}
