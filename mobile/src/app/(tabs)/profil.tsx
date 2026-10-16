import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { SectionTitle, TabTitle } from '@/components/app/headers';
import { Screen } from '@/components/app/screen';
import { SolarIcon } from '@/components/icons/solar-icon';
import type { SolarName } from '@/components/icons/solar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { cropById } from '@/domain/crops';
import { PLANS, yearlyMonthlyPrice } from '@/domain/plans';
import { cn } from '@/lib/utils';
import { useAppStore, type Settings } from '@/state/store';

const SETTINGS: { key: keyof Settings; icon: SolarName; title: string; detail: string }[] = [
  { key: 'offline', icon: 'cloud-cross-linear', title: 'Çevrimdışı mod', detail: 'İnternet yokken tara, bağlanınca gönder' },
  { key: 'notifications', icon: 'bell-linear', title: 'Bildirimler', detail: 'Don, hastalık ve iş hatırlatmaları' },
  { key: 'voiceAnswers', icon: 'volume-loud-linear', title: 'Cevapları sesli oku', detail: 'Sesli asistan cevabı yüksek sesle okur' },
];

export default function Profile() {
  const profile = useAppStore((s) => s.profile);
  const settings = useAppStore((s) => s.settings);
  const setSetting = useAppStore((s) => s.setSetting);
  const scans = useAppStore((s) => s.scans);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const [yearly, setYearly] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <Screen tabs>
      <TabTitle title="Profil" />
      <View className="mx-4 flex-row items-center gap-4 rounded-[28px] bg-card p-5">
        <Image source={require('@/assets/brand/logo.webp')} style={{ width: 64, height: 64 }} contentFit="contain" />
        <View className="flex-1">
          <Text className="font-heading text-2xl">{profile.name}</Text>
          <Text className="text-lg text-muted-foreground">
            {[profile.district, profile.province].filter(Boolean).join(', ')}
          </Text>
          <Text className="text-base text-muted-foreground">{profile.crops.map((c) => cropById(c).name).join(' · ')}</Text>
        </View>
      </View>

      <SectionTitle>Planlar</SectionTitle>
      <View className="mx-4 flex-row rounded-full bg-secondary p-1" accessibilityRole="radiogroup">
        {[false, true].map((y) => (
          <Pressable
            key={String(y)}
            accessibilityRole="radio"
            accessibilityState={{ checked: yearly === y }}
            onPress={() => setYearly(y)}
            className={cn('h-12 flex-1 items-center justify-center rounded-full', yearly === y && 'bg-foreground')}>
            <Text className={cn('font-sans-bold text-base', yearly === y && 'text-background')}>{y ? 'Yıllık (%20 indirim)' : 'Aylık'}</Text>
          </Pressable>
        ))}
      </View>
      <View className="gap-3 px-4">
        {PLANS.map((p) => (
          <View key={p.name} className={cn('rounded-[28px] p-5', p.popular ? 'border-2 border-accent bg-popover' : 'bg-card')}>
            <View className="flex-row items-center justify-between">
              <Text className="font-heading text-2xl">{p.name}</Text>
              {p.popular ? (
                <Badge className="rounded-full border-0 bg-accent px-3 py-1">
                  <Text className="text-accent-foreground">En popüler</Text>
                </Badge>
              ) : null}
            </View>
            <Text className="text-base text-muted-foreground">{p.audience}</Text>
            <Text className="mt-2 font-heading text-3xl">
              {p.price === null ? 'Size özel' : `₺${yearly ? yearlyMonthlyPrice(p.price) : p.price}`}
              {p.price !== null ? <Text className="text-lg text-muted-foreground"> / ay</Text> : null}
            </Text>
            <View className="mt-3 gap-2">
              {p.features.map((f) => (
                <View key={f} className="flex-row items-start gap-2">
                  <SolarIcon name="check-circle-linear" size={22} color="olive" />
                  <Text className="flex-1 text-base">{f}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
        <Text className="text-center text-base text-muted-foreground">Prototip: ödeme bu sürümde açık değil. 7 gün ücretsiz deneme.</Text>
      </View>

      <SectionTitle>Ayarlar</SectionTitle>
      <View className="mx-4 rounded-[28px] bg-card px-5">
        {SETTINGS.map((s, i) => (
          <View key={s.key}>
            {i > 0 ? <Separator className="bg-border" /> : null}
            <View className="flex-row items-center gap-4 py-4">
              <SolarIcon name={s.icon} size={28} />
              <View className="flex-1">
                <Text nativeID={`ayar-${s.key}`} className="font-sans-bold text-lg">
                  {s.title}
                </Text>
                <Text className="text-base text-muted-foreground">{s.detail}</Text>
              </View>
              <Switch checked={settings[s.key]} onCheckedChange={(v) => setSetting(s.key, v)} aria-labelledby={`ayar-${s.key}`} className={settings[s.key] ? 'bg-olive' : 'bg-secondary'} />
            </View>
          </View>
        ))}
      </View>

      <View className="mx-4 rounded-[28px] bg-card px-5">
        <LinkRow icon="history-linear" title="Tarama geçmişi" detail={`${scans.length} tarama`} onPress={() => router.push('/gecmis')} />
        <Separator className="bg-border" />
        <LinkRow icon="info-circle-linear" title="Görsel kaynakları" detail="Fotoğraf ve ikon lisansları" onPress={() => router.push('/kaynaklar')} />
        <Separator className="bg-border" />
        <LinkRow icon="restart-linear" title="Demoyu sıfırla" detail="Baştan başla, örnek verilere dön" onPress={() => setResetOpen(true)} />
      </View>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="mx-4 rounded-[28px] bg-background">
          <DialogHeader>
            <DialogTitle>Demoyu sıfırla?</DialogTitle>
            <DialogDescription className="text-lg leading-7">Taramaların ve eklediğin işler silinir, karşılama ekranına dönersin.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              variant="destructive"
              onPress={() => {
                setResetOpen(false);
                resetDemo();
                router.replace('/hos-geldin');
              }}>
              <Text>Sıfırla</Text>
            </Button>
            <Button variant="outline" onPress={() => setResetOpen(false)}>
              <Text>Vazgeç</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Screen>
  );
}

function LinkRow({ icon, title, detail, onPress }: { icon: SolarName; title: string; detail: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="flex-row items-center gap-4 py-4 active:opacity-70">
      <SolarIcon name={icon} size={28} />
      <View className="flex-1">
        <Text className="font-sans-bold text-lg">{title}</Text>
        <Text className="text-base text-muted-foreground">{detail}</Text>
      </View>
      <SolarIcon name="alt-arrow-right-linear" size={24} color="mutedForeground" />
    </Pressable>
  );
}
