import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, View } from 'react-native';

import { BackHeader } from '@/components/app/back-header';
import { SectionTitle, TabScreen } from '@/components/app/screen';
import { ArrowSquareOutIcon, ImagesIcon, PackageIcon, TextAaIcon, type PhosphorIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { OTHER_CREDITS, PHOTO_CREDITS, type OtherCredit } from '@/domain/credits';
import { COLORS } from '@/theme/tokens';

// The photos themselves, for thumbnails (Metro needs each require spelled out).
const THUMBS: Record<string, number> = {
  'app/bugday-sari-pas.webp': require('@/assets/images/app/bugday-sari-pas.webp'),
  'app/misir-kuraklik.webp': require('@/assets/images/app/misir-kuraklik.webp'),
  'app/aycicegi-tarlasi.webp': require('@/assets/images/app/aycicegi-tarlasi.webp'),
  'app/domates-mildiyo.webp': require('@/assets/images/app/domates-mildiyo.webp'),
  'app/scan-leaf.webp': require('@/assets/images/app/scan-leaf.webp'),
  'app/hero-field.webp': require('@/assets/images/app/hero-field.webp'),
  'app/tractor-field.webp': require('@/assets/images/app/tractor-field.webp'),
  'app/field-map.webp': require('@/assets/images/app/field-map.webp'),
  'app/harita-uydu.webp': require('@/assets/images/app/harita-uydu.webp'),
  'app/seedlings.webp': require('@/assets/images/app/seedlings.webp'),
  'market/ilan-traktor.webp': require('@/assets/images/market/ilan-traktor.webp'),
  'market/ilan-bicerdover.webp': require('@/assets/images/market/ilan-bicerdover.webp'),
  'market/ilan-saman-balya.webp': require('@/assets/images/market/ilan-saman-balya.webp'),
  'market/ilan-domates.webp': require('@/assets/images/market/ilan-domates.webp'),
  'market/ilan-pulverizator.webp': require('@/assets/images/market/ilan-pulverizator.webp'),
  'market/ilan-damla-sulama.webp': require('@/assets/images/market/ilan-damla-sulama.webp'),
  'market/ilan-mibzer.webp': require('@/assets/images/market/ilan-mibzer.webp'),
  'market/ilan-el-aletleri.webp': require('@/assets/images/market/ilan-el-aletleri.webp'),
  'market/ilan-romork.webp': require('@/assets/images/market/ilan-romork.webp'),
  'market/ilan-sirt-pompasi.webp': require('@/assets/images/market/ilan-sirt-pompasi.webp'),
  'market/ilan-motorlu-tirpan.webp': require('@/assets/images/market/ilan-motorlu-tirpan.webp'),
  'market/ilan-bugday.webp': require('@/assets/images/market/ilan-bugday.webp'),
  'market/ilan-bugday-tohumu.webp': require('@/assets/images/market/ilan-bugday-tohumu.webp'),
  'market/ilan-aycicegi-tohumu.webp': require('@/assets/images/market/ilan-aycicegi-tohumu.webp'),
  'market/ilan-nohut.webp': require('@/assets/images/market/ilan-nohut.webp'),
};

const open = (url: string) => void WebBrowser.openBrowserAsync(url).catch(() => undefined);

/** "Görsel kaynakları": who made the photos, components, icons and fonts, as their licences ask. */
export default function Sources() {
  return (
    <TabScreen>
      <BackHeader title="Görsel kaynakları" subtitle="Fotoğraflar, bileşenler ve yazı tipleri" />
      <Text className="text-[14px] leading-5 text-muted-foreground">
        Uygulamadaki fotoğraflar Wikimedia Commons’tan; kırpılmış ve küçültülmüş olarak kullanılıyor. Bir satıra dokunursanız kaynağı tarayıcıda açılır.
      </Text>

      <Section Icon={ImagesIcon} title="Fotoğraflar" />
      <View className="overflow-hidden rounded-[20px] border border-border bg-card">
        {PHOTO_CREDITS.map((c, i) => (
          <Pressable
            key={c.file}
            accessibilityRole="link"
            accessibilityLabel={`${c.label}. ${c.author}, ${c.license}. Kaynağı tarayıcıda açar`}
            onPress={() => open(c.sourceUrl)}
            className={`min-h-[64px] flex-row items-center gap-3 px-3 py-2.5 active:bg-secondary/60 ${i ? 'border-t border-border' : ''}`}>
            <Image source={THUMBS[c.file]} style={{ width: 44, height: 44, borderRadius: 10 }} contentFit="cover" />
            <View className="min-w-0 flex-1">
              <Text numberOfLines={2} className="font-sans-semibold text-[14.5px]">
                {c.label}
              </Text>
              <Text numberOfLines={2} className="text-[12.5px] text-muted-foreground">
                {c.author} · {c.license}
              </Text>
            </View>
            <ArrowSquareOutIcon size={18} weight="bold" color={COLORS.mutedForeground} />
          </Pressable>
        ))}
      </View>

      <Section Icon={PackageIcon} title="Bileşenler" />
      <OtherList items={OTHER_CREDITS.filter((c) => c.group === 'bilesen')} />

      <Section Icon={TextAaIcon} title="İkonlar ve yazı tipleri" />
      <OtherList items={OTHER_CREDITS.filter((c) => c.group === 'ikon-yazi')} />
    </TabScreen>
  );
}

function Section({ Icon, title }: { Icon: PhosphorIcon; title: string }) {
  return (
    <View className="mb-2 mt-5 flex-row items-center gap-2">
      <Icon size={20} weight="duotone" color={COLORS.primary} />
      <SectionTitle>{title}</SectionTitle>
    </View>
  );
}

function OtherList({ items }: { items: OtherCredit[] }) {
  return (
    <View className="overflow-hidden rounded-[20px] border border-border bg-card">
      {items.map((c, i) => (
        <Pressable
          key={c.name}
          accessibilityRole="link"
          accessibilityLabel={`${c.name}${c.license ? `, ${c.license}` : ''}. Kaynağı tarayıcıda açar`}
          onPress={() => open(c.url)}
          className={`min-h-[56px] flex-row items-center gap-3 px-3.5 py-2.5 active:bg-secondary/60 ${i ? 'border-t border-border' : ''}`}>
          <View className="min-w-0 flex-1">
            <Text className="font-sans-semibold text-[14.5px]">{c.name}</Text>
            {c.license ? <Text className="text-[12.5px] text-muted-foreground">{c.license}</Text> : null}
          </View>
          <ArrowSquareOutIcon size={18} weight="bold" color={COLORS.mutedForeground} />
        </Pressable>
      ))}
    </View>
  );
}
