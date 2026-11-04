import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View, type TextInput } from 'react-native';

import { ApiError, api } from '@/api/client';
import { keys, refresh, useListing, useMe, useSignedIn } from '@/api/queries';
import type { ListingDetail } from '@/api/types';
import { uploadPhoto } from '@/api/upload';
import { ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import { Choices, ErrorSummary, Field, TextField } from '@/components/form/field';
import { FormScreen } from '@/components/form/form-screen';
import { ProvinceSelect } from '@/components/form/province-select';
import { CameraIcon, ImageSquareIcon, WarningCircleIcon, XIcon } from '@/components/icons';
import { CATEGORY_ICONS } from '@/components/market/parts';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import {
  CATEGORIES,
  CONDITIONS,
  DESCRIPTION_MAX,
  EMPTY_DRAFT,
  MAX_PHOTOS,
  TITLE_MAX,
  UNITS,
  hasCondition,
  priceInput,
  soldByUnit,
  validateDraft,
  type DraftField,
  type ListingDraft,
} from '@/domain/market';
import { errorMessage, redirectForError } from '@/lib/api-errors';
import { hasErrors, mergeErrors } from '@/lib/form-errors';
import { COLORS } from '@/theme/tokens';

const FIELD_ORDER: DraftField[] = ['photos', 'title', 'category', 'condition', 'unit', 'price', 'quantity', 'province', 'district', 'description'];
const FIELD_NAMES: Record<DraftField, string> = {
  photos: 'Fotoğraflar',
  title: 'Başlık',
  category: 'Kategori',
  condition: 'Durum',
  unit: 'Birim',
  price: 'Fiyat',
  quantity: 'Miktar',
  negotiable: 'Pazarlık',
  province: 'İl',
  district: 'İlçe',
  description: 'Açıklama',
};
const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c.id !== 'tumu').map((c) => ({ id: c.id, label: c.label, Icon: CATEGORY_ICONS[c.id] }));

/** A photo in the form: uploading, uploaded (its address) or failed. */
type Photo = { key: string; uri: string; url?: string; failed?: boolean };

const fromListing = (l: ListingDetail): ListingDraft => ({
  title: l.title,
  category: l.category,
  condition: l.condition ?? '',
  price: priceInput(l.price),
  unit: l.unit ?? '',
  quantity: l.quantity ?? '',
  negotiable: l.negotiable,
  province: l.province,
  district: l.district,
  description: l.description,
  photos: l.stockPhoto ? [] : l.photos,
});

/** "İlan ver" (and, with ?id=, editing one's own listing): the website's form and checks. */
export default function ListingFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { loaded, signedIn } = useSignedIn();
  const me = useMe();
  const existing = useListing(id ?? '');
  const title = id ? 'İlanı düzenle' : 'İlan ver';

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
        <SignInPrompt title="İlan vermek için giriş yapın" body="İlanınızda adınız görünür ve alıcılar size uygulamadan ya da siteden yazabilir." />
      </FormScreen>
    );
  }
  if (id && (existing.isError || !existing.data?.listing.mine)) {
    return (
      <FormScreen title={title} footer={null}>
        <ErrorState error={existing.error ?? new ApiError(403, 'Bu ilanı düzenleyemezsiniz.')} onRetry={() => existing.refetch()} />
      </FormScreen>
    );
  }
  const initial = id && existing.data ? fromListing(existing.data.listing) : { ...EMPTY_DRAFT, province: me.data?.province ?? '' };
  return <ListingForm id={id} initial={initial} />;
}

