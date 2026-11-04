import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View, type ScrollView, type TextInput } from 'react-native';

import { ApiError, api } from '@/api/client';
import { keys, queryClient, refresh, useField, useMe, useSignedIn } from '@/api/queries';
import type { FieldSummary } from '@/api/types';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import { ErrorSummary, Field, TextField } from '@/components/form/field';
import { FormScreen } from '@/components/form/form-screen';
import { ProvinceSelect } from '@/components/form/province-select';
import { TrashIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { EMPTY_FIELD, STAGES, validateField, type FieldDraft } from '@/domain/fields';
import { errorMessage, redirectForError } from '@/lib/api-errors';
import { cn } from '@/lib/utils';
import { hasErrors, mergeErrors } from '@/lib/form-errors';
import { COLORS } from '@/theme/tokens';

const NAMES: Record<keyof FieldDraft, string> = { name: 'Ad', crop: 'Ürün', stage: 'Dönem', area: 'Alan', province: 'İl', district: 'İlçe', expectedYield: 'Beklenen ürün', notes: 'Notlar' };
const num = (n: number) => String(n).replace('.', ',');

const fromField = (f: FieldSummary): FieldDraft => ({
  name: f.name,
  crop: f.crop,
  stage: f.stage,
  area: num(f.areaDonum),
  province: f.province,
  district: f.district,
  expectedYield: f.expectedYieldKg ? num(f.expectedYieldKg) : '',
  notes: f.notes,
});

/** "Tarla ekle" (and, with ?id=, editing a field): the website's form; a new field can then get its outline on the map. */
export default function FieldFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { loaded, signedIn } = useSignedIn();
  const me = useMe();
  const existing = useField(id ?? '');
  const title = id ? 'Tarlayı düzenle' : 'Tarla ekle';
  if (!loaded || (signedIn && (me.isPending || (id && existing.isPending)))) {
    return (
      <FormScreen title={title} footer={null}>
        <Loading />
      </FormScreen>
    );
  }
  if (!signedIn) {
    return (
      <FormScreen title={title} footer={null}>
        <SignInPrompt title="Tarlalarınız için giriş yapın" body="Tarla eklemek için giriş yapın." />
      </FormScreen>
    );
  }
  if (id && (existing.isError || !existing.data)) {
    return (
      <FormScreen title={title} footer={null}>
        <ErrorState error={existing.error} onRetry={() => existing.refetch()} />
      </FormScreen>
    );
  }
  return <FieldForm id={id} initial={id && existing.data ? fromField(existing.data.field) : { ...EMPTY_FIELD, province: me.data?.province ?? '' }} />;
}

