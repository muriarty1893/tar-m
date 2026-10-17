import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Block } from '@/components/app/block';
import { ArrowLeftIcon, ChatCircleDotsIcon, CheckCircleIcon, ClockIcon, HandshakeIcon, HeartIcon, InfoIcon, ListIcon, MapPinIcon, PackageIcon, ShareNetworkIcon, ShieldCheckIcon, TagIcon, TrashIcon } from '@/components/icons';
import { OfferDialog } from '@/components/market/offer-dialog';
import { Avatar, CATEGORY_ICONS, Rating, VerifiedMark } from '@/components/market/parts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { categoryLabel, conditionLabel, formatPrice, listingById, ME, sellerById, type Listing } from '@/domain/market';
import { fromYear } from '@/domain/format';
import { agoLabel } from '@/domain/when';
import { useNow } from '@/hooks/use-now';
import { scheduleReply } from '@/state/replies';
import { useAppStore } from '@/state/store';
import { COLORS, SHADOW } from '@/theme/tokens';

const SAFETY_TIPS = ['Ürünü yerinde görmeden kapora göndermeyin.', 'Araç ve makinelerde ruhsat ve fatura isteyin.', 'Görüşmeleri uygulama içi mesajlarda tutun.'];

/** One listing: photo, price, facts, specs, description, the seller, safety tips; message or offer at the bottom. */
export default function ListingScreen() {
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { id, yeni } = useLocalSearchParams<{ id: string; yeni?: string }>();
  const myListings = useAppStore((s) => s.myListings);
  const status = useAppStore((s) => s.listingStatus[id]);
  const favorite = useAppStore((s) => s.favorites.includes(id));
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const setListingStatus = useAppStore((s) => s.setListingStatus);
  const openConversation = useAppStore((s) => s.openConversation);
  const sendOffer = useAppStore((s) => s.sendOffer);
  const [offering, setOffering] = useState(false);
  const [removing, setRemoving] = useState(false);

  const l = listingById(id, myListings);
  const seller = l && sellerById(l.sellerId);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/pazar'));

  if (!l || !seller || status === 'removed') {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
        <Text className="font-heading text-[20px]">İlan bulunamadı</Text>
        <Text className="text-center text-[15px] text-muted-foreground">Bu ilan kaldırılmış ya da artık yayında değil.</Text>
        <Button className="rounded-full" onPress={back}>
          <Text>Pazara dön</Text>
        </Button>
      </View>
    );
  }

  const mine = l.sellerId === ME.id;
  const sold = status === 'sold';
  const CategoryIcon = CATEGORY_ICONS[l.category];
  const condition = conditionLabel(l.condition);
  const chat = () => router.push({ pathname: '/mesajlar/[id]', params: { id: openConversation(l.id) } });
  const offer = (amount: number) => {
    setOffering(false);
    const chatId = openConversation(l.id);
    sendOffer(chatId, amount);
    scheduleReply(chatId);
    router.push({ pathname: '/mesajlar/[id]', params: { id: chatId } });
  };
  const share = () => Share.share({ message: `${l.title}: ${formatPrice(l.price)}${l.unit ? ` / ${l.unit}` : ''}, ${l.location}. Çiftçi Destek Pazar'da.` });

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        <View className="h-[300px] overflow-hidden bg-muted">
          <Image source={l.photos[0]} style={{ position: 'absolute', inset: 0 }} contentFit="cover" accessibilityLabel={l.stockPhoto ? `${l.title}: temsilî görsel` : `${l.title} fotoğrafı`} />
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent']} locations={[0, 0.4]} style={{ position: 'absolute', inset: 0 }} />
          <View className="absolute inset-x-4 flex-row items-center justify-between" style={{ top: insets.top + 8 }}>
            <RoundButton label="Geri" onPress={back}>
              <ArrowLeftIcon size={21} weight="bold" color={COLORS.foreground} />
            </RoundButton>
            <View className="flex-row gap-2">
              <RoundButton label="Paylaş" onPress={share}>
                <ShareNetworkIcon size={21} weight="bold" color={COLORS.foreground} />
              </RoundButton>
              {!mine ? (
                <RoundButton label={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'} selected={favorite} onPress={() => toggleFavorite(l.id)}>
                  <HeartIcon size={21} weight={favorite ? 'fill' : 'bold'} color={favorite ? COLORS.destructive : COLORS.foreground} />
                </RoundButton>
              ) : null}
            </View>
          </View>
          {l.stockPhoto ? (
            <View className="absolute bottom-7 left-4 rounded-full bg-black/55 px-2.5 py-1">
              <Text className="font-sans-medium text-[12px] text-white">Temsilî görsel</Text>
            </View>
          ) : null}
          {sold ? (
            <View className="absolute inset-x-0 bottom-6 items-center">
              <View className="rounded-full bg-black/70 px-4 py-1.5">
                <Text className="font-heading text-[15px] tracking-[2px] text-white">SATILDI</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View className="-mt-4 gap-3 rounded-t-[26px] bg-background px-4 pt-4">
          {yeni && !sold ? (
            <View className="flex-row items-center gap-2.5 rounded-[16px] bg-secondary px-3.5 py-3" accessibilityRole="alert">
              <CheckCircleIcon size={22} weight="fill" color={COLORS.primary} />
              <Text className="flex-1 font-sans-semibold text-[14.5px] text-primary">İlanınız yayında. Gelen mesajlar Mesajlar’a düşecek.</Text>
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
            <Fact Icon={MapPinIcon} label="Konum" value={l.km ? `${l.location.split(',')[0]} · ${l.km} km` : l.location.split(',')[0]} />
            <Fact Icon={ClockIcon} label="İlan tarihi" value={agoLabel(new Date(l.postedAt), now)} />
            {l.quantity ? <Fact Icon={PackageIcon} label="Miktar" value={l.quantity} /> : <Fact Icon={InfoIcon} label="Durum" value={condition ?? '—'} />}
          </View>

          {l.specs.length ? (
            <Block Icon={ListIcon} label="ÖZELLİKLER">
              <View className="mt-1">
                {l.specs.map(([k, v], i) => (
                  <View key={k} className={i ? 'flex-row justify-between gap-3 border-t border-border py-2' : 'flex-row justify-between gap-3 py-2'}>
                    <Text className="text-[14.5px] text-muted-foreground">{k}</Text>
                    <Text className="flex-shrink text-right font-sans-semibold text-[14.5px]">{v}</Text>
                  </View>
                ))}
              </View>
            </Block>
          ) : null}

          {l.description ? (
            <Block Icon={TagIcon} label="AÇIKLAMA">
              <Text className="mt-0.5 text-[15px] leading-6">{l.description}</Text>
            </Block>
          ) : null}

          <View className="gap-3 rounded-[20px] border border-border bg-card p-3.5">
            <View className="flex-row items-center gap-3">
              <Avatar seller={seller} size={52} />
              <View className="min-w-0 flex-1">
                <Text className="font-heading text-[17px]">{mine ? `${seller.name} (siz)` : seller.name}</Text>
                <Text className="text-[13.5px] text-muted-foreground">
                  {seller.place} · {fromYear(seller.memberSince)} beri üye
                </Text>
                <View className="mt-0.5">
                  <Rating seller={seller} />
                </View>
              </View>
            </View>
            <View className="gap-1.5 border-t border-border pt-3">
              <View className="flex-row items-center gap-1.5">
                <ClockIcon size={15} weight="bold" color={COLORS.mutedForeground} />
                <Text className="text-[13.5px] text-muted-foreground">Genelde {seller.replies} yanıt verir</Text>
              </View>
              <VerifiedMark seller={seller} />
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
        </View>
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 flex-row gap-2.5 border-t border-border bg-card px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        {mine ? (
          <>
            <Button variant="outline" className="flex-1 flex-row gap-2 rounded-full" onPress={() => setListingStatus(l.id, sold ? null : 'sold')}>
              <CheckCircleIcon size={20} weight="duotone" color={COLORS.primary} />
              <Text>{sold ? 'Satışa geri al' : 'Satıldı olarak işaretle'}</Text>
            </Button>
            <Button variant="outline" size="icon" className="size-14 rounded-full border-destructive/50" accessibilityLabel="İlanı kaldır" onPress={() => setRemoving(true)}>
              <TrashIcon size={22} weight="duotone" color={COLORS.destructive} />
            </Button>
          </>
        ) : sold ? (
          <View className="h-14 flex-1 items-center justify-center rounded-full bg-muted">
            <Text className="font-sans-semibold text-[15px] text-muted-foreground">Bu ilan satıldı</Text>
          </View>
        ) : (
          <>
            <Button variant="outline" className="flex-1 flex-row gap-2 rounded-full border-primary/50" onPress={() => setOffering(true)}>
              <TagIcon size={20} weight="duotone" color={COLORS.primary} />
              <Text className="text-primary">Teklif ver</Text>
            </Button>
            <Button className="flex-[1.3] flex-row gap-2 rounded-full" onPress={chat}>
              <ChatCircleDotsIcon size={21} weight="fill" color={COLORS.white} />
              <Text>Mesaj gönder</Text>
            </Button>
          </>
        )}
      </View>

      {!mine ? <OfferDialog listing={l} open={offering} onClose={() => setOffering(false)} onOffer={offer} /> : null}
      <RemoveDialog
        listing={l}
        open={removing}
        onClose={() => setRemoving(false)}
        onRemove={() => {
          setRemoving(false);
          setListingStatus(l.id, 'removed');
          back();
        }}
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

function RemoveDialog({ listing, open, onClose, onRemove }: { listing: Listing; open: boolean; onClose: () => void; onRemove: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="mx-4 rounded-[24px] border-border bg-background">
        <DialogHeader>
          <DialogTitle className="font-heading text-[21px]">İlan kaldırılsın mı?</DialogTitle>
          <DialogDescription className="font-sans text-[14.5px] text-muted-foreground">“{listing.title}” Pazar’dan kalkar ve alıcılar artık göremez.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onPress={onClose}>
            <Text>Vazgeç</Text>
          </Button>
          <Button variant="destructive" className="flex-1" onPress={onRemove}>
            <Text>Kaldır</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
