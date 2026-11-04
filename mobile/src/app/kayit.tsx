import { useSignUp } from '@clerk/expo';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, type TextInput } from 'react-native';

import { api } from '@/api/client';
import { keys, refresh } from '@/api/queries';
import { AuthHeader, CodeField, GoogleButton, LinkButton, Notice, OrDivider, PasswordField } from '@/components/auth/parts';
import { TextField } from '@/components/form/field';
import { FormScreen } from '@/components/form/form-screen';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { PROTECT_CODES, clerkCode, clerkField, clerkMessage } from '@/lib/clerk-errors';
import { siteUrl } from '@/lib/config';
import { COLORS } from '@/theme/tokens';

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

/**
 * "Hesap aç": the name other people see, e-mail and password, then the 6-digit code from the e-mail.
 * Or Google. The account works on the website too.
 */
export default function SignUp() {
  const { signUp } = useSignUp();
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; code?: string; form?: string }>({});
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [protect, setProtect] = useState(false);

  const run = async (fn: () => Promise<{ error: unknown } | void>) => {
    setBusy(true);
    setErrors({});
    setProtect(false);
    try {
      const res = await fn();
      if (res && res.error) {
        const field = clerkField(res.error);
        setErrors(field ? { [field]: clerkMessage(res.error) } : { form: clerkMessage(res.error) });
        setProtect(PROTECT_CODES.has(clerkCode(res.error)));
        return false;
      }
      return true;
    } catch (err) {
      setErrors({ form: clerkMessage(err) });
      setProtect(PROTECT_CODES.has(clerkCode(err)));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const create = async () => {
    const e: typeof errors = {};
    const clean = name.trim().replace(/\s+/g, ' ');
    if (clean.length < 2) e.name = 'Adınızı yazın (en az 2 harf).';
    else if (clean.length > 60) e.name = 'Ad en fazla 60 karakter olabilir.';
    if (!isEmail(email)) e.email = 'Geçerli bir e-posta adresi yazın (ör. ad@ornek.com).';
    if (password.length < 15) e.password = 'Şifre en az 15 karakter olmalı.';
    if (Object.keys(e).length) return setErrors(e);
    const ok = await run(async () => {
      const created = await signUp.password({ emailAddress: email.trim(), password });
      if (created.error) return created;
      // Clerk's bot check ("Verify you are human") runs only in a browser: the website can show it, the app can't.
      if (signUp.protectCheck || signUp.missingFields.includes('protect_check')) return { error: { code: 'protect_check_required' } };
      return signUp.verifications.sendEmailCode();
    });
    if (ok) {
      setCode('');
      setStep('code');
    }
  };

  const verify = async () => {
    if (code.length !== 6) return setErrors({ code: 'E-postadaki 6 haneli kodu yazın.' });
    if (!(await run(() => signUp.verifications.verifyEmailCode({ code })))) return;
    if (signUp.status !== 'complete') {
      if (signUp.protectCheck || signUp.missingFields.includes('protect_check')) {
        setProtect(true);
        return setErrors({ form: clerkMessage({ code: 'protect_check_required' }) });
      }
      return setErrors({ form: 'Hesap açılamadı. Yeniden deneyin.' });
    }
    if (!(await run(() => signUp.finalize()))) return;
    // The name other people see on listings and in chats (the website asks for it on Hesabım otherwise).
    try {
      await api('/ben', { method: 'PATCH', body: { name: name.trim(), province: '' } });
      await refresh(keys.me);
    } catch {
      // Hesabım will ask for it before the first listing or message.
    }
    leave();
  };

  return (
    <FormScreen
      title="Hesap aç"
      onClose={leave}
      footer={
        <Button className="h-14 rounded-full" disabled={busy} onPress={step === 'form' ? create : verify} accessibilityState={{ busy }}>
          {busy ? <ActivityIndicator color={COLORS.white} /> : null}
          <Text className="text-[16px]">{busy ? 'Bekleyin…' : step === 'form' ? 'Devam et' : 'Kodu onayla ve hesabı aç'}</Text>
        </Button>
      }>
      {step === 'form' ? (
        <>
          <AuthHeader title="Ücretsiz hesap açın" body="İlan vermek, satıcılara yazmak, takviminizi ve tarlalarınızı tutmak için. Aynı hesapla sitede de giriş yapabilirsiniz." />
          {errors.form ? <Notice tone="error">{errors.form}</Notice> : null}
          {protect ? <LinkButton label="Hesabı sitede aç" onPress={() => Linking.openURL(siteUrl('/kayit'))} /> : null}
          <TextField
            label="Adınız soyadınız"
            required
            value={name}
            onChangeText={setName}
            error={errors.name}
            hint="İlanlarınızda ve mesajlarda bu ad görünür."
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          <TextField
            ref={emailRef}
            label="E-posta"
            required
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            placeholder="ad@ornek.com"
          />
          <PasswordField ref={passwordRef} label="Şifre" isNew value={password} onChangeText={setPassword} error={errors.password} hint="En az 15 karakter. Uzun bir cümle hatırlaması kolay bir şifredir." onSubmitEditing={create} />
          <Text className="text-[13.5px] leading-5 text-muted-foreground">
            Hesap açarak{' '}
            <Text className="text-[13.5px] text-primary underline" accessibilityRole="link" onPress={() => Linking.openURL(siteUrl('/gizlilik'))}>
              Gizlilik ve KVKK
            </Text>{' '}
            metnini kabul etmiş olursunuz.
          </Text>
          <OrDivider />
          <GoogleButton onDone={leave} onError={(form) => setErrors({ form })} />
          <Text className="mt-2 text-center text-[15px] text-muted-foreground">Zaten hesabınız var mı?</Text>
          <Button variant="outline" className="h-14 rounded-full bg-card" onPress={() => router.replace('/giris')}>
            <Text className="text-[16px]">Giriş yap</Text>
          </Button>
        </>
      ) : (
        <>
          <AuthHeader title="E-postanızı doğrulayın" body="Son adım: e-postanıza gelen kodu yazın." />
          {errors.form ? <Notice tone="error">{errors.form}</Notice> : null}
          {protect ? <LinkButton label="Hesabı sitede aç" onPress={() => Linking.openURL(siteUrl('/kayit'))} /> : null}
          <CodeField value={code} onChange={setCode} error={errors.code} email={email.trim()} onSubmit={verify} />
          <LinkButton label="Kodu yeniden gönder" onPress={() => run(() => signUp.verifications.sendEmailCode())} />
          <LinkButton label="E-postayı değiştir" onPress={() => setStep('form')} />
        </>
      )}
    </FormScreen>
  );
}
