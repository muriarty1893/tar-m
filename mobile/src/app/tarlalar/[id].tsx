import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, api } from '@/api/client';
import { keys, refresh, useField, useSignedIn } from '@/api/queries';
import type { Expense, FieldDetail } from '@/api/types';
import { ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import { Choices, Field, TextField } from '@/components/form/field';
import {
  ArrowLeftIcon,
  CalendarPlusIcon,
  CameraIcon,
  CaretLeftIcon,
  CaretRightIcon,
  DropIcon,
  FirstAidKitIcon,
  FlaskIcon,
  GrainsIcon,
  PencilSimpleIcon,
  PlantIcon,
  PlusIcon,
  PolygonIcon,
  RulerIcon,
  ShovelIcon,
  SnowflakeIcon,
  TractorIcon,
  TrashIcon,
  WalletIcon,
  DotsThreeCircleIcon,
  type PhosphorIcon,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { TASK_KINDS, type TaskKind } from '@/domain/farm-calendar';
import { EXPENSE_KINDS, EXPENSE_KIND_IDS, cropPhoto, donumLabel, expensesByKind, tonsLabel, validateExpense, type ExpenseDraft } from '@/domain/fields';
import { addDays, dayKey, fromDayKey, monthName, relativeDayLabel } from '@/domain/format';
import { formatPrice, placeLabel } from '@/domain/market';
import { useNow } from '@/hooks/use-now';
import { errorMessage } from '@/lib/api-errors';
import { hasErrors, mergeErrors } from '@/lib/form-errors';
import { COLORS, KIND_COLORS, SHADOW } from '@/theme/tokens';

const KIND_ICONS: Record<TaskKind, PhosphorIcon> = {
  analiz: FlaskIcon,
  toprak: ShovelIcon,
  gubre: PlantIcon,
  ilac: FirstAidKitIcon,
  ekim: GrainsIcon,
  sulama: DropIcon,
  hasat: TractorIcon,
  uyari: SnowflakeIcon,
  diger: DotsThreeCircleIcon,
};

const back = () => (router.canGoBack() ? router.back() : router.replace('/tarlalar'));

/** One field: its facts and map outline, this season's expenses (add, delete), and its upcoming tasks. */
export default function FieldScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loaded, signedIn } = useSignedIn();
  const q = useField(id);
  if (!loaded || (signedIn && q.isPending)) {
    return (
      <View className="flex-1 justify-center bg-background" style={{ paddingTop: insets.top }}>
        <Loading label="Tarla yükleniyor…" />
      </View>
    );
  }
  if (!signedIn || q.isError || !q.data) {
    return (
      <View className="flex-1 justify-center gap-3 bg-background px-6" style={{ paddingTop: insets.top }}>
        {!signedIn ? <SignInPrompt title="Tarlalarınız için giriş yapın" body="Bu tarlayı görmek için giriş yapın." /> : <ErrorState error={q.error} onRetry={() => q.refetch()} />}
        <Button variant="outline" className="h-12 rounded-full bg-card" onPress={back}>
          <Text>Tarlalarıma dön</Text>
        </Button>
      </View>
    );
  }
  return <FieldView data={q.data} />;
}

