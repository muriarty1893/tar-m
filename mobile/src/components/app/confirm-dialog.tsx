import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

/**
 * "Are you sure?" before anything that can't be undone. With `confirmLabel` set, a box must be ticked
 * first (deleting an account).
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  action,
  destructive = true,
  busy,
  error,
  confirmLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  action: string;
  destructive?: boolean;
  busy?: boolean;
  error?: string | null;
  confirmLabel?: string;
  children?: ReactNode;
}) {
  const [ticked, setTicked] = useState(false);
  const close = () => {
    setTicked(false);
    onClose();
  };
  const blocked = !!confirmLabel && !ticked;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && close()}>
      <DialogContent className="mx-4 rounded-[24px] border-border bg-background">
        <DialogHeader>
          <DialogTitle className="font-heading text-[21px]">{title}</DialogTitle>
          <DialogDescription className="font-sans text-[15px] leading-6 text-muted-foreground">{body}</DialogDescription>
        </DialogHeader>
        {children}
        {confirmLabel ? (
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: ticked }} onPress={() => setTicked((t) => !t)} className="min-h-12 flex-row items-center gap-3 rounded-[14px] border border-border bg-card px-3 py-2 active:bg-secondary">
            <View className={cn('size-6 items-center justify-center rounded-[7px] border-2', ticked ? 'border-destructive bg-destructive' : 'border-input bg-card')}>{ticked ? <CheckIcon size={16} weight="bold" color={COLORS.white} /> : null}</View>
            <Text className="flex-1 text-[14.5px] leading-5">{confirmLabel}</Text>
          </Pressable>
        ) : null}
        {error ? (
          <Text role="alert" className="text-[14px] text-destructive">
            {error}
          </Text>
        ) : null}
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" className="h-12 flex-1 rounded-full" disabled={busy} onPress={close}>
            <Text>Vazgeç</Text>
          </Button>
          <Button variant={destructive ? 'destructive' : 'default'} className="h-12 flex-1 rounded-full" disabled={busy || blocked} accessibilityState={{ disabled: busy || blocked, busy }} onPress={onConfirm}>
            {busy ? <ActivityIndicator color={COLORS.white} /> : null}
            <Text>{action}</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
