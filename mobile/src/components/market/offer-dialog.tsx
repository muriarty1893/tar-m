import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { priceStep } from '@/domain/chat';
import { formatPrice, parsePrice, type Listing } from '@/domain/market';
import { cn } from '@/lib/utils';

const QUICK = [5, 10, 15];

/** "Teklif ver": an amount with quick discounts, checked before it's sent. */
export function OfferDialog({ listing, open, onClose, onOffer }: { listing: Listing; open: boolean; onClose: () => void; onOffer: (amount: number) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const step = priceStep(listing.price);
  const unit = listing.unit ? ` / ${listing.unit}` : '';

  const pick = (pct: number) => {
    const amount = Math.round((listing.price * (1 - pct / 100)) / step) * step;
    setValue(formatPrice(amount).replace(' ₺', ''));
    setError(null);
  };
  const submit = () => {
    const amount = parsePrice(value);
    if (!(amount > 0)) return setError('Geçerli bir tutar girin.');
    if (amount >= listing.price) return setError(`Teklif, ilan fiyatından (${formatPrice(listing.price)}) düşük olmalı.`);
    setValue('');
    setError(null);
    onOffer(amount);
  };
  const close = () => {
    setValue('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="mx-4 rounded-[24px] border-border bg-background">
        <DialogHeader>
          <DialogTitle className="font-heading text-[21px]">Teklif ver</DialogTitle>
          <DialogDescription className="font-sans text-[14px] text-muted-foreground">
            İlan fiyatı {formatPrice(listing.price)}
            {unit}. Satıcı teklifinizi kabul edebilir ya da karşı teklif verebilir.
          </DialogDescription>
        </DialogHeader>
        <View className="gap-2">
          <Text nativeID="offer-label" className="font-sans-semibold text-[14px]">
            Teklifiniz (₺{unit})
          </Text>
          <View className={cn('h-14 flex-row items-center rounded-[16px] border bg-card px-4', error ? 'border-destructive' : 'border-input')}>
            <Text className="font-heading text-[20px] text-muted-foreground">₺</Text>
            <TextInput
              value={value}
              onChangeText={(t) => {
                setValue(t);
                setError(null);
              }}
              keyboardType="decimal-pad"
              placeholder={formatPrice(Math.round((listing.price * 0.9) / step) * step).replace(' ₺', '')}
              placeholderTextColorClassName="accent-muted-foreground"
              accessibilityLabel={`Teklifiniz, Türk lirası${unit}`}
              accessibilityLabelledBy="offer-label"
              onSubmitEditing={submit}
              className="h-full flex-1 pl-2 font-heading text-[20px] text-foreground"
            />
          </View>
          {error ? (
            <Text role="alert" className="text-[13px] text-destructive">
              {error}
            </Text>
          ) : null}
          <View className="flex-row gap-2">
            {QUICK.map((pct) => (
              <Pressable key={pct} accessibilityRole="button" accessibilityLabel={`Yüzde ${pct} indirimli teklif`} onPress={() => pick(pct)} className="min-h-11 flex-1 items-center justify-center rounded-full border border-primary/40 bg-secondary active:bg-primary/20">
                <Text className="font-sans-semibold text-[14px] text-primary">%{pct} az</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onPress={close}>
            <Text>Vazgeç</Text>
          </Button>
          <Button className="flex-1" onPress={submit}>
            <Text>Teklifi gönder</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
