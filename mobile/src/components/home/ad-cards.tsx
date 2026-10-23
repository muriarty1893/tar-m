import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ArrowRightIcon, ArrowSquareOutIcon, DropIcon, MegaphoneIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { AD_INFO, SPONSOR } from '@/domain/ads';
import { COLORS, SHADOW } from '@/theme/tokens';

type Info = keyof typeof AD_INFO;

/** The sponsor banner and the "advertise here" box at the top of home, each explaining itself when tapped. */
export function AdCards() {
  const [info, setInfo] = useState<Info | null>(null);
  return (
    <View className="gap-3">
      <SponsorBanner onPress={() => setInfo('sponsor')} />
      <AdvertiseBox onPress={() => setInfo('advertise')} />
      <Dialog open={!!info} onOpenChange={(o) => !o && setInfo(null)}>
        <DialogContent className="mx-4 rounded-[24px] border-border bg-card">
          {info ? (
            <DialogHeader>
              <DialogTitle className="font-heading text-[20px]">{AD_INFO[info].title}</DialogTitle>
              <DialogDescription className="font-sans text-[14.5px] leading-5 text-muted-foreground">{AD_INFO[info].text}</DialogDescription>
            </DialogHeader>
          ) : null}
          <DialogFooter>
            <Button className="rounded-full" onPress={() => setInfo(null)}>
              <Text>Tamam</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}

function SponsorBanner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${SPONSOR.sample ? 'Örnek sponsor' : 'Sponsor'}: ${SPONSOR.name}. ${SPONSOR.tagline}. İncele`}
      onPress={onPress}
      className="rounded-[24px] active:opacity-90"
      style={{ boxShadow: SHADOW.soft }}>
      <LinearGradient colors={['#1d4ed8', '#0f766e', '#047857']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24 }}>
        <View className="flex-row items-center gap-3 p-3.5">
          <View className="size-12 items-center justify-center rounded-2xl border border-white/30 bg-white/15">
            <DropIcon size={24} weight="duotone" color={COLORS.white} />
          </View>
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text numberOfLines={1} className="shrink font-heading text-[16px] text-white">
                {SPONSOR.name}
              </Text>
              <View className="rounded-full bg-amber-400 px-1.5 py-0.5">
                <Text className="font-sans-bold text-[10px] tracking-wider text-stone-900">{SPONSOR.sample ? 'ÖRNEK' : 'SPONSOR'}</Text>
              </View>
            </View>
            <Text numberOfLines={2} className="text-[13px] leading-[18px] text-white/95">
              {SPONSOR.tagline}
            </Text>
          </View>
          <View className="h-9 flex-row items-center gap-1 rounded-full border border-white/40 bg-white/15 px-3">
            <Text className="font-sans-bold text-[13px] text-white">İncele</Text>
            <ArrowSquareOutIcon size={15} weight="bold" color={COLORS.white} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function AdvertiseBox({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Reklam vermek için dokunun. İletişim"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-[24px] border-2 border-dashed border-amber-300 bg-amber-50 px-3.5 py-3 active:bg-amber-100">
      <View className="size-11 items-center justify-center rounded-2xl bg-amber-100">
        <MegaphoneIcon size={22} weight="duotone" color="#92400e" />
      </View>
      <Text numberOfLines={2} className="min-w-0 flex-1 font-sans-bold text-[15px] leading-5 text-amber-900">
        Reklam Vermek İçin Dokun
      </Text>
      <View className="h-8 flex-row items-center gap-1 rounded-full bg-amber-200 px-2.5">
        <Text className="font-sans-bold text-[12.5px] text-amber-900">İletişim</Text>
        <ArrowRightIcon size={13} weight="bold" color="#78350f" />
      </View>
    </Pressable>
  );
}
