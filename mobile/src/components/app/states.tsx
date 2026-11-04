import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { CloudSlashIcon, SignInIcon, type PhosphorIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

/** Waiting for the server: a spinner with what it's loading. */
export function Loading({ label = 'Yükleniyor…', className }: { label?: string; className?: string }) {
  return (
    <View className={cn('items-center justify-center gap-3 py-12', className)} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text className="text-[15px] text-muted-foreground">{label}</Text>
    </View>
  );
}

/** A dashed box saying what's missing, with one way forward. */
export function EmptyState({ title, body, action, onAction, Icon, className }: { title: string; body?: string; action?: string; onAction?: () => void; Icon?: PhosphorIcon; className?: string }) {
  return (
    <View className={cn('items-center gap-2 rounded-[22px] border border-dashed border-border px-6 py-8', className)}>
      {Icon ? <Icon size={36} weight="duotone" color={COLORS.primary} /> : null}
      <Text className="text-center font-heading text-[18px]">{title}</Text>
      {body ? <Text className="text-center text-[15px] leading-6 text-muted-foreground">{body}</Text> : null}
      {action && onAction ? (
        <Button className="mt-2 h-12 rounded-full px-6" onPress={onAction}>
          <Text>{action}</Text>
        </Button>
      ) : null}
    </View>
  );
}

/** A call that failed: the server's message (or "no connection") and "Yeniden dene". */
export function ErrorState({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  return (
    <View className={cn('items-center gap-2 rounded-[22px] border border-border bg-card px-6 py-8', className)} role="alert">
      <CloudSlashIcon size={36} weight="duotone" color={COLORS.mutedForeground} />
      <Text className="text-center font-heading text-[18px]">Yüklenemedi</Text>
      <Text className="text-center text-[15px] leading-6 text-muted-foreground">{errorMessage(error)}</Text>
      {onRetry ? (
        <Button variant="outline" className="mt-2 h-12 rounded-full bg-card px-6" onPress={onRetry}>
          <Text>Yeniden dene</Text>
        </Button>
      ) : null}
    </View>
  );
}

/** For a screen that needs an account: why, and the way in (and back here afterwards). */
export function SignInPrompt({ title, body, returnTo, children }: { title: string; body: string; returnTo?: Href; children?: ReactNode }) {
  const go = (path: '/giris' | '/kayit') => router.push({ pathname: path, params: returnTo ? { donus: String(returnTo) } : {} });
  return (
    <View className="items-center gap-3 rounded-[24px] border border-border bg-card px-6 py-8">
      <View className="size-14 items-center justify-center rounded-full bg-secondary">
        <SignInIcon size={28} weight="duotone" color={COLORS.primary} />
      </View>
      <Text role="heading" className="text-center font-heading text-[20px]">
        {title}
      </Text>
      <Text className="text-center text-[15px] leading-6 text-muted-foreground">{body}</Text>
      <Button className="mt-2 h-14 w-full rounded-full" onPress={() => go('/giris')}>
        <Text className="text-[16px]">Giriş yap</Text>
      </Button>
      <Button variant="outline" className="h-14 w-full rounded-full bg-card" onPress={() => go('/kayit')}>
        <Text className="text-[16px]">Ücretsiz hesap aç</Text>
      </Button>
      {children}
    </View>
  );
}
