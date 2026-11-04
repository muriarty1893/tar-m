import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { REPORT_REASONS } from '@/domain/market';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

/** "Şikâyet et" (a listing, a forum post): a reason and an optional note, read by the admins. `onReport` resolves to an error, or null. */
export function ReportDialog({
  open,
  onClose,
  onReport,
  title = 'İlanı şikâyet et',
  reasons = REPORT_REASONS,
}: {
  open: boolean;
  onClose: () => void;
  onReport: (reason: string, note: string) => Promise<string | null>;
  title?: string;
  reasons?: readonly { id: string; label: string }[];
}) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!reason) return setError('Bir neden seçin.');
    setBusy(true);
    const failed = await onReport(reason, note);
    setBusy(false);
    if (failed) setError(failed);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="mx-4 rounded-[24px] border-border bg-background">
        <DialogHeader>
          <DialogTitle className="font-heading text-[21px]">{title}</DialogTitle>
          <DialogDescription className="font-sans text-[14.5px] leading-5 text-muted-foreground">Şikâyetinizi yöneticiler inceler. Kim olduğunuz yazana söylenmez.</DialogDescription>
        </DialogHeader>
        <View accessibilityRole="radiogroup" accessibilityLabel="Neden" className="gap-1.5">
          {reasons.map((r) => {
            const on = r.id === reason;
            return (
              <Pressable
                key={r.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => {
                  setReason(r.id);
                  setError(null);
                }}
                className={cn('min-h-12 flex-row items-center gap-3 rounded-[14px] border px-3', on ? 'border-primary bg-secondary' : 'border-border bg-card active:bg-secondary')}>
                <View className={cn('size-5 items-center justify-center rounded-full border-2', on ? 'border-primary' : 'border-input')}>{on ? <View className="size-2.5 rounded-full bg-primary" /> : null}</View>
                <Text className="flex-1 text-[14.5px] leading-5">{r.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput value={note} onChangeText={setNote} placeholder="Not (isteğe bağlı)" placeholderTextColorClassName="accent-muted-foreground" accessibilityLabel="Not, isteğe bağlı" maxLength={500} multiline textAlignVertical="top" className="min-h-20 rounded-[16px] border border-input bg-card px-4 py-3 font-sans text-[15px] text-foreground" />
        {error ? (
          <Text role="alert" className="text-[13.5px] text-destructive">
            {error}
          </Text>
        ) : null}
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" className="h-12 flex-1 rounded-full" disabled={busy} onPress={onClose}>
            <Text>Vazgeç</Text>
          </Button>
          <Button variant="destructive" className="h-12 flex-1 rounded-full" disabled={busy} onPress={submit} accessibilityState={{ busy }}>
            {busy ? <ActivityIndicator color={COLORS.white} /> : null}
            <Text>Gönder</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
