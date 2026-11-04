import { useSSO } from '@clerk/expo';
import * as AuthSession from 'expo-auth-session';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { forwardRef, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, View, type TextInput, type TextInputProps } from 'react-native';

import { Field, inputClass } from '@/components/form/field';
import { EyeIcon, EyeSlashIcon, GoogleLogoIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { clerkMessage } from '@/lib/clerk-errors';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

// Lets the Google sign-in browser close itself and hand the result back to the app.
WebBrowser.maybeCompleteAuthSession();

/** The top of the sign-in and sign-up sheets: the badge logo, a title and one line on what happens. */
export function AuthHeader({ title, body }: { title: string; body: string }) {
  return (
    <View className="items-center gap-2 pb-1 pt-2">
      <Image source={require('@/assets/images/brand/logo.webp')} style={{ width: 64, height: 64 }} accessible={false} />
      <Text role="heading" className="text-center font-heading text-[24px]">
        {title}
      </Text>
      <Text className="text-center text-[15px] leading-6 text-muted-foreground">{body}</Text>
    </View>
  );
}

/** A password box with "Göster / Gizle"; paste and password managers work. */
export const PasswordField = forwardRef<TextInput, TextInputProps & { label: string; error?: string; hint?: string; isNew?: boolean }>(function PasswordField({ label, error, hint, isNew, ...props }, ref) {
  const [shown, setShown] = useState(false);
  return (
    <Field label={label} required error={error} hint={hint}>
      <View className="relative justify-center">
        <Input
          ref={ref}
          secureTextEntry={!shown}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={isNew ? 'new-password' : 'current-password'}
          textContentType={isNew ? 'newPassword' : 'password'}
          accessibilityLabel={label}
          aria-invalid={!!error}
          className={cn(inputClass(error), 'pr-14')}
          {...props}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={shown ? 'Şifreyi gizle' : 'Şifreyi göster'}
          onPress={() => setShown((s) => !s)}
          className="absolute right-1 size-12 items-center justify-center rounded-full active:bg-secondary">
          {shown ? <EyeSlashIcon size={22} weight="bold" color={COLORS.mutedForeground} /> : <EyeIcon size={22} weight="bold" color={COLORS.mutedForeground} />}
        </Pressable>
      </View>
    </Field>
  );
});

/** The 6-digit code from the e-mail, in one box: typing, pasting and the keyboard's suggestion all work. */
export function CodeField({ value, onChange, error, email, onSubmit }: { value: string; onChange: (v: string) => void; error?: string; email: string; onSubmit: () => void }) {
  return (
    <Field label="E-postadaki kod" required error={error} hint={`${email} adresine 6 haneli bir kod gönderdik. Gelen kutusunda yoksa “Spam” ya da “Gereksiz” klasörüne bakın (gönderen: notifications@accounts.dev).`}>
      <Input
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        autoFocus
        maxLength={6}
        accessibilityLabel="E-postadaki 6 haneli kod"
        aria-invalid={!!error}
        onSubmitEditing={onSubmit}
        className={cn(inputClass(error), 'h-16 text-center font-heading text-[28px] tracking-[10px]')}
      />
    </Field>
  );
}

/** "Google ile devam et": Clerk's Google sign-in in the phone's browser, back to the app. */
export function GoogleButton({ onDone, onError }: { onDone: () => void; onError: (message: string) => void }) {
  const { startSSOFlow } = useSSO();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => void WebBrowser.coolDownAsync();
  }, []);
  const go = async () => {
    setBusy(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy: 'oauth_google', redirectUrl: AuthSession.makeRedirectUri() });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        onDone();
      }
    } catch (err) {
      onError(clerkMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button variant="outline" className="h-14 rounded-full bg-card" disabled={busy} onPress={go} accessibilityState={{ busy }}>
      {busy ? <ActivityIndicator color={COLORS.primary} /> : <GoogleLogoIcon size={22} weight="bold" color={COLORS.foreground} />}
      <Text className="text-[16px]">Google ile devam et</Text>
    </Button>
  );
}

/** "ya da" between the e-mail form and Google. */
export function OrDivider() {
  return (
    <View className="flex-row items-center gap-3" accessible={false}>
      <View className="h-px flex-1 bg-border" />
      <Text className="text-[13px] text-muted-foreground">ya da</Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}

/** A form-level message (what went wrong, or that a code was sent). */
export function Notice({ tone, children }: { tone: 'error' | 'info'; children: ReactNode }) {
  return (
    <View className={cn('rounded-[16px] border px-3.5 py-3', tone === 'error' ? 'border-destructive/40 bg-destructive/5' : 'border-primary/30 bg-secondary')} role={tone === 'error' ? 'alert' : undefined} accessibilityLiveRegion="polite">
      <Text className={cn('text-[14.5px] leading-5', tone === 'error' ? 'text-destructive' : 'text-primary')}>{children}</Text>
    </View>
  );
}

/** A quiet text button ("Şifremi unuttum", "Başka e-posta kullan"). */
export function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={6} className="min-h-12 items-center justify-center self-center px-3 active:opacity-60">
      <Text className="font-sans-semibold text-[15px] text-primary underline">{label}</Text>
    </Pressable>
  );
}
