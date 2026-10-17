import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraIcon, ImageSquareIcon, WarningCircleIcon, XIcon } from '@/components/icons';
import { CATEGORY_ICONS } from '@/components/market/parts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { CATEGORIES, CONDITIONS, DESCRIPTION_MAX, ME, SOLD_BY_UNIT, UNITS, validateDraft, type DraftField, type ListingCategory, type ListingDraft } from '@/domain/market';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';
import { COLORS } from '@/theme/tokens';

const MAX_PHOTOS = 5;
const FIELD_ORDER: DraftField[] = ['title', 'category', 'unit', 'price', 'location', 'description'];
const FIELD_NAMES: Partial<Record<DraftField, string>> = { title: 'Başlık', category: 'Kategori', unit: 'Birim', price: 'Fiyat', location: 'Konum', description: 'Açıklama' };

const EMPTY: ListingDraft = { title: '', category: null, condition: 'ikinci-el', price: '', unit: '', quantity: '', location: ME.place, description: '', negotiable: true, photos: [] };

/** "İlan ver": photos, what it is, the price, where; checked as you go and before publishing. */
export default function NewListing() {
  const insets = useSafeAreaInsets();
  const addListing = useAppStore((s) => s.addListing);
  const [draft, setDraft] = useState<ListingDraft>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<DraftField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const inputs = useRef<Partial<Record<DraftField, TextInput | null>>>({});

  const errors = validateDraft(draft);
  const shown = (f: DraftField) => (submitted || touched[f] ? errors[f] : undefined);
  const set = <K extends DraftField>(field: K, value: ListingDraft[K]) => setDraft((d) => ({ ...d, [field]: value }));
  const blur = (field: DraftField) => () => setTouched((t) => ({ ...t, [field]: true }));
  const byUnit = !!draft.category && SOLD_BY_UNIT.includes(draft.category);
  const summary = submitted ? FIELD_ORDER.filter((f) => errors[f]) : [];

  const addPhotos = async (source: 'library' | 'camera') => {
    try {
      const left = MAX_PHOTOS - draft.photos.length;
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return;
      }
      const res =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsMultipleSelection: true, selectionLimit: left });
      if (!res.canceled) set('photos', [...draft.photos, ...res.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
    } catch {
      // The picker couldn't open; the stock photo for the category is used instead.
    }
  };

  const publish = () => {
    setSubmitted(true);
    if (Object.keys(errors).length) {
      scroll.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const id = addListing(draft);
      router.replace({ pathname: '/ilan/[id]', params: { id, yeni: '1' } });
    }, 700);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-row items-center gap-3 border-b border-border px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={() => router.back()} className="size-11 items-center justify-center rounded-full active:bg-secondary">
          <XIcon size={22} weight="bold" color={COLORS.foreground} />
        </Pressable>
        <Text role="heading" className="font-heading text-[20px]">
          İlan ver
        </Text>
      </View>

      <ScrollView ref={scroll} contentContainerClassName="gap-5 px-4 pb-8 pt-4" keyboardShouldPersistTaps="handled">
        {summary.length ? (
          <View className="gap-1.5 rounded-[16px] border border-destructive/40 bg-destructive/5 p-3.5" role="alert">
            <View className="flex-row items-center gap-2">
              <WarningCircleIcon size={20} weight="fill" color={COLORS.destructive} />
              <Text className="font-sans-bold text-[15px] text-destructive">Yayınlamadan önce düzeltin</Text>
            </View>
            {summary.map((f) => (
              <Pressable key={f} accessibilityRole="link" onPress={() => inputs.current[f]?.focus()} className="min-h-9 justify-center">
                <Text className="text-[14px] text-destructive underline">
                  {FIELD_NAMES[f]}: {errors[f]}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Field label="Fotoğraflar" hint={`En fazla ${MAX_PHOTOS}. Fotoğraf eklemezseniz kategorinin örnek fotoğrafı kullanılır.`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5" keyboardShouldPersistTaps="handled">
            {draft.photos.length < MAX_PHOTOS ? (
              <>
                <PhotoTile label="Galeriden" onPress={() => addPhotos('library')}>
                  <ImageSquareIcon size={26} weight="duotone" color={COLORS.primary} />
                </PhotoTile>
                <PhotoTile label="Fotoğraf çek" onPress={() => addPhotos('camera')}>
                  <CameraIcon size={26} weight="duotone" color={COLORS.primary} />
                </PhotoTile>
              </>
            ) : null}
            {draft.photos.map((uri, i) => (
              <View key={uri} className="size-[88px] overflow-hidden rounded-[16px]">
                <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" accessibilityLabel={`Fotoğraf ${i + 1}`} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Fotoğraf ${i + 1}’i kaldır`}
                  onPress={() => set('photos', draft.photos.filter((p) => p !== uri))}
                  hitSlop={8}
                  className="absolute right-1 top-1 size-7 items-center justify-center rounded-full bg-black/60">
                  <XIcon size={15} weight="bold" color={COLORS.white} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </Field>

        <Field label="Başlık" required error={shown('title')} hint="Ne sattığınızı kısaca yazın: “Massey Ferguson 3085, 1994”.">
          <Input
            ref={(r) => {
              inputs.current.title = r;
            }}
            value={draft.title}
            onChangeText={(t) => set('title', t)}
            onBlur={blur('title')}
            maxLength={70}
            accessibilityLabel="Başlık"
            className={inputClass(shown('title'))}
          />
        </Field>

        <Field label="Kategori" required error={shown('category')}>
          <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup" accessibilityLabel="Kategori">
            {CATEGORIES.filter((c) => c.id !== 'tumu').map((c) => {
              const on = draft.category === c.id;
              const Icon = CATEGORY_ICONS[c.id];
              return (
                <Pressable
                  key={c.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  onPress={() => {
                    set('category', c.id as ListingCategory);
                    setTouched((t) => ({ ...t, category: true }));
                  }}
                  className={cn('min-h-11 flex-row items-center gap-1.5 rounded-full border px-3.5', on ? 'border-primary bg-primary' : 'border-border bg-card active:bg-secondary')}>
                  <Icon size={18} weight="duotone" color={on ? COLORS.white : COLORS.primary} />
                  <Text className={cn('font-sans-semibold text-[14px]', on ? 'text-primary-foreground' : 'text-foreground')}>{c.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        {draft.category && draft.category !== 'urun' ? (
          <Field label="Durum">
            <View className="flex-row gap-2" accessibilityRole="radiogroup" accessibilityLabel="Durum">
              {CONDITIONS.map((c) => (
                <Option key={c.id} label={c.label} on={draft.condition === c.id} onPress={() => set('condition', c.id)} />
              ))}
            </View>
          </Field>
        ) : null}

        {byUnit ? (
          <Field label="Fiyat birimi" required error={shown('unit')}>
            <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup" accessibilityLabel="Fiyat birimi">
              {UNITS.map((u) => (
                <Option
                  key={u}
                  label={u}
                  on={draft.unit === u}
                  onPress={() => {
                    set('unit', u);
                    setTouched((t) => ({ ...t, unit: true }));
                  }}
                />
              ))}
            </View>
          </Field>
        ) : null}

        <View className="flex-row gap-3">
          <View className="flex-[1.3]">
            <Field label={byUnit && draft.unit ? `Fiyat (₺ / ${draft.unit})` : 'Fiyat (₺)'} required error={shown('price')}>
              <Input
                ref={(r) => {
                  inputs.current.price = r;
                }}
                value={draft.price}
                onChangeText={(t) => set('price', t)}
                onBlur={blur('price')}
                keyboardType="decimal-pad"
                placeholder="Örn. 145.000"
                accessibilityLabel="Fiyat, Türk lirası"
                className={inputClass(shown('price'))}
              />
            </Field>
          </View>
          {byUnit ? (
            <View className="flex-1">
              <Field label={draft.unit ? `Miktar (${draft.unit})` : 'Miktar'}>
                <Input value={draft.quantity} onChangeText={(t) => set('quantity', t)} keyboardType="decimal-pad" placeholder="Örn. 25" accessibilityLabel="Miktar" className={inputClass()} />
              </Field>
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: draft.negotiable }}
          onPress={() => set('negotiable', !draft.negotiable)}
          className="min-h-14 flex-row items-center justify-between gap-3 rounded-[16px] border border-border bg-card px-3.5 active:bg-secondary">
          <View className="flex-1">
            <Text className="font-sans-semibold text-[15px]">Pazarlık payı var</Text>
            <Text className="text-[13px] text-muted-foreground">Alıcılar size teklif gönderebilir.</Text>
          </View>
          <Switch checked={draft.negotiable} onCheckedChange={(v) => set('negotiable', v)} importantForAccessibility="no-hide-descendants" />
        </Pressable>

        <Field label="Konum" required error={shown('location')} hint="İlçe ve il; tam adresinizi yazmayın.">
          <Input
            ref={(r) => {
              inputs.current.location = r;
            }}
            value={draft.location}
            onChangeText={(t) => set('location', t)}
            onBlur={blur('location')}
            accessibilityLabel="Konum, ilçe ve il"
            className={inputClass(shown('location'))}
          />
        </Field>

        <Field label="Açıklama" error={shown('description')} hint={`${draft.description.length}/${DESCRIPTION_MAX}`}>
          <Input
            ref={(r) => {
              inputs.current.description = r;
            }}
            value={draft.description}
            onChangeText={(t) => set('description', t)}
            onBlur={blur('description')}
            multiline
            textAlignVertical="top"
            placeholder="Örn. durumu, kullanım süresi, teslim şekli…"
            accessibilityLabel="Açıklama"
            className={cn(inputClass(shown('description')), 'h-32 py-3')}
          />
        </Field>
      </ScrollView>

      <View className="border-t border-border bg-card px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <Button className="rounded-full" disabled={busy} onPress={publish} accessibilityState={{ busy }}>
          <Text>{busy ? 'Yayınlanıyor…' : 'İlanı yayınla'}</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const inputClass = (error?: string) => cn('h-12 rounded-[14px] bg-card font-sans text-[15px] shadow-none', error ? 'border-destructive' : 'border-input');

function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text className="font-sans-semibold text-[14.5px]">
        {label}
        {required ? <Text className="text-[14.5px] text-destructive"> *</Text> : null}
      </Text>
      {children}
      {error ? (
        <View className="flex-row items-center gap-1.5">
          <WarningCircleIcon size={15} weight="fill" color={COLORS.destructive} />
          <Text className="flex-1 text-[13px] text-destructive">{error}</Text>
        </View>
      ) : hint ? (
        <Text className="text-[13px] text-muted-foreground">{hint}</Text>
      ) : null}
    </View>
  );
}

function Option({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={onPress} className={cn('min-h-11 min-w-11 items-center justify-center rounded-full border px-4', on ? 'border-primary bg-primary' : 'border-border bg-card active:bg-secondary')}>
      <Text className={cn('font-sans-semibold text-[14px]', on ? 'text-primary-foreground' : 'text-foreground')}>{label}</Text>
    </Pressable>
  );
}

function PhotoTile({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} className="size-[88px] items-center justify-center gap-1 rounded-[16px] border-2 border-dashed border-primary/40 bg-secondary/60 active:bg-secondary">
      {children}
      <Text className="font-sans-semibold text-[12px] text-primary">{label}</Text>
    </Pressable>
  );
}