function FieldView({ data }: { data: FieldDetail }) {
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { field: f, expenses, tasks } = data;
  const [adding, setAdding] = useState(false);
  const total = expenses.reduce((n, x) => n + x.amount, 0);
  const byKind = expensesByKind(expenses);

  const removeExpense = (x: Expense) =>
    Alert.alert('Masraf silinsin mi?', `${EXPENSE_KINDS[x.kind]}: ${formatPrice(x.amount)}`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await api(`/masraflar/${x.id}`, { method: 'DELETE' });
            await refresh(keys.field(f.id), keys.fields);
          } catch (err) {
            Alert.alert('Silinemedi', errorMessage(err));
          }
        },
      },
    ]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="h-[220px] overflow-hidden bg-muted">
          <Image source={cropPhoto(f.crop, f.name)} style={{ position: 'absolute', inset: 0 }} contentFit="cover" accessible={false} />
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent']} locations={[0, 0.45]} style={{ position: 'absolute', inset: 0 }} />
          <View className="absolute inset-x-4 flex-row justify-between" style={{ top: insets.top + 8 }}>
            <RoundButton label="Geri" onPress={back}>
              <ArrowLeftIcon size={21} weight="bold" color={COLORS.foreground} />
            </RoundButton>
            <RoundButton label="Tarlayı düzenle" onPress={() => router.push({ pathname: '/tarlalar/duzenle', params: { id: f.id } })}>
              <PencilSimpleIcon size={21} weight="bold" color={COLORS.foreground} />
            </RoundButton>
          </View>
        </View>

        <View className="-mt-4 gap-4 rounded-t-[26px] bg-background px-4 pt-4">
          <View className="gap-1.5">
            {f.stage ? (
              <View className="self-start rounded-full bg-secondary px-2.5 py-0.5">
                <Text className="font-sans-semibold text-[12.5px] text-primary">{f.stage}</Text>
              </View>
            ) : null}
            <Text role="heading" className="font-heading text-[26px] leading-8">
              {f.name}
            </Text>
            <Text className="text-[14px] text-muted-foreground">{[f.crop, f.province ? placeLabel(f.province, f.district) : ''].filter(Boolean).join(' · ') || 'Ürün ve yer yazılmadı'}</Text>
          </View>

          <View className="flex-row gap-2">
            <Fact Icon={RulerIcon} label="Alan" value={donumLabel(f.areaDonum)} />
            <Fact Icon={GrainsIcon} label="Beklenen ürün" value={f.expectedYieldKg ? tonsLabel(f.expectedYieldKg) : '—'} />
            <Fact Icon={WalletIcon} label="Dönüm başına" value={total ? formatPrice(Math.round(total / f.areaDonum)) : '—'} />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(f.boundary ? { pathname: '/harita', params: { tarla: f.id } } : { pathname: '/sinir/[id]', params: { id: f.id } })}
            className="flex-row items-center gap-3 rounded-[20px] border border-primary/30 bg-secondary p-3.5 active:opacity-80">
            <View className="size-11 items-center justify-center rounded-[14px] bg-primary">
              <PolygonIcon size={22} weight="bold" color={COLORS.white} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-sans-bold text-[15.5px] text-primary">{f.boundary ? 'Haritada gör' : 'Sınırını haritada çiz'}</Text>
              <Text className="text-[13px] leading-5 text-foreground/80">{f.boundary ? `${f.boundary.length} köşe çizildi.` : 'Uydu görüntüsünde tarlanızın köşelerine dokunun; alanı biz hesaplayalım.'}</Text>
            </View>
            <CaretRightIcon size={18} weight="bold" color={COLORS.primary} />
          </Pressable>
          {f.boundary ? (
            <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/sinir/[id]', params: { id: f.id } })} className="-mt-2 min-h-11 items-center justify-center self-start px-1 active:opacity-60">
              <Text className="font-sans-semibold text-[14px] text-primary underline">Sınırı yeniden çiz</Text>
            </Pressable>
          ) : null}

          <View className="gap-2.5 rounded-[20px] border border-border bg-card p-3.5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <WalletIcon size={20} weight="duotone" color={COLORS.primary} />
                <Text role="heading" className="font-heading text-[17px]">
                  Bu sezonki masraflar
                </Text>
              </View>
              <Text className="font-heading text-[17px]">{formatPrice(total)}</Text>
            </View>
            {byKind.map((e) => {
              const share = total ? Math.round((e.amount / total) * 100) : 0;
              return (
                <View key={e.kind} className="gap-1" accessible accessibilityLabel={`${EXPENSE_KINDS[e.kind]}: ${formatPrice(e.amount)}, harcamanın yüzde ${share}'i`}>
                  <View className="flex-row justify-between">
                    <Text className="text-[14px]">{EXPENSE_KINDS[e.kind]}</Text>
                    <Text className="font-sans-semibold text-[14px]">{formatPrice(e.amount)}</Text>
                  </View>
                  <Progress value={share} className="h-1.5 bg-muted" indicatorClassName="bg-primary" />
                </View>
              );
            })}
            {expenses.length ? (
              <View className="mt-1 border-t border-border pt-1">
                {expenses.map((x) => (
                  <View key={x.id} className="min-h-12 flex-row items-center gap-2 border-b border-border/60 py-1.5 last:border-b-0">
                    <View className="min-w-0 flex-1">
                      <Text className="text-[14px]">
                        {EXPENSE_KINDS[x.kind]}
                        {x.note ? <Text className="text-[13px] text-muted-foreground"> · {x.note}</Text> : null}
                      </Text>
                      <Text className="text-[12.5px] text-muted-foreground">{relativeDayLabel(fromDayKey(x.date), now)}</Text>
                    </View>
                    <Text className="font-sans-semibold text-[14px]">{formatPrice(x.amount)}</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Sil: ${EXPENSE_KINDS[x.kind]}, ${formatPrice(x.amount)}`} onPress={() => removeExpense(x)} className="size-11 items-center justify-center rounded-full active:bg-secondary">
                      <TrashIcon size={19} weight="duotone" color={COLORS.mutedForeground} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-[14px] text-muted-foreground">Henüz masraf yok. Tohum, gübre, mazot gibi harcamalarınızı ekleyin; dönüm başına maliyeti görün.</Text>
            )}
            {adding ? (
              <ExpenseForm fieldId={f.id} onDone={() => setAdding(false)} />
            ) : (
              <Button variant="outline" className="mt-1 h-12 rounded-full bg-card" onPress={() => setAdding(true)}>
                <PlusIcon size={18} weight="bold" color={COLORS.primary} />
                <Text className="text-primary">Masraf ekle</Text>
              </Button>
            )}
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text role="heading" className="font-heading text-[17px]">
                Yaklaşan işler
              </Text>
              <Button variant="ghost" size="sm" className="h-11 rounded-full" onPress={() => router.push({ pathname: '/gorev', params: { tarla: f.id } })}>
                <CalendarPlusIcon size={18} weight="duotone" color={COLORS.primary} />
                <Text className="text-[14px] text-primary">İş ekle</Text>
              </Button>
            </View>
            {tasks.length ? (
              tasks.map((t) => {
                const Icon = KIND_ICONS[t.kind];
                const k = KIND_COLORS[t.kind];
                return (
                  <View key={t.id} className="flex-row items-center gap-3 rounded-[18px] border border-border bg-card px-3 py-2.5">
                    <View className="size-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: k.tile }}>
                      <Icon size={22} weight="duotone" color={k.icon} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="font-sans-semibold text-[14.5px]">{t.title}</Text>
                      <Text className="text-[12.5px] text-muted-foreground">{[TASK_KINDS[t.kind].label, relativeDayLabel(fromDayKey(t.date), now), t.time].filter(Boolean).join(' · ')}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text className="rounded-[18px] border border-dashed border-border px-4 py-4 text-center text-[14px] text-muted-foreground">Bu tarla için yaklaşan iş yok.</Text>
            )}
          </View>

          {f.notes ? (
            <View className="gap-1 rounded-[20px] border border-border bg-card p-3.5">
              <Text className="font-sans-bold text-[12.5px] tracking-[1.6px] text-muted-foreground">NOTLAR</Text>
              <Text className="text-[15px] leading-6">{f.notes}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 border-t border-border bg-card px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <Button variant="outline" className="h-14 rounded-full bg-card" onPress={() => router.push('/tara')}>
          <CameraIcon size={20} weight="bold" color={COLORS.primary} />
          <Text className="text-primary">Bu tarlayı tara (örnek)</Text>
        </Button>
      </View>
    </View>
  );
}

/** "Masraf ekle": kind, amount, the day (no future days), a short note. */
function ExpenseForm({ fieldId, onDone }: { fieldId: string; onDone: () => void }) {
  const today = dayKey(new Date());
  const [x, setX] = useState<ExpenseDraft>({ kind: '', amount: '', date: today, note: '' });
  const [submitted, setSubmitted] = useState(false);
  const [server, setServer] = useState<Partial<Record<keyof ExpenseDraft, string>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const errors = mergeErrors(validateExpense(x, today), server);
  const shown = (k: keyof ExpenseDraft) => (submitted ? errors[k] : undefined);
  const set = <K extends keyof ExpenseDraft>(k: K, v: ExpenseDraft[K]) => {
    setServer((e) => ({ ...e, [k]: undefined }));
    setX((d) => ({ ...d, [k]: v }));
  };
  const date = fromDayKey(x.date);
  const save = async () => {
    setSubmitted(true);
    setMessage(null);
    if (hasErrors(errors)) return;
    setBusy(true);
    try {
      await api(`/tarlalar/${fieldId}/masraf`, { method: 'POST', body: x });
      await refresh(keys.field(fieldId), keys.fields);
      onDone();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.errors).length) setServer(err.errors);
      else setMessage(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View className="mt-1 gap-4 rounded-[18px] border border-primary/30 bg-background p-3">
      <Field label="Türü" required error={shown('kind')}>
        <Choices label="Masraf türü" options={EXPENSE_KIND_IDS.map((id) => ({ id, label: EXPENSE_KINDS[id] }))} value={x.kind} onChange={(k) => set('kind', k)} />
      </Field>
      <TextField label="Tutar (₺)" required value={x.amount} onChangeText={(t) => set('amount', t)} error={shown('amount')} keyboardType="decimal-pad" placeholder="Örn. 12.500" />
      <Field label="Tarih" required error={shown('date')}>
        <View className="h-14 flex-row items-center gap-2 rounded-[16px] border border-input bg-card px-1.5">
          <Pressable accessibilityRole="button" accessibilityLabel="Önceki gün" onPress={() => set('date', dayKey(addDays(date, -1)))} className="size-11 items-center justify-center rounded-full active:bg-secondary">
            <CaretLeftIcon size={20} weight="bold" color={COLORS.foreground} />
          </Pressable>
          <Text className="flex-1 text-center font-sans-semibold text-[15px]" accessibilityLiveRegion="polite">
            {x.date === today ? 'Bugün' : `${date.getDate()} ${monthName(date.getMonth())} ${date.getFullYear()}`}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sonraki gün"
            accessibilityState={{ disabled: x.date >= today }}
            disabled={x.date >= today}
            onPress={() => set('date', dayKey(addDays(date, 1)))}
            className="size-11 items-center justify-center rounded-full active:bg-secondary disabled:opacity-30">
            <CaretRightIcon size={20} weight="bold" color={COLORS.foreground} />
          </Pressable>
        </View>
      </Field>
      <TextField label="Not (isteğe bağlı)" value={x.note} onChangeText={(t) => set('note', t)} error={shown('note')} maxLength={120} placeholder="Örn. 20 çuval DAP" />
      {message ? (
        <Text role="alert" className="text-[14px] text-destructive">
          {message}
        </Text>
      ) : null}
      <View className="flex-row gap-2">
        <Button variant="outline" className="h-12 flex-1 rounded-full bg-card" disabled={busy} onPress={onDone}>
          <Text>Vazgeç</Text>
        </Button>
        <Button className="h-12 flex-1 rounded-full" disabled={busy} onPress={save} accessibilityState={{ busy }}>
          {busy ? <ActivityIndicator color={COLORS.white} /> : null}
          <Text>Ekle</Text>
        </Button>
      </View>
    </View>
  );
}

function RoundButton({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} className="size-12 items-center justify-center rounded-full bg-white/95 active:scale-95" style={{ boxShadow: SHADOW.soft }}>
      {children}
    </Pressable>
  );
}

function Fact({ Icon, label, value }: { Icon: PhosphorIcon; label: string; value: string }) {
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-[16px] border border-border bg-card px-2.5 py-2.5" accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon size={18} weight="duotone" color={COLORS.primary} />
      <Text className="text-[12px] text-muted-foreground">{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit className="font-heading text-[16px]">
        {value}
      </Text>
    </View>
  );
}
