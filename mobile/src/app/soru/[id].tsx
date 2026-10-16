import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowLeftIcon, PaperPlaneRightIcon, PlantIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { answerFor, scenarioById } from '@/domain/scenarios';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';
import { COLORS, SHADOW } from '@/theme/tokens';

type Message = { from: 'me' | 'ai'; text: string };

/** "Soru sor", as in the website demo: a scripted chat about the scan, with suggested questions and a text box. */
export default function Ask() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scan = useAppStore((s) => s.scans.find((x) => x.id === id));
  const s = scan ? scenarioById(scan.scenarioId) : undefined;
  const [messages, setMessages] = useState<Message[]>(() => (s ? [{ from: 'ai', text: `Merhaba! "${s.diagnosis}" sonucu hakkında merak ettiklerinizi sorabilirsiniz.` }] : []));
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const list = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 30);
  }, [messages, typing]);

  if (!s) return null;
  const asked = new Set(messages.filter((m) => m.from === 'me').map((m) => m.text));
  const suggestions = s.questions.filter((q) => !asked.has(q.q));

  const ask = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { from: 'me', text: q }]);
    setDraft('');
    setTyping(true);
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, { from: 'ai', text: answerFor(s, q) }]);
      setTyping(false);
    }, 900);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-row items-center gap-3 border-b border-border px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Sonuca dön" onPress={() => router.back()} className="size-12 items-center justify-center rounded-full bg-card active:bg-secondary" style={{ boxShadow: SHADOW.soft }}>
          <ArrowLeftIcon size={21} weight="bold" color={COLORS.foreground} />
        </Pressable>
        <View className="size-11 items-center justify-center rounded-full bg-primary">
          <PlantIcon size={25} weight="duotone" color={COLORS.white} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-heading text-[17px]">Ziraat asistanı</Text>
          <View className="flex-row items-center gap-1">
            <View className="size-1.5 rounded-full bg-primary" />
            <Text numberOfLines={1} className="text-[13px] text-muted-foreground">
              Çevrimiçi · {s.title}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView ref={list} className="flex-1" contentContainerClassName="gap-2.5 px-4 py-4" accessibilityLabel="Sohbet">
        {messages.map((m, i) => (
          <View key={i} className={cn('max-w-[84%] rounded-[20px] px-3.5 py-2.5', m.from === 'me' ? 'self-end rounded-br-md bg-primary' : 'self-start rounded-bl-md border border-border bg-card')}>
            <Text className={cn('text-[15px] leading-[21px]', m.from === 'me' && 'text-primary-foreground')} accessibilityLabel={`${m.from === 'me' ? 'Siz' : 'Asistan'}: ${m.text}`}>
              {m.text}
            </Text>
          </View>
        ))}
        {typing ? (
          <View className="flex-row items-center gap-1 self-start rounded-[20px] rounded-bl-md border border-border bg-card px-3.5 py-3.5" accessibilityLabel="Asistan yazıyor">
            {[0, 1, 2].map((d) => (
              <View key={d} className="size-2 rounded-full bg-muted-foreground/60" />
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View className="gap-2.5 border-t border-border bg-card px-3 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        {suggestions.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-3" contentContainerClassName="gap-2 px-3" keyboardShouldPersistTaps="handled">
            {suggestions.map((q) => (
              <Pressable key={q.q} accessibilityRole="button" onPress={() => ask(q.q)} className="rounded-full border border-primary/40 bg-secondary px-3.5 py-2.5 active:bg-primary">
                <Text className="font-sans-semibold text-[14px] text-primary">{q.q}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <View className="flex-row items-center gap-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Sorunuzu yazın…"
            placeholderTextColorClassName="accent-muted-foreground"
            onSubmitEditing={() => ask(draft)}
            returnKeyType="send"
            accessibilityLabel="Sorunuzu yazın"
            className="min-h-12 flex-1 rounded-full border border-input bg-background px-4 font-sans text-[15px] text-foreground"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Gönder"
            accessibilityState={{ disabled: !draft.trim() || typing }}
            disabled={!draft.trim() || typing}
            onPress={() => ask(draft)}
            className={cn('size-12 items-center justify-center rounded-full bg-primary', (!draft.trim() || typing) && 'opacity-40')}>
            <PaperPlaneRightIcon size={21} weight="fill" color={COLORS.white} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
