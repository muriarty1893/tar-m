import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToggleFavorite } from '@/api/actions';
import { api } from '@/api/client';
import { keys, refresh, useListing, useSignedIn } from '@/api/queries';
import type { ListingDetail } from '@/api/types';
import { Block } from '@/components/app/block';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { ErrorState, Loading } from '@/components/app/states';
import {
  ArrowLeftIcon,
  ChatCircleDotsIcon,
  CheckCircleIcon,
  ClockIcon,
  FlagIcon,
  HandshakeIcon,
  HeartIcon,
  InfoIcon,
  MapPinIcon,
  PackageIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  ShieldCheckIcon,
  StorefrontIcon,
  TagIcon,
  TrashIcon,
} from '@/components/icons';
import { MessageDialog } from '@/components/market/message-dialog';
import { OfferDialog } from '@/components/market/offer-dialog';
import { Avatar, CATEGORY_ICONS } from '@/components/market/parts';
import { ReportDialog } from '@/components/market/report-dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { STOCK_PHOTOS, categoryLabel, conditionLabel, formatPrice, placeLabel } from '@/domain/market';
import { agoLabel } from '@/domain/when';
import { useNow } from '@/hooks/use-now';
import { errorMessage, redirectForError } from '@/lib/api-errors';
import { siteUrl } from '@/lib/config';
import { COLORS, SHADOW } from '@/theme/tokens';

const SAFETY_TIPS = ['Ürünü yerinde görmeden kapora göndermeyin.', 'Araç ve makinelerde ruhsat ve fatura isteyin.', 'Görüşmeleri uygulama içi mesajlarda tutun.'];
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const monthYear = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const back = () => (router.canGoBack() ? router.back() : router.replace('/pazar'));

/** One listing: photos, price, facts, description, the seller, safety tips; message or offer at the bottom. */
export default function ListingScreen() {
  const insets = useSafeAreaInsets();
  const { id, yeni } = useLocalSearchParams<{ id: string; yeni?: string }>();
  const q = useListing(id);

  if (q.isPending) {
    return (
      <View className="flex-1 justify-center bg-background" style={{ paddingTop: insets.top }}>
        <Loading label="İlan yükleniyor…" />
      </View>
    );
  }
  if (q.isError) {
    const gone = (q.error as { status?: number }).status === 404;
    return (
      <View className="flex-1 justify-center gap-3 bg-background px-6" style={{ paddingTop: insets.top }}>
        {gone ? (
          <View className="items-center gap-3">
            <Text className="font-heading text-[20px]">İlan bulunamadı</Text>
            <Text className="text-center text-[15px] text-muted-foreground">Bu ilan kaldırılmış ya da artık yayında değil.</Text>
          </View>
        ) : (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        )}
        <Button className="h-12 rounded-full" onPress={back}>
          <Text>Pazara dön</Text>
        </Button>
      </View>
    );
  }
  return <Listing l={q.data.listing} admin={q.data.admin} isNew={!!yeni} />;
}

