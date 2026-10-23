import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Fragment, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowLeftIcon, CheckCircleIcon, ChecksIcon, PaperPlaneRightIcon, TagIcon } from '@/components/icons';
import { OfferDialog } from '@/components/market/offer-dialog';
import { Avatar } from '@/components/market/parts';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { QUICK_REPLIES, type Conversation, type Message } from '@/domain/chat';
import { addDays, clock, dayKey, dayTitle } from '@/domain/format';
import { formatPrice, listingById, sellerById, type Listing } from '@/domain/market';
import { cn } from '@/lib/utils';
import { scheduleReply } from '@/state/replies';
import { useAppStore } from '@/state/store';
import { COLORS, SHADOW } from '@/theme/tokens';

const dayLabel = (d: Date, now: Date) => (dayKey(d) === dayKey(now) ? 'Bugün' : dayKey(d) === dayKey(addDays(now, -1)) ? 'Dün' : dayTitle(d));

/** A listing chat: the listing pinned on top, messages and offers, quick replies, and the other side's scripted answers. */
export default function Chat() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chat = useAppStore((s) => s.conversations.find((c) => c.id === id));
  const myListings = useAppStore((s) => s.myListings);
  const sold = useAppStore((s) => (chat ? s.listingStatus[chat.listingId] : undefined));
  const sendText = useAppStore((s) => s.sendText);
  const sendOffer = useAppStore((s) => s.sendOffer);
  const answerOffer = useAppStore((s) => s.answerOffer);
  const markRead = useAppStore((s) => s.markRead);
  const [draft, setDraft] = useState('');
  const [offering, setOffering] = useState(false);
  const list = useRef<ScrollView>(null);

  const count = chat?.messages.length ?? 0;
  const pending = !!chat?.pending;
  // Read on open and as answers arrive; finish an answer that was due when the app closed.
  useEffect(() => {
    if (!id) return;
    markRead(id);
    if (pending) scheduleReply(id);
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 40);
  }, [id, count, pending, markRead]);

  const listing = chat && listingById(chat.listingId, myListings);
  const peer = chat && sellerById(chat.peerId);
  const back = () => (router.canGoBack() ? router.back() : router.replace({ pathname: '/pazar', params: { bolum: 'mesajlar' } }));
  if (!chat || !listing || !peer) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
        <Text className="font-heading text-[20px]">Sohbet bulunamadı</Text>
        <Button className="rounded-full" onPress={back}>
          <Text>Mesajlara dön</Text>
        </Button>
      </View>
    );
  }

  const buyer = chat.role === 'buyer';
  const agreed = chat.messages.some((m) => m.offer?.status === 'accepted');
  const canOffer = buyer && listing.negotiable && !agreed && sold !== 'sold' && sold !== 'removed';
  const sentTexts = new Set(chat.messages.filter((m) => m.from === 'me').map((m) => m.text));
  const quick = QUICK_REPLIES[chat.role].filter((q) => !sentTexts.has(q));
  const now = new Date();

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    sendText(chat.id, t);
    setDraft('');
    scheduleReply(chat.id);
  };
  const offer = (amount: number) => {
    setOffering(false);
    sendOffer(chat.id, amount);
    scheduleReply(chat.id);
  };
  const answer = (messageId: string, accept: boolean) => {
    answerOffer(chat.id, messageId, accept);
    scheduleReply(chat.id);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="gap-3 border-b border-border bg-background px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center gap-3">
          <Pressable accessibilityRole="button" accessibilityLabel="Mesajlara dön" onPress={back} className="size-11 items-center justify-center rounded-full bg-card active:bg-secondary" style={{ boxShadow: SHADOW.soft }}>
            <ArrowLeftIcon size={21} weight="bold" color={COLORS.foreground} />
          </Pressable>
          <Avatar seller={peer} size={42} />
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="font-heading text-[17px]">
              {peer.name}
            </Text>
            <Text numberOfLines={1} className={cn('text-[13px]', pending ? 'text-primary' : 'text-muted-foreground')} accessibilityLiveRegion="polite">
              {pending ? 'yazıyor…' : buyer ? `Satıcı · genelde ${peer.replies} yanıt verir` : `Alıcı · ${peer.place}`}
            </Text>
          </View>
        </View>
        <ListingStrip listing={listing} sold={sold === 'sold'} canOffer={canOffer} onOffer={() => setOffering(true)} />
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
              {m.offer ? <OfferBubble m={m} chat={chat} onAnswer={answer} /> : <TextBubble m={m} />}
            </Fragment>
          );
        })}
        {count === 0 ? (
          <Text className="mt-6 text-center text-[14px] leading-5 text-muted-foreground">
            {peer.name} ile “{listing.title}” hakkında konuşun. Hazır sorulardan birini seçebilirsiniz.
          </Text>
        ) : null}
        {pending ? (
          <View className="flex-row items-center gap-1 self-start rounded-[20px] rounded-bl-md border border-border bg-card px-3.5 py-3.5" accessibilityLabel={`${peer.name} yazıyor`}>
            {[0, 1, 2].map((d) => (
              <View key={d} className="size-2 rounded-full bg-muted-foreground/60" />
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View className="gap-2.5 border-t border-border bg-card px-3 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        {quick.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-3" contentContainerClassName="gap-2 px-3" keyboardShouldPersistTaps="handled">
            {quick.map((q) => (
              <Pressable key={q} accessibilityRole="button" onPress={() => send(q)} disabled={pending} className={cn('min-h-11 justify-center rounded-full border border-primary/40 bg-secondary px-3.5 active:bg-primary/20', pending && 'opacity-50')}>
                <Text className="font-sans-semibold text-[14px] text-primary">{q}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <View className="flex-row items-center gap-2">
          {canOffer ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Teklif ver" onPress={() => setOffering(true)} className="size-12 items-center justify-center rounded-full border border-primary/40 bg-secondary active:bg-primary/20">
              <TagIcon size={22} weight="duotone" color={COLORS.primary} />
            </Pressable>
          ) : null}
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Mesaj yazın…"
            placeholderTextColorClassName="accent-muted-foreground"
            onSubmitEditing={() => send(draft)}
            returnKeyType="send"
            accessibilityLabel="Mesaj yazın"
            className="min-h-12 flex-1 rounded-full border border-input bg-background px-4 font-sans text-[15px] text-foreground"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Gönder"
            accessibilityState={{ disabled: !draft.trim() }}
            disabled={!draft.trim()}
            onPress={() => send(draft)}
            className={cn('size-12 items-center justify-center rounded-full bg-primary', !draft.trim() && 'opacity-40')}>
            <PaperPlaneRightIcon size={21} weight="fill" color={COLORS.white} />
          </Pressable>
        </View>
      </View>

      <OfferDialog listing={listing} open={offering} onClose={() => setOffering(false)} onOffer={offer} />
    </KeyboardAvoidingView>
  );
}

function ListingStrip({ listing, sold, canOffer, onOffer }: { listing: Listing; sold: boolean; canOffer: boolean; onOffer: () => void }) {
  return (
    <View className="flex-row items-center gap-3 rounded-[16px] border border-border bg-card p-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`İlanı aç: ${listing.title}, ${formatPrice(listing.price)}`}
        onPress={() => router.push({ pathname: '/ilan/[id]', params: { id: listing.id } })}
        className="min-w-0 flex-1 flex-row items-center gap-3 active:opacity-70">
        <Image source={listing.photos[0]} style={{ width: 46, height: 46, borderRadius: 12 }} contentFit="cover" />
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="font-sans-semibold text-[14px]">
            {listing.title}
          </Text>
          <Text numberOfLines={1} className="font-heading text-[15px]">
            {formatPrice(listing.price)}
            {listing.unit ? <Text className="font-sans text-[12.5px] text-muted-foreground"> / {listing.unit}</Text> : null}
          </Text>
        </View>
      </Pressable>
      {sold ? (
        <View className="rounded-full bg-muted px-2.5 py-1">
          <Text className="font-sans-bold text-[12px] text-muted-foreground">SATILDI</Text>
        </View>
      ) : canOffer ? (
        <Button variant="outline" size="sm" className="rounded-full border-primary/50" onPress={onOffer}>
          <Text className="text-[14px] text-primary">Teklif ver</Text>
        </Button>
      ) : null}
    </View>
  );
}

function TextBubble({ m }: { m: Message }) {
  const mine = m.from === 'me';
  const time = clock(new Date(m.at));
  return (
    <View className={cn('max-w-[84%] rounded-[20px] px-3.5 pb-1.5 pt-2.5', mine ? 'self-end rounded-br-md bg-primary' : 'self-start rounded-bl-md border border-border bg-card')} accessible accessibilityLabel={`${mine ? 'Siz' : 'Karşı taraf'}, ${time}: ${m.text}`}>
      <Text className={cn('text-[15px] leading-[21px]', mine && 'text-primary-foreground')}>{m.text}</Text>
      <View className="mt-0.5 flex-row items-center justify-end gap-1">
        <Text className={cn('text-[11.5px]', mine ? 'text-white/80' : 'text-muted-foreground')}>{time}</Text>
        {mine ? <ChecksIcon size={14} weight="bold" color="rgba(255,255,255,0.85)" /> : null}
      </View>
    </View>
  );
}

const STATUS_COPY = {
  pending: { mine: 'Yanıt bekleniyor', theirs: 'Yanıtınızı bekliyor' },
  accepted: { mine: 'Kabul edildi', theirs: 'Kabul ettiniz' },
  rejected: { mine: 'Kabul edilmedi', theirs: 'Reddettiniz' },
  countered: { mine: 'Karşı teklif geldi', theirs: 'Karşı teklif verdiniz' },
};

function OfferBubble({ m, chat, onAnswer }: { m: Message; chat: Conversation; onAnswer: (messageId: string, accept: boolean) => void }) {
  const offer = m.offer!;
  const mine = m.from === 'me';
  const label = mine ? 'TEKLİFİNİZ' : chat.role === 'buyer' ? 'KARŞI TEKLİF' : 'TEKLİF';
  const spoken = mine ? 'Teklifiniz' : chat.role === 'buyer' ? 'Karşı teklif' : 'Teklif';
  const status = STATUS_COPY[offer.status][mine ? 'mine' : 'theirs'];
  const accepted = offer.status === 'accepted';
  const open = !mine && offer.status === 'pending';
  return (
    <View
      className={cn('w-[78%] gap-2 rounded-[20px] border-2 p-3.5', mine ? 'self-end rounded-br-md' : 'self-start rounded-bl-md', accepted ? 'border-primary bg-secondary' : 'border-gold/50 bg-gold-soft')}
      accessible={!open}
      accessibilityLabel={`${spoken}: ${formatPrice(offer.amount)}. ${status}`}>
      <View className="flex-row items-center gap-1.5">
        <TagIcon size={16} weight="duotone" color={accepted ? COLORS.primary : COLORS.gold} />
        <Text className={cn('font-sans-bold text-[12px] tracking-[1.4px]', accepted ? 'text-primary' : 'text-gold')}>{label}</Text>
        <Text className="ml-auto text-[11.5px] text-muted-foreground">{clock(new Date(m.at))}</Text>
      </View>
      <Text className="font-heading text-[24px] leading-8">{formatPrice(offer.amount)}</Text>
      {open ? (
        <View className="flex-row gap-2">
          <Button variant="outline" size="sm" className="flex-1 rounded-full bg-card" onPress={() => onAnswer(m.id, false)}>
            <Text className="text-[14px]">Reddet</Text>
          </Button>
          <Button size="sm" className="flex-1 rounded-full" onPress={() => onAnswer(m.id, true)}>
            <Text className="text-[14px]">Kabul et</Text>
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
