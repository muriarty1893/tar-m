import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';

import { uploadPhoto } from '@/api/upload';
import { CameraIcon, ImagesIcon, WarningCircleIcon, XIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { MAX_FORUM_PHOTOS } from '@/domain/forum';
import { redirectForError } from '@/lib/api-errors';
import { COLORS } from '@/theme/tokens';

type Item = { key: string; uri: string; url?: string; failed?: boolean };

/** Photos being added to a post: uploaded as they're picked (shrunk first), at most 4. */
export function usePhotoUploads() {
  const [items, setItems] = useState<Item[]>([]);

  const add = async (source: 'library' | 'camera') => {
    try {
      const left = MAX_FORUM_PHOTOS - items.length;
      if (left <= 0) return;
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert('Kamera izni gerekiyor', 'Fotoğraf çekmek için Ayarlar’dan kameraya izin verin ya da galeriden seçin.');
      }
      const res =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsMultipleSelection: true, selectionLimit: left });
      if (res.canceled) return;
      for (const asset of res.assets.slice(0, left)) {
        const key = `${asset.uri}-${Math.random()}`;
        setItems((ps) => [...ps, { key, uri: asset.uri }]);
        uploadPhoto(asset, 'forum').then(
          (url) => setItems((ps) => ps.map((p) => (p.key === key ? { ...p, url } : p))),
          (err) => {
            setItems((ps) => ps.map((p) => (p.key === key ? { ...p, failed: true } : p)));
            redirectForError(err);
          }
        );
      }
    } catch {
      Alert.alert('Fotoğraf açılamadı', 'Galeri ya da kamera açılamadı. Fotoğrafsız da gönderebilirsiniz.');
    }
  };

  return {
    items,
    add,
    remove: (key: string) => setItems((ps) => ps.filter((p) => p.key !== key)),
    reset: () => setItems([]),
    urls: items.filter((p) => p.url).map((p) => p.url!),
    uploading: items.some((p) => !p.url && !p.failed),
    full: items.length >= MAX_FORUM_PHOTOS,
  };
}

export type PhotoUploads = ReturnType<typeof usePhotoUploads>;

/** The picked photos' thumbnails, each removable (nothing while there are none). */
export function PhotoThumbs({ uploads }: { uploads: PhotoUploads }) {
  if (!uploads.items.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2" accessibilityLabel="Eklenen fotoğraflar">
      {uploads.items.map((p, i) => (
        <View key={p.key} className="size-20 overflow-hidden rounded-[14px] border border-border bg-muted">
          <Image source={p.uri} style={{ width: 80, height: 80, opacity: p.url ? 1 : 0.55 }} contentFit="cover" accessibilityIgnoresInvertColors />
          {!p.url && !p.failed ? (
            <View className="absolute inset-0 items-center justify-center" accessibilityLabel={`Fotoğraf ${i + 1} yükleniyor`}>
              <ActivityIndicator color={COLORS.white} />
            </View>
          ) : null}
          {p.failed ? (
            <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-1 bg-destructive px-1 py-0.5" role="alert">
              <WarningCircleIcon size={12} weight="fill" color={COLORS.white} />
              <Text className="font-sans-semibold text-[10.5px] text-white">Yüklenemedi</Text>
            </View>
          ) : null}
          <Pressable accessibilityRole="button" accessibilityLabel={`Fotoğraf ${i + 1}: kaldır`} hitSlop={6} onPress={() => uploads.remove(p.key)} className="absolute right-1 top-1 size-7 items-center justify-center rounded-full bg-black/65">
            <XIcon size={14} weight="bold" color={COLORS.white} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

/** "Galeri" and "Kamera" buttons (hidden once there are 4 photos). `compact`: icons only, for the reply bar. */
export function PhotoButtons({ uploads, compact }: { uploads: PhotoUploads; compact?: boolean }) {
  if (uploads.full) return null;
  const count = `${uploads.items.length}/${MAX_FORUM_PHOTOS}`;
  if (compact) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={`Fotoğraf ekle (${count})`} onPress={() => uploads.add('library')} className="size-12 items-center justify-center rounded-full active:bg-secondary">
        <ImagesIcon size={24} weight="duotone" color={COLORS.primary} />
      </Pressable>
    );
  }
  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <Pressable accessibilityRole="button" onPress={() => uploads.add('library')} className="min-h-12 flex-row items-center gap-2 rounded-full border border-border bg-card px-4 active:bg-secondary">
        <ImagesIcon size={20} weight="duotone" color={COLORS.primary} />
        <Text className="font-sans-semibold text-[15px]">Galeriden seç</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => uploads.add('camera')} className="min-h-12 flex-row items-center gap-2 rounded-full border border-border bg-card px-4 active:bg-secondary">
        <CameraIcon size={20} weight="duotone" color={COLORS.primary} />
        <Text className="font-sans-semibold text-[15px]">Fotoğraf çek</Text>
      </Pressable>
      <Text className="text-[13px] text-muted-foreground">{count}</Text>
    </View>
  );
}
