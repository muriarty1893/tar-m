import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/app/headers';
import { SolarIcon } from '@/components/icons/solar-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { SUGGESTED_QUESTIONS, reply, type AssistantAction } from '@/domain/assistant';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';

type Message = { from: 'user' | 'bot'; text: string; action?: AssistantAction };

const ACTIONS: Record<AssistantAction, { label: string; go: () => void }> = {
  scan: { label: 'Yaprağı tara', go: () => router.push('/tara') },
  weather: { label: 'Hava durumuna bak', go: () => router.push('/') },
  prices: { label: 'Hal fiyatlarını aç', go: () => router.push('/hal-fiyatlari') },
  calendar: { label: 'Takvimi aç', go: () => router.push('/takvim') },
};

export default function Assistant() {
  const insets = useSafeAreaInsets();
  const voiceAnswers = useAppStore((s) => s.settings.voiceAnswers);
  const name = useAppStore((s) => s.profile.name);
  const [messages, setMessages] = useState<Message[]>([{ from: 'bot', text: `Merhaba ${name}! Tarlanla ilgili ne sormak istersin?` }]);
  const [draft, setDraft] = useState('');
  const [listening, setListening] = useState(false);
  const asked = useRef(0);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const pulse = useSharedValue(1);

  useEffect(() => () => void Speech.stop(), []);
  useEffect(() => {
    pulse.set(listening ? withRepeat(withTiming(1.18, { duration: 600, reduceMotion: ReduceMotion.System }), -1, true) : withTiming(1));
  }, [listening, pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    const r = reply(question);
    setMessages((m) => [...m, { from: 'user', text: question }, { from: 'bot', text: r.text, action: r.action }]);
    setDraft('');
    if (voiceAnswers) {
      Speech.stop();
      Speech.speak(r.text, { language: 'tr-TR' });
    }
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  };

  // Prototype: speech-to-text needs a native module Expo Go lacks, so releasing the button "hears" a sample question.
  const stopListening = () => {
    if (!listening) return;
    setListening(false);
    ask(SUGGESTED_QUESTIONS[asked.current++ % SUGGESTED_QUESTIONS.length]);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top + 12 }}>
        <BackHeader title="Sesli asistan" subtitle="Sor, Türkçe cevaplasın" />
      </View>
      <ScrollView ref={scroll} className="flex-1" contentContainerClassName="gap-4 px-4 py-5">
        {messages.map((m, i) =>
          m.from === 'user' ? (
            <View key={i} className="max-w-[85%] self-end rounded-[24px] rounded-br-md bg-secondary px-5 py-4">
              <Text className="text-lg leading-7">{m.text}</Text>
            </View>
          ) : (
            <View key={i} className="max-w-[90%] flex-row items-end gap-2 self-start">
              <Image source={require('@/assets/brand/logo.webp')} style={{ width: 36, height: 36 }} contentFit="contain" />
              <View className="flex-1 rounded-[24px] rounded-bl-md bg-card px-5 py-4">
                <Text className="text-lg leading-7">{m.text}</Text>
                {m.action ? (
                  <Button size="sm" variant="accent" className="mt-3 self-start" onPress={ACTIONS[m.action].go}>
                    <Text className="text-base">{ACTIONS[m.action].label}</Text>
                  </Button>
                ) : null}
              </View>
            </View>
          )
        )}
        {messages.length === 1 ? (
          <View className="gap-2">
            <Text className="font-sans-bold text-base text-muted-foreground">Örnek sorular</Text>
            {SUGGESTED_QUESTIONS.map((q) => (
              <Pressable key={q} accessibilityRole="button" onPress={() => ask(q)} className="rounded-2xl border border-border px-4 py-3 active:bg-secondary">
                <Text className="text-lg">{q}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View className="gap-3 border-t border-border bg-background px-4 pt-4" style={{ paddingBottom: insets.bottom + 12 }}>
        <View className="items-center gap-2">
          <Animated.View style={pulseStyle}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={listening ? 'Dinliyorum, bırakınca gönderilir' : 'Konuşmak için basılı tut'}
              onPressIn={() => setListening(true)}
              onPressOut={stopListening}
              className={cn('size-20 items-center justify-center rounded-full', listening ? 'bg-brick' : 'bg-accent')}>
              <SolarIcon name="microphone-3-bold" size={36} color="accentForeground" />
            </Pressable>
          </Animated.View>
          <Text className="text-base text-muted-foreground">{listening ? 'Dinliyorum…' : 'Konuşmak için basılı tut'}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Input value={draft} onChangeText={setDraft} placeholder="Ya da yaz…" className="h-14 flex-1 rounded-full px-5 text-lg" onSubmitEditing={() => ask(draft)} returnKeyType="send" accessibilityLabel="Sorunu yaz" />
          <Button size="icon" className="size-14" onPress={() => ask(draft)} accessibilityLabel="Gönder">
            <SolarIcon name="arrow-right-linear" color="primaryForeground" />
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
