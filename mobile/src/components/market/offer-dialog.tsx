import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { priceStep } from '@/domain/chat';
import { formatPrice, parsePrice, priceInput, PRICE_MAX } from '@/domain/market';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

const QUICK = [5, 10, 15];

/**
 * "Teklif ver" (or a counter-offer): an amount with quick discounts, checked before it's sent.
 * `onOffer` resolves to an error message to show, or null when sent.
 */
export function OfferDialog({
  price,
  unit,
  open,
  title = 'Teklif ver',
  description,
  belowPrice = true,
  onClose,
  onOffer,
}: {
  price: number;
  unit: string | null;
  open: boolean;
  title?: string;
  description?: string;
  /** A buyer's offer must be under the asking price. */
  belowPrice?: boolean;
  onClose: () => void;
  onOffer: (amount: string) => Promise<string | null>;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const step = priceStep(price);
  const per = unit ? ` / ${unit}` : '';

  const pick = (pct: number) => {
    setValue(priceInput(Math.round((price * (1 - pct / 100)) / step) * step));
    setError(null);
  };
  const submit = async () => {
    const amount = parsePrice(value);
    if (!(amount > 0) || amount > PRICE_MAX) return setError('Geçerli bir tutar girin (ör. 640.000).');
    if (belowPrice && amount >= price) return setError(`Teklif, ilan fiyatından (${formatPrice(price)}) düşük olmalı.`);
    setBusy(true);
    const failed = await onOffer(value);
    setBusy(false);
    if (failed) return setError(failed);
    setValue('');
    setError(null);
  };
  const close = () => {
    if (busy) return;
    setValue('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="mx-4 rounded-[24px] border-border bg-background">
        <DialogHeader>
          <DialogTitle className="font-heading text-[21px]">{title}</DialogTitle>
          <DialogDescription className="font-sans text-[14.5px] leading-5 text-muted-foreground">
            {description ?? `İlan fiyatı ${formatPrice(price)}${per}. Satıcı teklifinizi kabul edebilir, reddedebilir ya da karşı teklif verebilir.`}
          </DialogDescription>
        </DialogHeader>
        <View className="gap-2">
          <Text nativeID="offer-label" className="font-sans-semibold text-[15px]">
            Tutar (₺{per})
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
              placeholder={priceInput(Math.round((price * 0.9) / step) * step)}
              placeholderTextColorClassName="accent-muted-foreground"
              accessibilityLabel={`Tutar, Türk lirası${per}`}
              accessibilityLabelledBy="offer-label"
              onSubmitEditing={submit}
              className="h-full flex-1 pl-2 font-heading text-[20px] text-foreground"
            />
          </View>
          {error ? (
            <Text role="alert" className="text-[13.5px] text-destructive">
              {error}
            </Text>
          ) : null}
          {belowPrice ? (
            <View className="flex-row gap-2">
              {QUICK.map((pct) => (
                <Pressable key={pct} accessibilityRole="button" accessibilityLabel={`Yüzde ${pct} indirimli teklif`} onPress={() => pick(pct)} className="min-h-12 flex-1 items-center justify-center rounded-full border border-primary/40 bg-secondary active:bg-primary/20">
                  <Text className="font-sans-semibold text-[14px] text-primary">%{pct} az</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" className="h-12 flex-1 rounded-full" disabled={busy} onPress={close}>
            <Text>Vazgeç</Text>
          </Button>
          <Button className="h-12 flex-1 rounded-full" disabled={busy} onPress={submit} accessibilityState={{ busy }}>
            {busy ? <ActivityIndicator color={COLORS.white} /> : null}
            <Text>Gönder</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
