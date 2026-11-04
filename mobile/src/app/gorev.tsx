import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View, type ScrollView, type TextInput } from 'react-native';

import { ApiError, api } from '@/api/client';
import { keys, refresh, useFields, useSignedIn } from '@/api/queries';
import { SignInPrompt } from '@/components/app/states';
import { Choices, ErrorSummary, Field, TextField } from '@/components/form/field';
import { FormScreen } from '@/components/form/form-screen';
import { CaretLeftIcon, CaretRightIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TASK_KINDS, TASK_KIND_IDS, validateTask, type TaskDraft } from '@/domain/farm-calendar';
import { addDays, dayKey, fromDayKey, monthName, WEEKDAYS } from '@/domain/format';
import { errorMessage, redirectForError } from '@/lib/api-errors';
import { hasErrors, mergeErrors } from '@/lib/form-errors';
import { COLORS } from '@/theme/tokens';

const NAMES: Record<keyof TaskDraft, string> = { title: 'İş', kind: 'Tür', date: 'Tarih', time: 'Saat', fieldId: 'Tarla' };
const TIMES = ['07:00', '08:00', '09:00', '17:00', '18:00'];

/** "İş ekle": what, which kind, the day (and time), and optionally the field. ?tarih=2026-11-20 sets the day; ?tarla= the field. */
export default function NewTask() {
  const { signedIn } = useSignedIn();
  const { tarih, tarla } = useLocalSearchParams<{ tarih?: string; tarla?: string }>();
  const fields = useFields();
  const [draft, setDraft] = useState<TaskDraft>({ title: '', kind: '', date: tarih && /^\d{4}-\d{2}-\d{2}$/.test(tarih) ? tarih : dayKey(new Date()), time: '', fieldId: tarla ?? '' });
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Partial<Record<keyof TaskDraft, string>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const titleRef = useRef<TextInput>(null);
  const timeRef = useRef<TextInput>(null);

  const errors = mergeErrors(validateTask(draft), serverErrors);
  const shown = (k: keyof TaskDraft) => (submitted ? errors[k] : undefined);
  const set = <K extends keyof TaskDraft>(k: K, v: TaskDraft[K]) => {
    setServerErrors((e) => ({ ...e, [k]: undefined }));
    setDraft((d) => ({ ...d, [k]: v }));
  };
  const date = fromDayKey(draft.date);
  const focusField = (k: keyof TaskDraft) => {
    if (k === 'title') titleRef.current?.focus();
    else if (k === 'time') timeRef.current?.focus();
  };
  const moveDay = (by: number) => set('date', dayKey(addDays(date, by)));

  if (!signedIn) {
    return (
      <FormScreen title="İş ekle" footer={null}>
        <SignInPrompt title="Takviminiz için giriş yapın" body="İşlerinizi günü gününe yazmak için giriş yapın." />
      </FormScreen>
    );
  }

  const save = async () => {
    setSubmitted(true);
    setMessage(null);
    if (hasErrors(errors)) return scroll.current?.scrollTo({ y: 0, animated: true });
    setBusy(true);
    try {
      await api('/takvim', { method: 'POST', body: draft });
      await refresh(keys.calendar, keys.fields, ...(draft.fieldId ? [keys.field(draft.fieldId)] : []));
      if (router.canGoBack()) router.back();
      else router.replace('/takvim');
    } catch (err) {
      if (redirectForError(err)) return;
      if (err instanceof ApiError && Object.keys(err.errors).length) setServerErrors(err.errors);
      setMessage(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const summary = submitted ? (Object.keys(NAMES) as (keyof TaskDraft)[]).filter((k) => errors[k]) : [];

  return (
    <FormScreen
      ref={scroll}
      title="İş ekle"
      footer={
        <Button className="h-14 rounded-full" disabled={busy} onPress={save} accessibilityState={{ busy }}>
          {busy ? <ActivityIndicator color={COLORS.white} /> : null}
          <Text className="text-[16px]">{busy ? 'Kaydediliyor…' : 'Takvime ekle'}</Text>
        </Button>
      }>
      <ErrorSummary
        message={message ?? undefined}
        items={summary.map((k) => ({ key: k, label: NAMES[k], error: errors[k]! }))}
        onPick={focusField}
      />
      <TextField ref={titleRef} label="Yapılacak iş" required value={draft.title} onChangeText={(t) => set('title', t)} error={shown('title')} placeholder="Örn. Taban gübresi at" maxLength={80} autoFocus />
      <Field label="Türü" required error={shown('kind')}>
        <Choices label="İşin türü" options={TASK_KIND_IDS.map((id) => ({ id, label: TASK_KINDS[id].label }))} value={draft.kind} onChange={(k) => set('kind', k)} />
      </Field>
      <Field label="Gün" required error={shown('date')}>
        <View className="h-16 flex-row items-center gap-2 rounded-[16px] border border-input bg-card px-1.5">
          <Pressable accessibilityRole="button" accessibilityLabel="Önceki gün" onPress={() => moveDay(-1)} className="size-12 items-center justify-center rounded-full active:bg-secondary">
            <CaretLeftIcon size={20} weight="bold" color={COLORS.foreground} />
          </Pressable>
          <Text className="flex-1 text-center font-sans-semibold text-[16px]" accessibilityLiveRegion="polite">
            {date.getDate()} {monthName(date.getMonth())} {date.getFullYear()}, {WEEKDAYS[date.getDay()]}
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Sonraki gün" onPress={() => moveDay(1)} className="size-12 items-center justify-center rounded-full active:bg-secondary">
            <CaretRightIcon size={20} weight="bold" color={COLORS.foreground} />
          </Pressable>
        </View>
        <View className="flex-row gap-2">
          {[0, 1, 7].map((n) => (
            <Pressable key={n} accessibilityRole="button" onPress={() => set('date', dayKey(addDays(new Date(), n)))} className="min-h-11 justify-center rounded-full border border-border bg-card px-3.5 active:bg-secondary">
              <Text className="font-sans-semibold text-[14px]">{n === 0 ? 'Bugün' : n === 1 ? 'Yarın' : 'Haftaya'}</Text>
            </Pressable>
          ))}
        </View>
      </Field>
      <TextField
        ref={timeRef}
        label="Saat (isteğe bağlı)"
        value={draft.time}
        onChangeText={(t) => set('time', t.replace(/[^\d:]/g, '').slice(0, 5))}
        error={shown('time')}
        placeholder="08:30"
        keyboardType="numbers-and-punctuation"
        hint="SS:DD olarak yazın ya da aşağıdan seçin."
      />
      <View className="-mt-3 flex-row flex-wrap gap-2">
        {TIMES.map((t) => (
          <Pressable key={t} accessibilityRole="button" accessibilityState={{ selected: draft.time === t }} onPress={() => set('time', draft.time === t ? '' : t)} className={`min-h-11 justify-center rounded-full border px-3.5 ${draft.time === t ? 'border-primary bg-secondary' : 'border-border bg-card active:bg-secondary'}`}>
            <Text className="font-sans-semibold text-[14px]">{t}</Text>
          </Pressable>
        ))}
      </View>
      {fields.data?.length ? (
        <Field label="Tarla (isteğe bağlı)">
          <Choices label="Tarla" options={[{ id: '', label: 'Tarla yok' }, ...fields.data.map((f) => ({ id: f.id, label: f.name }))]} value={draft.fieldId} onChange={(id) => set('fieldId', id)} />
        </Field>
      ) : null}
    </FormScreen>
  );
}
