import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { QUICK_REPLIES } from '@/domain/chat';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

/** The first message to a seller: a ready question or one's own words. `onSend` resolves to an error, or null. */
export function MessageDialog({ open, sellerName, onClose, onSend }: { open: boolean; sellerName: string; onClose: () => void; onSend: (text: string) => Promise<string | null> }) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const send = async (t: string) => {
    if (!t.trim()) return setError('Bir mesaj yazın.');
    setBusy(true);
    const failed = await onSend(t.trim());
    setBusy(false);
    if (failed) return setError(failed);
    setText('');
    setError(null);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="mx-4 rounded-[24px] border-border bg-background">
        <DialogHeader>
          <DialogTitle className="font-heading text-[21px]">{sellerName} kişisine yazın</DialogTitle>
          <DialogDescription className="font-sans text-[14.5px] leading-5 text-muted-foreground">Hazır sorulardan birine dokunun ya da kendi mesajınızı yazın.</DialogDescription>
        </DialogHeader>
        <View className="flex-row flex-wrap gap-2">
          {QUICK_REPLIES.buyer.map((q) => (
            <Pressable key={q} accessibilityRole="button" disabled={busy} onPress={() => send(q)} className={cn('min-h-11 justify-center rounded-full border border-primary/40 bg-secondary px-3.5 active:bg-primary/20', busy && 'opacity-50')}>
              <Text className="font-sans-semibold text-[14px] text-primary">{q}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t);
            setError(null);
          }}
          placeholder="Mesajınız…"
          placeholderTextColorClassName="accent-muted-foreground"
          accessibilityLabel="Mesajınız"
          multiline
          maxLength={1000}
          textAlignVertical="top"
          className={cn('min-h-24 rounded-[16px] border bg-card px-4 py-3 font-sans text-[16px] text-foreground', error ? 'border-destructive' : 'border-input')}
        />
        {error ? (
          <Text role="alert" className="text-[13.5px] text-destructive">
            {error}
          </Text>
        ) : null}
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" className="h-12 flex-1 rounded-full" disabled={busy} onPress={onClose}>
            <Text>Vazgeç</Text>
          </Button>
          <Button className="h-12 flex-1 rounded-full" disabled={busy} onPress={() => send(text)} accessibilityState={{ busy }}>
            {busy ? <ActivityIndicator color={COLORS.white} /> : null}
            <Text>Gönder</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