function Listing({ l, admin, isNew }: { l: ListingDetail; admin: boolean; isNew: boolean }) {
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { width } = useWindowDimensions();
  const { signedIn } = useSignedIn();
  const toggleFavorite = useToggleFavorite();
  const [dialog, setDialog] = useState<'offer' | 'message' | 'report' | 'remove' | null>(null);
  const [photo, setPhoto] = useState(0);
  const [busy, setBusy] = useState(false);
  const [reported, setReported] = useState(l.reported);

  const sold = l.status === 'sold';
  const removed = l.status === 'removed';
  const CategoryIcon = CATEGORY_ICONS[l.category];
  const condition = conditionLabel(l.condition);
  const photos = l.stockPhoto ? [STOCK_PHOTOS[l.category]] : l.photos.map((uri) => ({ uri }));
  const place = placeLabel(l.province, l.district);

  const needAccount = () => {
    if (signedIn) return false;
    router.push('/giris');
    return true;
  };

  /** Opens the chat (an existing one, or after the first message or offer). */
  const openChat = (conversationId: string) => router.push({ pathname: '/mesajlar/[id]', params: { id: conversationId } });
  const start = async (body: { text?: string; offer?: string }): Promise<string | null> => {
    try {
      const { conversationId } = await api<{ conversationId: string }>(`/ilanlar/${l.id}/mesaj`, { method: 'POST', body });
      setDialog(null);
      void refresh(keys.listing(l.id), keys.inbox);
      openChat(conversationId);
      return null;
    } catch (err) {
      if (redirectForError(err)) {
        setDialog(null);
        return null;
      }
      return errorMessage(err);
    }
  };

  const setStatus = async (status: 'active' | 'sold' | 'removed') => {
    setBusy(true);
    try {
      await api(`/ilanlar/${l.id}`, { method: 'PATCH', body: { status } });
      await refresh(keys.listings, keys.listing(l.id));
      if (status === 'removed') {
        setDialog(null);
        back();
      }
    } catch (err) {
      Alert.alert('Kaydedilemedi', errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const report = async (reason: string, note: string) => {
    try {
      await api(`/ilanlar/${l.id}/sikayet`, { method: 'POST', body: { reason, note } });
      setReported(true);
      setDialog(null);
      return null;
    } catch (err) {
      if (redirectForError(err)) {
        setDialog(null);
        return null;
      }
      return errorMessage(err);
    }
  };

  const share = () => Share.share({ message: `${l.title}: ${formatPrice(l.price)}${l.unit ? ` / ${l.unit}` : ''}, ${place}. Çiftçi Destek Pazar’da: ${siteUrl(`/pazar/ilan/${l.id}`)}` });

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <View className="h-[300px] overflow-hidden bg-muted">
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setPhoto(Math.round(e.nativeEvent.contentOffset.x / width))}>
            {photos.map((src, i) => (
              <Image key={i} source={src} style={{ width, height: 300 }} contentFit="cover" accessibilityLabel={l.stockPhoto ? `${l.title}: temsilî görsel` : `${l.title}, fotoğraf ${i + 1} / ${photos.length}`} />
            ))}
          </ScrollView>
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent']} locations={[0, 0.4]} style={{ position: 'absolute', inset: 0 }} pointerEvents="none" />
          <View className="absolute inset-x-4 flex-row items-center justify-between" style={{ top: insets.top + 8 }}>
            <RoundButton label="Geri" onPress={back}>
              <ArrowLeftIcon size={21} weight="bold" color={COLORS.foreground} />
            </RoundButton>
            <View className="flex-row gap-2">
              <RoundButton label="Paylaş" onPress={share}>
                <ShareNetworkIcon size={21} weight="bold" color={COLORS.foreground} />
              </RoundButton>
              {!l.mine ? (
                <RoundButton label={l.favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'} selected={l.favorite} onPress={() => toggleFavorite(l)}>
                  <HeartIcon size={21} weight={l.favorite ? 'fill' : 'bold'} color={l.favorite ? COLORS.destructive : COLORS.foreground} />
                </RoundButton>
              ) : null}
            </View>
          </View>
          {photos.length > 1 ? (
            <View className="absolute bottom-7 right-4 rounded-full bg-black/55 px-2.5 py-1">
              <Text className="font-sans-semibold text-[12px] text-white">
                {photo + 1} / {photos.length}
              </Text>
            </View>
          ) : null}
          {l.stockPhoto ? (
            <View className="absolute bottom-7 left-4 rounded-full bg-black/55 px-2.5 py-1">
              <Text className="font-sans-medium text-[12px] text-white">Temsilî görsel</Text>
            </View>
          ) : null}
          {sold || removed ? (
            <View className="absolute inset-x-0 bottom-6 items-center" pointerEvents="none">
              <View className="rounded-full bg-black/70 px-4 py-1.5">
                <Text className="font-heading text-[15px] tracking-[2px] text-white">{sold ? 'SATILDI' : 'KALDIRILDI'}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View className="-mt-4 gap-3 rounded-t-[26px] bg-background px-4 pt-4">
          {isNew && l.status === 'active' ? (
            <View className="flex-row items-center gap-2.5 rounded-[16px] bg-secondary px-3.5 py-3" accessibilityRole="alert">
              <CheckCircleIcon size={22} weight="fill" color={COLORS.primary} />
              <Text className="flex-1 font-sans-semibold text-[14.5px] text-primary">İlanınız yayında; sitede de görünüyor. Gelen mesajlar Mesajlar’a düşecek.</Text>
            </View>
          ) : null}

          <View className="flex-row flex-wrap gap-2">
            <Chip>
              <CategoryIcon size={15} weight="duotone" color={COLORS.primary} />
              <Text className="font-sans-semibold text-[12.5px] text-primary">{categoryLabel(l.category)}</Text>
            </Chip>
            {condition ? (
              <Chip>
                <Text className="font-sans-semibold text-[12.5px] text-primary">{condition}</Text>
              </Chip>
            ) : null}
          </View>

          <View>
            <Text role="heading" className="font-heading text-[22px] leading-7">
              {l.title}
            </Text>
            <Text className="mt-1.5 font-heading text-[28px] leading-9">
              {formatPrice(l.price)}
              {l.unit ? <Text className="font-sans-medium text-[16px] text-muted-foreground"> / {l.unit}</Text> : null}
            </Text>
            {l.negotiable ? (
              <View className="mt-1 flex-row items-center gap-1.5">
                <HandshakeIcon size={17} weight="duotone" color={COLORS.gold} />
                <Text className="font-sans-semibold text-[13.5px] text-gold">Pazarlık payı var</Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row gap-2">
            <Fact Icon={MapPinIcon} label="Konum" value={place} />
            <Fact Icon={ClockIcon} label="İlan tarihi" value={agoLabel(new Date(l.createdAt), now)} />
            {l.quantity ? <Fact Icon={PackageIcon} label="Miktar" value={l.quantity} /> : <Fact Icon={InfoIcon} label="Durum" value={condition ?? '—'} />}
          </View>

          {l.description ? (
            <Block Icon={TagIcon} label="AÇIKLAMA">
              <Text className="mt-0.5 text-[15px] leading-6">{l.description}</Text>
            </Block>
          ) : null}

          <View className="flex-row items-center gap-3 rounded-[20px] border border-border bg-card p-3.5">
            <Avatar name={l.seller.name} size={52} />
            <View className="min-w-0 flex-1">
              <Text className="font-heading text-[17px]">{l.mine ? `${l.seller.name} (siz)` : l.seller.name}</Text>
              <Text className="text-[13.5px] text-muted-foreground">Üyelik: {monthYear(l.seller.memberSince)}</Text>
              <View className="mt-0.5 flex-row items-center gap-1">
                <StorefrontIcon size={14} weight="duotone" color={COLORS.primary} />
                <Text className="text-[13.5px] text-muted-foreground">{l.seller.activeListings} yayında ilan</Text>
              </View>
            </View>
          </View>

          <View className="gap-2 rounded-[20px] bg-gold-soft p-3.5">
            <View className="flex-row items-center gap-2">
              <ShieldCheckIcon size={20} weight="duotone" color={COLORS.gold} />
              <Text className="font-sans-bold text-[14px]">Güvenli alışveriş</Text>
            </View>
            {SAFETY_TIPS.map((t) => (
              <View key={t} className="flex-row gap-2 pl-1">
                <Text className="text-[14px] text-gold">•</Text>
                <Text className="flex-1 text-[14px] leading-5">{t}</Text>
              </View>
            ))}
          </View>

          {!l.mine && signedIn ? (
            reported ? (
              <Text className="py-2 text-center text-[14px] text-muted-foreground">Şikâyetiniz alındı; yöneticiler inceleyecek.</Text>
            ) : (
              <Pressable accessibilityRole="button" onPress={() => setDialog('report')} className="min-h-12 flex-row items-center justify-center gap-2 self-center px-3 active:opacity-60">
                <FlagIcon size={18} weight="duotone" color={COLORS.mutedForeground} />
                <Text className="font-sans-semibold text-[14px] text-muted-foreground underline">İlanı şikâyet et</Text>
              </Pressable>
            )
          ) : null}
        </View>
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 flex-row gap-2.5 border-t border-border bg-card px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        {l.mine && !removed ? (
          <>
            <Button variant="outline" size="icon" className="size-14 rounded-full" accessibilityLabel="İlanı düzenle" onPress={() => router.push({ pathname: '/ilan/yeni', params: { id: l.id } })}>
              <PencilSimpleIcon size={22} weight="duotone" color={COLORS.primary} />
            </Button>
            <Button variant="outline" className="h-14 flex-1 flex-row gap-2 rounded-full" disabled={busy} onPress={() => setStatus(sold ? 'active' : 'sold')}>
              {busy ? <ActivityIndicator color={COLORS.primary} /> : <CheckCircleIcon size={20} weight="duotone" color={COLORS.primary} />}
              <Text>{sold ? 'Satışa geri al' : 'Satıldı olarak işaretle'}</Text>
            </Button>
            <Button variant="outline" size="icon" className="size-14 rounded-full border-destructive/50" accessibilityLabel="İlanı kaldır" onPress={() => setDialog('remove')}>
              <TrashIcon size={22} weight="duotone" color={COLORS.destructive} />
            </Button>
          </>
        ) : removed ? (
          <Status>Bu ilan kaldırıldı</Status>
        ) : sold ? (
          <Status>Bu ilan satıldı</Status>
        ) : l.conversationId ? (
          <Button className="h-14 flex-1 flex-row gap-2 rounded-full" onPress={() => openChat(l.conversationId!)}>
            <ChatCircleDotsIcon size={21} weight="fill" color={COLORS.white} />
            <Text>Sohbete git</Text>
          </Button>
        ) : (
          <>
            <Button variant="outline" className="h-14 flex-1 flex-row gap-2 rounded-full border-primary/50" onPress={() => !needAccount() && setDialog('offer')}>
              <TagIcon size={20} weight="duotone" color={COLORS.primary} />
              <Text className="text-primary">Teklif ver</Text>
            </Button>
            <Button className="h-14 flex-[1.3] flex-row gap-2 rounded-full" onPress={() => !needAccount() && setDialog('message')}>
              <ChatCircleDotsIcon size={21} weight="fill" color={COLORS.white} />
              <Text>Mesaj gönder</Text>
            </Button>
          </>
        )}
        {admin && !l.mine && !removed ? (
          <Button variant="outline" size="icon" className="size-14 rounded-full border-destructive/50" accessibilityLabel="İlanı kaldır (yönetici)" onPress={() => setDialog('remove')}>
            <TrashIcon size={22} weight="duotone" color={COLORS.destructive} />
          </Button>
        ) : null}
      </View>

      <OfferDialog price={l.price} unit={l.unit} open={dialog === 'offer'} onClose={() => setDialog(null)} onOffer={(offer) => start({ offer })} />
      <MessageDialog open={dialog === 'message'} sellerName={l.seller.name} onClose={() => setDialog(null)} onSend={(text) => start({ text })} />
      <ReportDialog open={dialog === 'report'} onClose={() => setDialog(null)} onReport={report} />
      <ConfirmDialog
        open={dialog === 'remove'}
        onClose={() => setDialog(null)}
        onConfirm={() => setStatus('removed')}
        busy={busy}
        title="İlan kaldırılsın mı?"
        body={`“${l.title}” Pazar’dan kalkar ve alıcılar artık göremez.${l.mine ? '' : ' (Yönetici olarak kaldırıyorsunuz.)'}`}
        action="Kaldır"
      />
    </View>
  );
}

function RoundButton({ label, selected, onPress, children }: { label: string; selected?: boolean; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={selected === undefined ? undefined : { selected }} onPress={onPress} className="size-12 items-center justify-center rounded-full bg-white/95 active:scale-95" style={{ boxShadow: SHADOW.soft }}>
      {children}
    </Pressable>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return <View className="flex-row items-center gap-1 rounded-full bg-secondary px-2.5 py-1">{children}</View>;
}

function Status({ children }: { children: string }) {
  return (
    <View className="h-14 flex-1 items-center justify-center rounded-full bg-muted">
      <Text className="font-sans-semibold text-[15px] text-muted-foreground">{children}</Text>
    </View>
  );
}

function Fact({ Icon, label, value }: { Icon: typeof MapPinIcon; label: string; value: string }) {
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-[16px] border border-border bg-card px-2.5 py-2.5" accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon size={18} weight="duotone" color={COLORS.primary} />
      <Text className="text-[12px] text-muted-foreground">{label}</Text>
      <Text numberOfLines={2} className="font-sans-semibold text-[13.5px] leading-[18px]">
        {value}
      </Text>
    </View>
  );
}
