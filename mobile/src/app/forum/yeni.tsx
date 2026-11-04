import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, type ScrollView, type TextInput } from 'react-native';

import { ApiError, api } from '@/api/client';
import { keys, refresh, useSignedIn } from '@/api/queries';
import type { TopicInput } from '@/api/types';
import { SignInPrompt } from '@/components/app/states';
import { Choices, ErrorSummary, Field, TextField } from '@/components/form/field';
import { FormScreen } from '@/components/form/form-screen';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FORUM_CATEGORIES, TOPIC_BODY_MAX, TOPIC_TITLE_MAX, validateTopic } from '@/domain/forum';
import { errorMessage, redirectForError } from '@/lib/api-errors';
import { hasErrors, mergeErrors } from '@/lib/form-errors';
import { COLORS } from '@/theme/tokens';

const NAMES: Record<keyof TopicInput, string> = { category: 'Konu türü', title: 'Başlık', body: 'Metin' };
const ORDER: (keyof TopicInput)[] = ['category', 'title', 'body'];

/** "Konu aç": the kind of topic, a title and the text (the website's form and checks). */
export default function NewTopic() {
  const { signedIn } = useSignedIn();
  const [t, setT] = useState<TopicInput>({ category: '', title: '', body: '' });
  const [submitted, setSubmitted] = useState(false);
  const [server, setServer] = useState<Partial<Record<keyof TopicInput, string>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const titleRef = useRef<TextInput>(null);
  const bodyRef = useRef<TextInput>(null);
  const dirty = useRef(false);

  const errors = mergeErrors(validateTopic(t), server);
  const shown = (k: keyof TopicInput) => (submitted ? errors[k] : undefined);
  const set = <K extends keyof TopicInput>(k: K, v: TopicInput[K]) => {
    dirty.current = true;
    setServer((e) => ({ ...e, [k]: undefined }));
    setT((d) => ({ ...d, [k]: v }));
  };
  const focusField = (k: keyof TopicInput) => {
    if (k === 'title') titleRef.current?.focus();
    else if (k === 'body') bodyRef.current?.focus();
  };

  if (!signedIn) {
    return (
      <FormScreen title="Konu aç" footer={null}>
        <SignInPrompt title="Konu açmak için giriş yapın" body="Sorunuzu yazın, diğer çiftçiler yanıtlasın. Okumak için hesap gerekmez." />
      </FormScreen>
    );
  }

  const publish = async () => {
    setSubmitted(true);
    setMessage(null);
    if (hasErrors(errors)) return scroll.current?.scrollTo({ y: 0, animated: true });
    setBusy(true);
    try {
      const { id } = await api<{ id: string }>('/forum', { method: 'POST', body: t });
      await refresh(keys.forum);
      dirty.current = false;
      router.replace({ pathname: '/forum/[id]', params: { id, yeni: '1' } });
    } catch (err) {
      if (redirectForError(err)) return;
      if (err instanceof ApiError && Object.keys(err.errors).length) setServer(err.errors);
      setMessage(errorMessage(err));
      scroll.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    const leave = () => (router.canGoBack() ? router.back() : router.replace('/forum'));
    if (!dirty.current) return leave();
    Alert.alert('Konu kaydedilmedi', 'Çıkarsanız yazdıklarınız silinir.', [
      { text: 'Yazmaya devam et', style: 'cancel' },
      { text: 'Çık', style: 'destructive', onPress: leave },
    ]);
  };

  const summary = submitted ? ORDER.filter((k) => errors[k]) : [];

  return (
    <FormScreen
      ref={scroll}
      title="Konu aç"
      onClose={close}
      footer={
        <Button className="h-14 rounded-full" disabled={busy} onPress={publish} accessibilityState={{ busy }}>
          {busy ? <ActivityIndicator color={COLORS.white} /> : null}
          <Text className="text-[16px]">{busy ? 'Yayınlanıyor…' : 'Konuyu yayınla'}</Text>
        </Button>
      }>
      <ErrorSummary title="Yayınlamadan önce düzeltin" message={message ?? undefined} items={summary.map((k) => ({ key: k, label: NAMES[k], error: errors[k]! }))} onPick={focusField} />
      <Field label="Konu türü" required error={shown('category')}>
        <Choices label="Konu türü" options={FORUM_CATEGORIES} value={t.category} onChange={(c) => set('category', c)} />
      </Field>
      <TextField ref={titleRef} label="Başlık" required value={t.title} onChangeText={(v) => set('title', v)} error={shown('title')} maxLength={TOPIC_TITLE_MAX} placeholder="Örn. Mısır kurduna karşı en etkili ilaç hangisi?" hint="Kısa ve açık yazın; listede bu görünür." />
      <TextField
        ref={bodyRef}
        label="Metin"
        required
        value={t.body}
        onChangeText={(v) => set('body', v)}
        error={shown('body')}
        multiline
        maxLength={TOPIC_BODY_MAX}
        className="h-48"
        placeholder="Ne ektiniz, nerede, ne zaman? Ne denediniz? Ayrıntı verdikçe yanıtlar daha işe yarar olur."
        hint={`${t.body.length}/${TOPIC_BODY_MAX}`}
      />
      <Text className="text-[13.5px] leading-5 text-muted-foreground">Kişisel bilgilerinizi (telefon, adres) paylaşmayın. Hakaret ve reklam içeren konular kaldırılır.</Text>
    </FormScreen>
  );
}
