import { Image } from 'expo-image';
import { useState } from 'react';
import { FlatList, Modal, Pressable, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { XIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/theme/tokens';

/**
 * A post's photos as on X: one wide, two side by side, three (one tall and two), four in a square.
 * A tap opens them full screen, a swipe apart.
 */
export function PhotoGrid({ photos, label }: { photos: string[]; label: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!photos.length) return null;
  const list = photos.slice(0, 4);
  const n = list.length;
  const tile = (i: number, style: object) => (
    <Pressable key={list[i]} accessibilityRole="button" accessibilityLabel={`${label}: ${n} fotoğraftan ${i + 1}. Büyüt`} onPress={() => setOpen(i)} className="overflow-hidden bg-muted active:opacity-90" style={style}>
      <Image source={list[i]} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={150} accessibilityIgnoresInvertColors />
    </Pressable>
  );
  return (
    <>
      <View className="flex-row gap-1 overflow-hidden rounded-[18px] border border-border" style={{ aspectRatio: n === 1 ? 4 / 3 : 16 / 10 }}>
        {n === 1 ? tile(0, { flex: 1 }) : null}
        {n === 2 ? [tile(0, { flex: 1 }), tile(1, { flex: 1 })] : null}
        {n === 3 ? (
          <>
            {tile(0, { flex: 1 })}
            <View className="flex-1 gap-1">{[tile(1, { flex: 1 }), tile(2, { flex: 1 })]}</View>
          </>
        ) : null}
        {n === 4 ? (
          <>
            <View className="flex-1 gap-1">{[tile(0, { flex: 1 }), tile(2, { flex: 1 })]}</View>
            <View className="flex-1 gap-1">{[tile(1, { flex: 1 }), tile(3, { flex: 1 })]}</View>
          </>
        ) : null}
      </View>
      {open !== null ? <PhotoViewer photos={list} start={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

function PhotoViewer({ photos, start, onClose }: { photos: string[]; start: number; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(start);
  return (
    <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 bg-black">
        <FlatList
          data={photos}
          keyExtractor={(p) => p}
          horizontal
          pagingEnabled
          initialScrollIndex={start}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <Image source={item} style={{ width, height }} contentFit="contain" accessibilityIgnoresInvertColors />}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          onPress={onClose}
          className="absolute right-4 size-12 items-center justify-center rounded-full bg-black/60 active:bg-black/80"
          style={{ top: insets.top + 8 }}>
          <XIcon size={24} weight="bold" color={COLORS.white} />
        </Pressable>
        {photos.length > 1 ? (
          <View className="absolute self-center rounded-full bg-black/60 px-3 py-1" style={{ bottom: insets.bottom + 16 }} accessibilityLiveRegion="polite">
            <Text className="font-sans-semibold text-[14px] text-white">
              {index + 1} / {photos.length}
            </Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
