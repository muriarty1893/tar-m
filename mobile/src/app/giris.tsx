import { useSignIn } from '@clerk/expo';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, type TextInput } from 'react-native';

import { AuthHeader, CodeField, GoogleButton, LinkButton, Notice, OrDivider, PasswordField } from '@/components/auth/parts';
import { TextField } from '@/components/form/field';
import { FormScreen } from '@/components/form/form-screen';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { clerkField, clerkMessage } from '@/lib/clerk-errors';
import { COLORS } from '@/theme/tokens';

type Step = 'start' | 'code' | 'second' | 'reset-code' | 'new-password';

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

/** Back to the screen that asked for sign-in (it shows the person's data once they're in). */
const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

/**
 * "Giriş yap": e-mail and password, or a code sent to the e-mail instead of the password, or Google.
 * "Şifremi unuttum" sets a new password with an e-mailed code. Same accounts as the website.
 */
export default function SignIn() {
  const { signIn } = useSignIn();
  const [step, setStep] = useState<Step>('start');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; code?: string; form?: string }>({});
  const [info, setInfo] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  /** Runs one Clerk step; its error goes under its field (or above the form). */
  const run = async (fn: () => Promise<{ error: unknown } | void>) => {
    setBusy(true);
    setErrors({});
    try {
      const res = await fn();
      if (res && res.error) {
        const field = clerkField(res.error);
        setErrors(field ? { [field]: clerkMessage(res.error) } : { form: clerkMessage(res.error) });
        return false;
      }
      return true;
    } catch (err) {
      setErrors({ form: clerkMessage(err) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  /** Signed in, or one more check: a new device may need a code by e-mail. */
  const afterFirstFactor = async () => {
    if (signIn.status === 'complete') {
      const ok = await run(() => signIn.finalize());
      if (ok) leave();
    } else if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
      const ok = await run(() => signIn.mfa.sendEmailCode());
      if (ok) {
        setCode('');
        setInfo('Bu telefondan ilk kez giriş yapıyorsunuz: güvenliğiniz için e-postanıza bir kod gönderdik.');
        setStep('second');
      }
    } else if (signIn.status === 'needs_protect_check' || signIn.protectCheck) {
      // Clerk's bot check runs only in a browser; Google sign-in or the website get past it.
      setErrors({ form: 'Ek bir güvenlik kontrolü istendi; uygulama bunu gösteremiyor. Google ile devam edin ya da sitede giriş yapın.' });
    } else {
      setErrors({ form: 'Giriş tamamlanamadı. Yeniden deneyin ya da e-postanıza kod isteyin.' });
    }
  };

  const checkEmail = () => {
    if (isEmail(email)) return true;
    setErrors({ email: 'Geçerli bir e-posta adresi yazın (ör. ad@ornek.com).' });
    return false;
  };

  const withPassword = async () => {
    if (!checkEmail()) return;
    if (!password) return setErrors({ password: 'Şifrenizi yazın.' });
    if (await run(() => signIn.password({ identifier: email.trim(), password }))) await afterFirstFactor();
  };

  const sendLoginCode = async () => {
    if (!checkEmail()) return;
    if (await run(() => signIn.emailCode.sendCode({ emailAddress: email.trim() }))) {
      setCode('');
      setInfo(null);
      setStep('code');
    }
  };

  const verifyLoginCode = async () => {
    if (code.length !== 6) return setErrors({ code: 'E-postadaki 6 haneli kodu yazın.' });
    if (await run(() => signIn.emailCode.verifyCode({ code }))) await afterFirstFactor();
  };

  const verifySecond = async () => {
    if (code.length !== 6) return setErrors({ code: 'E-postadaki 6 haneli kodu yazın.' });
    if (!(await run(() => signIn.mfa.verifyEmailCode({ code })))) return;
    if (signIn.status === 'complete' && (await run(() => signIn.finalize()))) leave();
  };

  const startReset = async () => {
    if (!checkEmail()) return;
    const ok = await run(async () => {
      const created = await signIn.create({ identifier: email.trim() });
      if (created.error) return created;
      return signIn.resetPasswordEmailCode.sendCode();
    });
    if (ok) {
      setCode('');
      setPassword('');
      setInfo(null);
      setStep('reset-code');
    }
  };

  const verifyReset = async () => {
    if (code.length !== 6) return setErrors({ code: 'E-postadaki 6 haneli kodu yazın.' });
    if (await run(() => signIn.resetPasswordEmailCode.verifyCode({ code }))) setStep('new-password');
  };

  const saveNewPassword = async () => {
    if (!password) return setErrors({ password: 'Yeni şifrenizi yazın.' });
    if (await run(() => signIn.resetPasswordEmailCode.submitPassword({ password }))) await afterFirstFactor();
  };

  const restart = () => {
    void signIn.reset();
    setStep('start');
    setCode('');
    setPassword('');
    setErrors({});
    setInfo(null);
  };

  const action =
    step === 'start'
      ? { label: 'Giriş yap', onPress: withPassword }
      : step === 'code'
        ? { label: 'Kodu onayla', onPress: verifyLoginCode }
        : step === 'second'
          ? { label: 'Kodu onayla', onPress: verifySecond }
          : step === 'reset-code'
            ? { label: 'Kodu onayla', onPress: verifyReset }
            : { label: 'Şifreyi kaydet ve giriş yap', onPress: saveNewPassword };

  return (
    <FormScreen
      title="Giriş yap"
      onClose={leave}
      footer={
        <Button className="h-14 rounded-full" disabled={busy} onPress={action.onPress} accessibilityState={{ busy }}>
          {busy ? <ActivityIndicator color={COLORS.white} /> : null}
          <Text className="text-[16px]">{busy ? 'Bekleyin…' : action.label}</Text>
        </Button>
      }>
      {step === 'start' ? (
        <>
          <AuthHeader title="Tekrar hoş geldiniz" body="Çiftçi Destek hesabınızla giriş yapın; sitedeki ilanlarınız, mesajlarınız ve tarlalarınız burada da görünür." />
          {errors.form ? <Notice tone="error">{errors.form}</Notice> : null}
          <TextField
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
          <PasswordField ref={passwordRef} label="Şifre" value={password} onChangeText={setPassword} error={errors.password} returnKeyType="go" onSubmitEditing={withPassword} />
          <LinkButton label="Şifre yerine e-postama kod gönder" onPress={sendLoginCode} />
          <LinkButton label="Şifremi unuttum" onPress={startReset} />
          <OrDivider />
          <GoogleButton onDone={leave} onError={(form) => setErrors({ form })} />
          <Text className="mt-2 text-center text-[15px] text-muted-foreground">Hesabınız yok mu?</Text>
          <Button variant="outline" className="h-14 rounded-full bg-card" onPress={() => router.replace('/kayit')}>
            <Text className="text-[16px]">Ücretsiz hesap aç</Text>
          </Button>
        </>
      ) : step === 'new-password' ? (
        <>
          <AuthHeader title="Yeni şifre" body="Kod doğrulandı. Yeni şifrenizi belirleyin." />
          {errors.form ? <Notice tone="error">{errors.form}</Notice> : null}
          <PasswordField label="Yeni şifre" isNew value={password} onChangeText={setPassword} error={errors.password} hint="En az 15 karakter. Uzun bir cümle hatırlaması kolay bir şifredir." autoFocus onSubmitEditing={saveNewPassword} />
          <LinkButton label="Baştan başla" onPress={restart} />
        </>
      ) : (
        <>
          <AuthHeader
            title={step === 'reset-code' ? 'Şifre yenileme kodu' : 'E-postanızı kontrol edin'}
            body={step === 'reset-code' ? 'E-postanıza gelen kodu yazın, sonra yeni şifrenizi belirleyin.' : 'Giriş için e-postanıza gelen kodu yazın.'}
          />
          {info ? <Notice tone="info">{info}</Notice> : null}
          {errors.form ? <Notice tone="error">{errors.form}</Notice> : null}
          <CodeField value={code} onChange={setCode} error={errors.code} email={email.trim()} onSubmit={action.onPress} />
          <LinkButton label="Kodu yeniden gönder" onPress={step === 'code' ? sendLoginCode : step === 'reset-code' ? startReset : () => run(() => signIn.mfa.sendEmailCode())} />
          <LinkButton label="Başka e-posta kullan" onPress={restart} />
        </>
      )}
    </FormScreen>
  );
}
