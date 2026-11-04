import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Fragment, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import { keys, queryClient, refresh, useSignedIn, useThread } from '@/api/queries';
import type { ChatMessage, Thread } from '@/api/types';
import { ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import { ArrowLeftIcon, CheckCircleIcon, ChecksIcon, PaperPlaneRightIcon, TagIcon } from '@/components/icons';
import { OfferDialog } from '@/components/market/offer-dialog';
import { Avatar } from '@/components/market/parts';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { OFFER_STATUS, QUICK_REPLIES } from '@/domain/chat';
import { addDays, clock, dayKey, dayTitle } from '@/domain/format';
import { formatPrice } from '@/domain/market';
import { errorMessage, redirectForError } from '@/lib/api-errors';
import { cn } from '@/lib/utils';
import { COLORS, SHADOW } from '@/theme/tokens';

const dayLabel = (d: Date, now: Date) => (dayKey(d) === dayKey(now) ? 'Bugün' : dayKey(d) === dayKey(addDays(now, -1)) ? 'Dün' : dayTitle(d));
const back = () => (router.canGoBack() ? router.back() : router.replace({ pathname: '/pazar', params: { bolum: 'mesajlar' } }));

/** A listing chat with a real person: the listing pinned on top, messages and offers, quick replies. */
export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loaded, signedIn } = useSignedIn();
  const thread = useThread(id);

  // Opening the chat (and each new message in it) marks it read: the badge and the inbox follow.
  const seenCount = thread.data?.messages.length;
  useEffect(() => {
    if (seenCount !== undefined) void refresh(keys.unread, keys.inbox);
  }, [seenCount]);

  if (!loaded || (signedIn && thread.isPending)) {
    return (
      <View className="flex-1 justify-center bg-background" style={{ paddingTop: insets.top }}>
        <Loading label="Sohbet yükleniyor…" />
      </View>
    );
  }
  if (!signedIn || thread.isError || !thread.data) {
    return (
      <View className="flex-1 justify-center gap-3 bg-background px-6" style={{ paddingTop: insets.top }}>
        {!signedIn ? <SignInPrompt title="Mesajlar için giriş yapın" body="Bu sohbeti görmek için giriş yapın." /> : <ErrorState error={thread.error} onRetry={() => thread.refetch()} />}
        <Button variant="outline" className="h-12 rounded-full bg-card" onPress={back}>
          <Text>Mesajlara dön</Text>
        </Button>
      </View>
    );
  }
  return <Chat chat={thread.data} />;
}