function FieldForm({ id, initial }: { id?: string; initial: FieldDraft }) {
  const [f, setF] = useState<FieldDraft>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [server, setServer] = useState<Partial<Record<keyof FieldDraft, string>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const inputs = useRef<Partial<Record<keyof FieldDraft, TextInput | null>>>({});
  const dirty = useRef(false);

  const errors = mergeErrors(validateField(f), server);
  const shown = (k: keyof FieldDraft) => (submitted ? errors[k] : undefined);
  const set = <K extends keyof FieldDraft>(k: K, v: FieldDraft[K]) => {
    dirty.current = true;
    setServer((e) => ({ ...e, [k]: undefined }));
    setF((d) => ({ ...d, [k]: v }));
  };
  const summary = submitted ? (Object.keys(NAMES) as (keyof FieldDraft)[]).filter((k) => errors[k]) : [];
  const focusField = (k: keyof FieldDraft) => inputs.current[k]?.focus();

  const save = async () => {
    setSubmitted(true);
    setMessage(null);
    if (hasErrors(errors)) return scroll.current?.scrollTo({ y: 0, animated: true });
    setBusy(true);
    try {
      const res = await api<{ id: string }>(id ? `/tarlalar/${id}` : '/tarlalar', { method: id ? 'PUT' : 'POST', body: f });
      await refresh(keys.fields, keys.field(res.id), keys.calendar);
      dirty.current = false;
      if (id) return router.canGoBack() ? router.back() : router.replace({ pathname: '/tarlalar/[id]', params: { id } });
      router.replace({ pathname: '/tarlalar/[id]', params: { id: res.id } });
      Alert.alert('Tarla eklendi', 'Şimdi sınırını haritada çizmek ister misiniz? Alanı da haritadan hesaplarız.', [
        { text: 'Sonra', style: 'cancel' },
        { text: 'Haritada çiz', onPress: () => router.push({ pathname: '/sinir/[id]', params: { id: res.id } }) },
      ]);
    } catch (err) {
      if (redirectForError(err)) return;
      if (err instanceof ApiError && Object.keys(err.errors).length) setServer(err.errors);
      setMessage(errorMessage(err));
      scroll.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await api(`/tarlalar/${id}`, { method: 'DELETE' });
      queryClient.removeQueries({ queryKey: keys.field(id) });
      await refresh(keys.fields, keys.calendar);
      setConfirmDelete(false);
      router.dismissTo('/tarlalar');
    } catch (err) {
      Alert.alert('Silinemedi', errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const close = () => {
    const leave = () => (router.canGoBack() ? router.back() : router.replace('/tarlalar'));
    if (!dirty.current) return leave();
    Alert.alert('Değişiklikler kaydedilmedi', 'Çıkarsanız yazdıklarınız silinir.', [
      { text: 'Düzenlemeye devam et', style: 'cancel' },
      { text: 'Çık', style: 'destructive', onPress: leave },
    ]);
  };

  return (
    <FormScreen
      ref={scroll}
      title={id ? 'Tarlayı düzenle' : 'Tarla ekle'}
      onClose={close}
      footer={
        <Button className="h-14 rounded-full" disabled={busy} onPress={save} accessibilityState={{ busy }}>
          {busy ? <ActivityIndicator color={COLORS.white} /> : null}
          <Text className="text-[16px]">{busy ? 'Kaydediliyor…' : id ? 'Değişiklikleri kaydet' : 'Tarlayı ekle'}</Text>
        </Button>
      }>
      <ErrorSummary message={message ?? undefined} items={summary.map((k) => ({ key: k, label: NAMES[k], error: errors[k]! }))} onPick={focusField} />
      <TextField ref={(r) => {
          inputs.current.name = r;
        }} label="Tarlanın adı" required value={f.name} onChangeText={(t) => set('name', t)} error={shown('name')} placeholder="Örn. Buğday tarlası" maxLength={40} />
      <TextField ref={(r) => {
          inputs.current.crop = r;
        }} label="Ürün" value={f.crop} onChangeText={(t) => set('crop', t)} error={shown('crop')} placeholder="Örn. Ekmeklik buğday" maxLength={40} />
      <Field label="Dönem" error={shown('stage')}>
        <View className="flex-row flex-wrap gap-2">
          {STAGES.map((s) => {
            const on = f.stage === s;
            return (
              <Pressable key={s} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => set('stage', on ? '' : s)} className={cn('min-h-11 justify-center rounded-full border px-3.5', on ? 'border-primary bg-primary' : 'border-border bg-card active:bg-secondary')}>
                <Text className={cn('font-sans-semibold text-[14px]', on ? 'text-primary-foreground' : 'text-foreground')}>{s}</Text>
              </Pressable>
            );
          })}
        </View>
      </Field>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField ref={(r) => {
          inputs.current.area = r;
        }} label="Alan (dönüm)" required value={f.area} onChangeText={(t) => set('area', t)} error={shown('area')} keyboardType="decimal-pad" placeholder="Örn. 45" />
        </View>
        <View className="flex-1">
          <TextField ref={(r) => {
          inputs.current.expectedYield = r;
        }} label="Beklenen ürün (kg)" value={f.expectedYield} onChangeText={(t) => set('expectedYield', t)} error={shown('expectedYield')} keyboardType="decimal-pad" placeholder="Örn. 18.000" />
        </View>
      </View>
      <Text className="-mt-3 text-[13.5px] leading-5 text-muted-foreground">Alanı bilmiyorsanız tahmini yazın; sınırını haritada çizince hesaplarız.</Text>
      <ProvinceSelect label="İl" value={f.province} onChange={(v) => set('province', v)} error={shown('province')} allowEmpty />
      <TextField ref={(r) => {
          inputs.current.district = r;
        }} label="İlçe / köy" value={f.district} onChangeText={(t) => set('district', t)} error={shown('district')} maxLength={40} />
      <TextField ref={(r) => {
          inputs.current.notes = r;
        }} label="Notlar" value={f.notes} onChangeText={(t) => set('notes', t)} error={shown('notes')} multiline maxLength={500} placeholder="Örn. sulama kuyusu kuzey köşede" hint={`${f.notes.length}/500`} />

      {id ? (
        <Button variant="outline" className="mt-2 h-12 rounded-full border-destructive/50" onPress={() => setConfirmDelete(true)}>
          <TrashIcon size={20} weight="duotone" color={COLORS.destructive} />
          <Text className="text-destructive">Tarlayı sil</Text>
        </Button>
      ) : null}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        busy={deleting}
        title="Tarla silinsin mi?"
        body={`“${initial.name}” ve masrafları silinir. Takvimdeki işleri kalır, tarlasız olarak.`}
        action="Sil"
      />
    </FormScreen>
  );
}