function ListingForm({ id, initial }: { id?: string; initial: ListingDraft }) {
  const [draft, setDraft] = useState<ListingDraft>(initial);
  const [photos, setPhotos] = useState<Photo[]>(() => initial.photos.map((url) => ({ key: url, uri: url, url })));
  const [touched, setTouched] = useState<Partial<Record<DraftField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Partial<Record<DraftField, string>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const inputs = useRef<Partial<Record<DraftField, TextInput | null>>>({});
  const dirty = useRef(false);

  const uploading = photos.some((p) => !p.url && !p.failed);
  const full: ListingDraft = { ...draft, photos: photos.filter((p) => p.url).map((p) => p.url!) };
  const errors = mergeErrors(validateDraft(full), serverErrors);
  if (photos.some((p) => p.failed)) errors.photos = 'Bir fotoğraf yüklenemedi; kaldırıp yeniden ekleyin.';
  const shown = (f: DraftField) => (submitted || touched[f] ? errors[f] : undefined);
  const set = <K extends DraftField>(field: K, value: ListingDraft[K]) => {
    dirty.current = true;
    setServerErrors((e) => ({ ...e, [field]: undefined }));
    setDraft((d) => ({ ...d, [field]: value }));
  };
  const blur = (field: DraftField) => () => setTouched((t) => ({ ...t, [field]: true }));
  const byUnit = soldByUnit(draft.category);
  const summary = submitted ? FIELD_ORDER.filter((f) => errors[f]) : [];
  const focusField = (f: DraftField) => inputs.current[f]?.focus();

  const addPhotos = async (source: 'library' | 'camera') => {
    try {
      const left = MAX_PHOTOS - photos.length;
      if (left <= 0) return;
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert('Kamera izni gerekiyor', 'Fotoğraf çekmek için Ayarlar’dan kameraya izin verin ya da galeriden seçin.');
      }
      const res =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsMultipleSelection: true, selectionLimit: left });
      if (res.canceled) return;
      dirty.current = true;
      for (const asset of res.assets.slice(0, left)) {
        const key = `${asset.uri}-${Date.now()}`;
        setPhotos((ps) => [...ps, { key, uri: asset.uri }]);
        uploadPhoto(asset, 'ilanlar').then(
          (url) => setPhotos((ps) => ps.map((p) => (p.key === key ? { ...p, url } : p))),
          (err) => {
            setPhotos((ps) => ps.map((p) => (p.key === key ? { ...p, failed: true } : p)));
            redirectForError(err);
          }
        );
      }
    } catch {
      Alert.alert('Fotoğraf açılamadı', 'Galeri ya da kamera açılamadı. Fotoğrafsız da yayınlayabilirsiniz; kategorinin örnek fotoğrafı kullanılır.');
    }
  };

  const publish = async () => {
    setSubmitted(true);
    setMessage(null);
    if (uploading) return setMessage('Fotoğraflar yükleniyor; bitince yeniden dokunun.');
    if (hasErrors(errors)) {
      scroll.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setBusy(true);
    try {
      const res = await api<{ id: string }>(id ? `/ilanlar/${id}` : '/ilanlar', { method: id ? 'PUT' : 'POST', body: full });
      await refresh(keys.listings, keys.listing(res.id));
      dirty.current = false;
      if (id && router.canGoBack()) router.back();
      else if (id) router.replace({ pathname: '/ilan/[id]', params: { id } });
      else router.replace({ pathname: '/ilan/[id]', params: { id: res.id, yeni: '1' } });
    } catch (err) {
      if (redirectForError(err)) return;
      if (err instanceof ApiError && Object.keys(err.errors).length) setServerErrors(err.errors as Partial<Record<DraftField, string>>);
      setMessage(errorMessage(err));
      scroll.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    const leave = () => (router.canGoBack() ? router.back() : router.replace('/pazar'));
    if (!dirty.current) return leave();
    Alert.alert('Değişiklikler kaydedilmedi', 'Çıkarsanız yazdıklarınız silinir.', [
      { text: 'Düzenlemeye devam et', style: 'cancel' },
      { text: 'Çık', style: 'destructive', onPress: leave },
    ]);
  };

  return (
    <FormScreen
      ref={scroll}
      title={id ? 'İlanı düzenle' : 'İlan ver'}
      onClose={close}
      footer={
        <>
          {message && !summary.length ? (
            <Text role="alert" className="text-center text-[14px] text-destructive">
              {message}
            </Text>
          ) : null}
          <Button className="h-14 rounded-full" disabled={busy} onPress={publish} accessibilityState={{ busy }}>
            {busy ? <ActivityIndicator color={COLORS.white} /> : null}
            <Text className="text-[16px]">{busy ? 'Kaydediliyor…' : uploading ? 'Fotoğraflar yükleniyor…' : id ? 'Değişiklikleri kaydet' : 'İlanı yayınla'}</Text>
          </Button>
        </>
      }>
      <ErrorSummary
        title="Yayınlamadan önce düzeltin"
        message={summary.length ? (message ?? undefined) : undefined}
        items={summary.map((f) => ({ key: f, label: FIELD_NAMES[f], error: errors[f]! }))}
        onPick={focusField}
      />

      <Field label="Fotoğraflar" error={shown('photos')} hint={`En fazla ${MAX_PHOTOS}. Fotoğraf eklemezseniz kategorinin örnek fotoğrafı “Temsilî görsel” olarak kullanılır.`}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5" keyboardShouldPersistTaps="handled">
          {photos.length < MAX_PHOTOS ? (
            <>
              <PhotoTile label="Galeriden" onPress={() => addPhotos('library')}>
                <ImageSquareIcon size={26} weight="duotone" color={COLORS.primary} />
              </PhotoTile>
              <PhotoTile label="Fotoğraf çek" onPress={() => addPhotos('camera')}>
                <CameraIcon size={26} weight="duotone" color={COLORS.primary} />
              </PhotoTile>
            </>
          ) : null}
          {photos.map((p, i) => (
            <View key={p.key} className="size-[88px] overflow-hidden rounded-[16px] bg-muted">
              <Image source={{ uri: p.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" accessibilityLabel={`Fotoğraf ${i + 1}${p.failed ? ', yüklenemedi' : !p.url ? ', yükleniyor' : ''}`} />
              {!p.url && !p.failed ? (
                <View className="absolute inset-0 items-center justify-center bg-black/35">
                  <ActivityIndicator color={COLORS.white} />
                </View>
              ) : null}
              {p.failed ? (
                <View className="absolute inset-0 items-center justify-center bg-destructive/70">
                  <WarningCircleIcon size={26} weight="fill" color={COLORS.white} />
                </View>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Fotoğraf ${i + 1}’i kaldır`}
                onPress={() => {
                  dirty.current = true;
                  setPhotos((ps) => ps.filter((x) => x.key !== p.key));
                }}
                hitSlop={8}
                className="absolute right-1 top-1 size-8 items-center justify-center rounded-full bg-black/60">
                <XIcon size={15} weight="bold" color={COLORS.white} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </Field>

      <TextField
        ref={(r) => {
          inputs.current.title = r;
        }}
        label="Başlık"
        required
        value={draft.title}
        onChangeText={(t) => set('title', t)}
        onBlur={blur('title')}
        maxLength={TITLE_MAX}
        error={shown('title')}
        hint="Ne sattığınızı kısaca yazın: “Massey Ferguson 3085, 1994”."
      />

      <Field label="Kategori" required error={shown('category')}>
        <Choices
          label="Kategori"
          options={CATEGORY_OPTIONS}
          value={draft.category}
          onChange={(c) => {
            set('category', c);
            if (!hasCondition(c)) set('condition', '');
            setTouched((t) => ({ ...t, category: true }));
          }}
        />
      </Field>

      {hasCondition(draft.category) ? (
        <Field label="Durum" required error={shown('condition')}>
          <Choices label="Durum" options={CONDITIONS} value={draft.condition} onChange={(c) => set('condition', c)} />
        </Field>
      ) : null}

      {byUnit ? (
        <Field label="Fiyat birimi" required error={shown('unit')}>
          <Choices
            label="Fiyat birimi"
            options={UNITS.map((u) => ({ id: u, label: u }))}
            value={draft.unit}
            onChange={(u) => {
              set('unit', u);
              setTouched((t) => ({ ...t, unit: true }));
            }}
          />
        </Field>
      ) : null}

      <View className="flex-row gap-3">
        <View className="flex-[1.3]">
          <TextField
            ref={(r) => {
              inputs.current.price = r;
            }}
            label={byUnit && draft.unit ? `Fiyat (₺ / ${draft.unit})` : 'Fiyat (₺)'}
            required
            value={draft.price}
            onChangeText={(t) => set('price', t)}
            onBlur={blur('price')}
            keyboardType="decimal-pad"
            placeholder="Örn. 145.000"
            error={shown('price')}
          />
        </View>
        {byUnit ? (
          <View className="flex-1">
            <TextField
              ref={(r) => {
                inputs.current.quantity = r;
              }}
              label={draft.unit ? `Miktar (${draft.unit})` : 'Miktar'}
              value={draft.quantity}
              onChangeText={(t) => set('quantity', t)}
              onBlur={blur('quantity')}
              keyboardType="decimal-pad"
              placeholder="Örn. 25"
              maxLength={30}
              error={shown('quantity')}
            />
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: draft.negotiable }}
        onPress={() => set('negotiable', !draft.negotiable)}
        className="min-h-16 flex-row items-center justify-between gap-3 rounded-[16px] border border-border bg-card px-3.5 active:bg-secondary">
        <View className="flex-1">
          <Text className="font-sans-semibold text-[15px]">Pazarlık payı var</Text>
          <Text className="text-[13.5px] text-muted-foreground">Alıcılara teklif verebileceklerini gösterir.</Text>
        </View>
        <Switch checked={draft.negotiable} onCheckedChange={(v) => set('negotiable', v)} importantForAccessibility="no-hide-descendants" />
      </Pressable>

      <ProvinceSelect label="İl" required value={draft.province} onChange={(v) => set('province', v)} error={shown('province')} />
      <TextField
        ref={(r) => {
          inputs.current.district = r;
        }}
        label="İlçe"
        value={draft.district}
        onChangeText={(t) => set('district', t)}
        onBlur={blur('district')}
        maxLength={40}
        error={shown('district')}
        hint="Tam adresinizi yazmayın."
      />

      <TextField
        ref={(r) => {
          inputs.current.description = r;
        }}
        label="Açıklama"
        value={draft.description}
        onChangeText={(t) => set('description', t)}
        onBlur={blur('description')}
        multiline
        maxLength={DESCRIPTION_MAX}
        placeholder="Örn. durumu, kullanım süresi, teslim şekli…"
        error={shown('description')}
        hint={`${draft.description.length}/${DESCRIPTION_MAX}`}
      />
    </FormScreen>
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
