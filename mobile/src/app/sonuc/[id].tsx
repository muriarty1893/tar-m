import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Block } from '@/components/app/block';
import SuccessGaugeDom from '@/components/dom/success-gauge-dom';
import SuggestionsDom from '@/components/dom/suggestions-dom';
import { useDomHeight } from '@/components/dom/use-dom-height';
import { ArrowLeftIcon, CaretRightIcon, ChatCircleDotsIcon, CheckCircleIcon, EyeIcon, FirstAidKitIcon, LightbulbIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { scenarioById } from '@/domain/scenarios';
import { useAppStore } from '@/state/store';
import { COLORS, SHADOW } from '@/theme/tokens';

/** The demo's result: photo header with the diagnosis, harvest gauge, what it sees, tickable suggestions, and the chat. */
export default function Result() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scan = useAppStore((s) => s.scans.find((x) => x.id === id));
  const done = useAppStore((s) => (id ? s.doneSuggestions[id] : undefined)) ?? [];
  const setSuggestion = useAppStore((s) => s.setSuggestion);
  const gauge = useDomHeight(166);
  const list = useDomHeight(150);
  const s = scan ? scenarioById(scan.scenarioId) : undefined;
  if (!scan || !s) return null;

  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const ask = () => router.push({ pathname: '/soru/[id]', params: { id: scan.id } });

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        <View className="h-[300px] overflow-hidden">
          <Image source={scan.photo ? { uri: scan.photo } : s.image} style={{ position: 'absolute', inset: 0 }} contentFit="cover" accessibilityLabel={s.imageAlt} />
          <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.78)']} locations={[0, 0.35, 1]} style={{ position: 'absolute', inset: 0 }} />
          <View className="absolute inset-x-4 flex-row items-center justify-between" style={{ top: insets.top + 8 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Geri" onPress={back} className="size-12 items-center justify-center rounded-full bg-white/95" style={{ boxShadow: SHADOW.soft }}>
              <ArrowLeftIcon size={21} weight="bold" color={COLORS.foreground} />
            </Pressable>
            <View className="flex-row items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5">
              <CheckCircleIcon size={17} weight="fill" color={COLORS.primary} />
              <Text className="font-sans-semibold text-[13.5px] text-primary">Analiz tamamlandı</Text>
            </View>
          </View>
          <View className="absolute inset-x-4 bottom-6">
            <View className="flex-row items-center gap-1.5">
              <FirstAidKitIcon size={17} weight="fill" color={COLORS.white} />
              <Text className="font-sans-bold text-[12.5px] tracking-[1.8px] text-white/90">TEŞHİS</Text>
            </View>
            <Text role="heading" className="mt-1 font-heading text-[21px] leading-7 text-white">
              {s.diagnosis}
            </Text>
          </View>
        </View>

        <View className="-mt-3 gap-2.5 rounded-t-[24px] bg-background px-4 pt-4">
          <SuccessGaugeDom value={s.successRate} onHeight={gauge.onHeight} dom={gauge.dom} />
          <Block Icon={EyeIcon} label="NE GÖRÜYORUM">
            <Text className="text-[15px] leading-6">{s.seen}</Text>
          </Block>
          <Block Icon={LightbulbIcon} label="ÖNERİLER">
            <Text className="text-[13.5px] text-muted-foreground">Yaptıklarınızı işaretleyin.</Text>
            <SuggestionsDom
              suggestions={s.suggestions}
              done={done}
              onToggle={async (i, checked) => setSuggestion(scan.id, i, checked)}
              onHeight={list.onHeight}
              dom={list.dom}
            />
          </Block>
          <Pressable accessibilityRole="button" onPress={ask} className="flex-row items-center gap-3 rounded-[20px] border-2 border-primary/30 bg-secondary p-3.5 active:bg-primary/15">
            <View className="size-10 items-center justify-center rounded-xl bg-primary">
              <ChatCircleDotsIcon size={21} weight="fill" color={COLORS.white} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-heading text-[16px] text-primary">Bu teşhis hakkında soru sorun</Text>
              <Text className="text-[13.5px] text-muted-foreground">Ziraat asistanı yanıtlasın</Text>
            </View>
            <CaretRightIcon size={17} weight="bold" color={COLORS.primary} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Always-visible shortcut to the chat. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Soru sor"
        onPress={ask}
        className="absolute right-4 min-h-12 flex-row items-center gap-1.5 rounded-full bg-primary px-5 active:scale-95"
        style={{ bottom: insets.bottom + 24, boxShadow: SHADOW.lift }}>
        <ChatCircleDotsIcon size={21} weight="fill" color={COLORS.white} />
        <Text className="font-sans-semibold text-[15px] text-primary-foreground">Soru sor</Text>
      </Pressable>
    </View>
  );
}