function Chat({ chat }: { chat: Thread }) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offering, setOffering] = useState<null | { counter?: ChatMessage }>(null);
  const list = useRef<ScrollView>(null);
  const count = chat.messages.length;

  useEffect(() => {
    const t = setTimeout(() => list.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [count]);

  const buyer = chat.role === 'buyer';
  const active = chat.listing.status === 'active';
  const agreed = chat.messages.some((m) => m.offer?.status === 'accepted');
  const canOffer = buyer && active && !agreed;
  const sentTexts = new Set(chat.messages.filter((m) => m.mine).map((m) => m.body));
  const quick = chat.listing.status === 'removed' ? [] : QUICK_REPLIES[chat.role].filter((q) => !sentTexts.has(q));
  const now = new Date();
  const lastMine = [...chat.messages].reverse().find((m) => m.mine);
  const seen = !!lastMine && chat.peerReadAt > lastMine.at;

  /** Sends, then shows the chat as the server has it. Resolves to an error message, or null. */
  const post = async (path: string, body: object): Promise<string | null> => {
    setError(null);
    try {
      const { thread } = await api<{ thread: Thread }>(path, { method: 'POST', body });
      queryClient.setQueryData(keys.thread(chat.id), { thread });
      void refresh(keys.inbox);
      return null;
    } catch (err) {
      if (redirectForError(err)) return null;
      return errorMessage(err);
    }
  };

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    const failed = await post(`/mesajlar/${chat.id}`, { text: t });
    setSending(false);
    if (failed) setError(failed);
    else setDraft('');
  };

  const answer = async (m: ChatMessage, response: 'accept' | 'reject') => {
    const failed = await post(`/teklifler/${m.id}`, { response });
    if (failed) setError(failed);
  };

  const offer = async (amount: string) => {
    const failed = offering?.counter ? await post(`/teklifler/${offering.counter.id}`, { response: 'counter', counter: amount }) : await post(`/mesajlar/${chat.id}`, { offer: amount });
    if (!failed) setOffering(null);
    return failed;
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="gap-3 border-b border-border bg-background px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center gap-3">
          <Pressable accessibilityRole="button" accessibilityLabel="Mesajlara dön" onPress={back} className="size-12 items-center justify-center rounded-full bg-card active:bg-secondary" style={{ boxShadow: SHADOW.soft }}>
            <ArrowLeftIcon size={21} weight="bold" color={COLORS.foreground} />
          </Pressable>
          <Avatar name={chat.peer.name} size={42} />
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="font-heading text-[17px]">
              {chat.peer.name}
            </Text>
            <Text numberOfLines={1} className="text-[13px] text-muted-foreground">
              {buyer ? 'Satıcı' : 'Alıcı'}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3 rounded-[16px] border border-border bg-card p-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`İlanı aç: ${chat.listing.title}, ${formatPrice(chat.listing.price)}`}
            onPress={() => router.push({ pathname: '/ilan/[id]', params: { id: chat.listing.id } })}
            className="min-w-0 flex-1 flex-row items-center gap-3 active:opacity-70">
            <Image source={{ uri: chat.listing.photo }} style={{ width: 46, height: 46, borderRadius: 12 }} contentFit="cover" />
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="font-sans-semibold text-[14px]">
                {chat.listing.title}
              </Text>
              <Text numberOfLines={1} className="font-heading text-[15px]">
                {formatPrice(chat.listing.price)}
                {chat.listing.unit ? <Text className="font-sans text-[12.5px] text-muted-foreground"> / {chat.listing.unit}</Text> : null}
              </Text>
            </View>
          </Pressable>
          {!active ? (
            <View className="rounded-full bg-muted px-2.5 py-1">
              <Text className="font-sans-bold text-[12px] text-muted-foreground">{chat.listing.status === 'sold' ? 'SATILDI' : 'KALDIRILDI'}</Text>
            </View>
          ) : canOffer ? (
            <Button variant="outline" size="sm" className="h-11 rounded-full border-primary/50" onPress={() => setOffering({})}>
              <Text className="text-[14px] text-primary">Teklif ver</Text>
            </Button>
          ) : null}
        </View>
      </View>

      <ScrollView ref={list} className="flex-1" contentContainerClassName="gap-2 px-4 py-4" accessibilityLabel="Sohbet">
        {chat.messages.map((m, i) => {
          const at = new Date(m.at);
          const newDay = i === 0 || dayKey(new Date(chat.messages[i - 1].at)) !== dayKey(at);
          return (
            <Fragment key={m.id}>
              {newDay ? (
                <View className="my-1 items-center">
                  <View className="rounded-full bg-muted px-3 py-1">
                    <Text className="font-sans-semibold text-[12px] text-muted-foreground">{dayLabel(at, now)}</Text>
                  </View>
                </View>
              ) : null}
              {m.offer ? <OfferBubble m={m} buyer={buyer} canAnswer={chat.listing.status !== 'removed'} onAnswer={answer} onCounter={() => setOffering({ counter: m })} /> : <TextBubble m={m} />}
            </Fragment>
          );
        })}
        {seen ? <Text className="self-end pr-1 text-[12px] text-muted-foreground">Görüldü</Text> : null}
        {count === 0 ? (
          <Text className="mt-6 text-center text-[14px] leading-5 text-muted-foreground">
            {chat.peer.name} ile “{chat.listing.title}” hakkında konuşun. Hazır sorulardan birini seçebilirsiniz.
          </Text>
        ) : null}
      </ScrollView>

      <View className="gap-2.5 border-t border-border bg-card px-3 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        {error ? (
          <Text role="alert" className="px-1 text-[13.5px] text-destructive">
            {error}
          </Text>
        ) : null}
        {chat.listing.status === 'removed' ? (
          <Text className="px-1 py-2 text-center text-[14px] text-muted-foreground">İlan kaldırıldığı için bu sohbete yazılamıyor.</Text>
        ) : (
          <>
            {quick.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-3" contentContainerClassName="gap-2 px-3" keyboardShouldPersistTaps="handled">
                {quick.map((q) => (
                  <Pressable key={q} accessibilityRole="button" onPress={() => send(q)} disabled={sending} className={cn('min-h-11 justify-center rounded-full border border-primary/40 bg-secondary px-3.5 active:bg-primary/20', sending && 'opacity-50')}>
                    <Text className="font-sans-semibold text-[14px] text-primary">{q}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
            <View className="flex-row items-center gap-2">
              {canOffer ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Teklif ver" onPress={() => setOffering({})} className="size-12 items-center justify-center rounded-full border border-primary/40 bg-secondary active:bg-primary/20">
                  <TagIcon size={22} weight="duotone" color={COLORS.primary} />
                </Pressable>
              ) : null}
              <TextInput
                value={draft}
                onChangeText={(t) => {
                  setDraft(t);
                  setError(null);
                }}
                placeholder="Mesaj yazın…"
                placeholderTextColorClassName="accent-muted-foreground"
                onSubmitEditing={() => send(draft)}
                returnKeyType="send"
                maxLength={1000}
                accessibilityLabel="Mesaj yazın"
                className="min-h-12 flex-1 rounded-full border border-input bg-background px-4 font-sans text-[15px] text-foreground"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Gönder"
                accessibilityState={{ disabled: !draft.trim() || sending, busy: sending }}
                disabled={!draft.trim() || sending}
                onPress={() => send(draft)}
                className={cn('size-12 items-center justify-center rounded-full bg-primary', (!draft.trim() || sending) && 'opacity-40')}>
                {sending ? <ActivityIndicator color={COLORS.white} /> : <PaperPlaneRightIcon size={21} weight="fill" color={COLORS.white} />}
              </Pressable>
            </View>
          </>
        )}
      </View>

      <OfferDialog
        price={chat.listing.price}
        unit={chat.listing.unit}
        open={!!offering}
        title={offering?.counter ? 'Karşı teklif ver' : 'Teklif ver'}
        description={offering?.counter ? `Gelen teklif ${formatPrice(offering.counter.offer!.amount)}. İlan fiyatı ${formatPrice(chat.listing.price)}.` : undefined}
        belowPrice={!offering?.counter}
        onClose={() => setOffering(null)}
        onOffer={offer}
      />
    </KeyboardAvoidingView>
  );
}

function TextBubble({ m }: { m: ChatMessage }) {
  const time = clock(new Date(m.at));
  return (
    <View className={cn('max-w-[84%] rounded-[20px] px-3.5 pb-1.5 pt-2.5', m.mine ? 'self-end rounded-br-md bg-primary' : 'self-start rounded-bl-md border border-border bg-card')} accessible accessibilityLabel={`${m.mine ? 'Siz' : 'Karşı taraf'}, ${time}: ${m.body}`}>
      <Text className={cn('text-[15px] leading-[21px]', m.mine && 'text-primary-foreground')}>{m.body}</Text>
      <View className="mt-0.5 flex-row items-center justify-end gap-1">
        <Text className={cn('text-[11.5px]', m.mine ? 'text-white/80' : 'text-muted-foreground')}>{time}</Text>
        {m.mine ? <ChecksIcon size={14} weight="bold" color="rgba(255,255,255,0.85)" /> : null}
      </View>
    </View>
  );
}

function OfferBubble({ m, buyer, canAnswer, onAnswer, onCounter }: { m: ChatMessage; buyer: boolean; canAnswer: boolean; onAnswer: (m: ChatMessage, r: 'accept' | 'reject') => Promise<void>; onCounter: () => void }) {
  const [busy, setBusy] = useState<'accept' | 'reject' | null>(null);
  const offer = m.offer!;
  const label = m.mine ? 'TEKLİFİNİZ' : buyer ? 'KARŞI TEKLİF' : 'TEKLİF';
  const spoken = m.mine ? 'Teklifiniz' : buyer ? 'Karşı teklif' : 'Teklif';
  const status = offer.status === 'accepted' ? 'Anlaştınız' : OFFER_STATUS[offer.status][m.mine ? 'mine' : 'theirs'];
  const accepted = offer.status === 'accepted';
  const open = !m.mine && offer.status === 'pending' && canAnswer;
  const run = async (r: 'accept' | 'reject') => {
    setBusy(r);
    await onAnswer(m, r);
    setBusy(null);
  };
  return (
    <View
      className={cn('w-[80%] gap-2 rounded-[20px] border-2 p-3.5', m.mine ? 'self-end rounded-br-md' : 'self-start rounded-bl-md', accepted ? 'border-primary bg-secondary' : 'border-gold/50 bg-gold-soft')}
      accessible={!open}
      accessibilityLabel={`${spoken}: ${formatPrice(offer.amount)}. ${status}`}>
      <View className="flex-row items-center gap-1.5">
        <TagIcon size={16} weight="duotone" color={accepted ? COLORS.primary : COLORS.gold} />
        <Text className={cn('font-sans-bold text-[12px] tracking-[1.4px]', accepted ? 'text-primary' : 'text-gold')}>{label}</Text>
        <Text className="ml-auto text-[11.5px] text-muted-foreground">{clock(new Date(m.at))}</Text>
      </View>
      <Text className="font-heading text-[24px] leading-8">{formatPrice(offer.amount)}</Text>
      {open ? (
        <View className="gap-2">
          <View className="flex-row gap-2">
            <Button variant="outline" size="sm" className="h-11 flex-1 rounded-full bg-card" disabled={!!busy} onPress={() => run('reject')}>
              {busy === 'reject' ? <ActivityIndicator color={COLORS.foreground} /> : null}
              <Text className="text-[14px]">Reddet</Text>
            </Button>
            <Button size="sm" className="h-11 flex-1 rounded-full" disabled={!!busy} onPress={() => run('accept')}>
              {busy === 'accept' ? <ActivityIndicator color={COLORS.white} /> : null}
              <Text className="text-[14px]">Kabul et</Text>
            </Button>
          </View>
          <Button variant="ghost" size="sm" className="h-11 rounded-full" disabled={!!busy} onPress={onCounter}>
            <Text className="text-[14px] text-primary">Karşı teklif ver</Text>
          </Button>
        </View>
      ) : (
        <View className="flex-row items-center gap-1.5">
          {accepted ? <CheckCircleIcon size={16} weight="fill" color={COLORS.primary} /> : null}
          <Text className={cn('font-sans-semibold text-[13px]', accepted ? 'text-primary' : 'text-muted-foreground')}>{status}</Text>
        </View>
      )}
    </View>
  );
}
