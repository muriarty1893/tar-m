import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import { keys, refresh, useField, useFields, useMe, useSignedIn } from '@/api/queries';
import type { FieldSummary, LatLng } from '@/api/types';
import { ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import FieldMapDom, { type MapFocus } from '@/components/dom/field-map-dom';
import { MAP_DOM, nextFocusKey, useDomStart } from '@/components/dom/use-dom-height';
import { MapSheet, MapTopBar, useMapInset } from '@/components/fields/map-parts';
import { ArrowUUpLeftIcon, EraserIcon, HandPointingIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { donumLabel } from '@/domain/fields';
import { BOUNDARY_MAX_POINTS, areaM2, donumOf, isDrawable } from '@/domain/geo';
import { provinceByName } from '@/domain/provinces';
import { useMyPosition } from '@/hooks/use-my-position';
import { errorMessage } from '@/lib/api-errors';
import { COLORS } from '@/theme/tokens';

/** Drawing a field's outline: tap its corners in order on the satellite map; the area is worked out as you go. */
export default function DrawBoundary() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loaded, signedIn } = useSignedIn();
  const q = useField(id);
  if (!loaded || (signedIn && q.isPending)) {
    return (
      <View className="flex-1 justify-center bg-background" style={{ paddingTop: insets.top }}>
        <Loading label="Harita yükleniyor…" />
      </View>
    );
  }
  if (!signedIn || q.isError || !q.data) {
    return (
      <View className="flex-1 justify-center bg-background px-4">
        <MapTopBar title="Sınır çiz" />
        {!signedIn ? <SignInPrompt title="Haritanız için giriş yapın" body="Tarlanızın sınırını çizmek için giriş yapın." /> : <ErrorState error={q.error} onRetry={() => q.refetch()} />}
      </View>
    );
  }
  return <Draw field={q.data.field} />;
}

function Draw({ field }: { field: FieldSummary }) {
  const view = useDomStart();
  const { inset, onSheetHeight } = useMapInset();
  const others = useFields();
  const me = useMe();
  const { locate, busy: locating } = useMyPosition();
  const [points, setPoints] = useState<LatLng[]>(field.boundary ?? []);
  const [position, setPosition] = useState<LatLng | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [saving, setSaving] = useState(false);
  const area = donumOf(areaM2(points));
  const ready = isDrawable(points);

  const othersLoaded = !!others.data;
  const context = useMemo(() => (others.data ?? []).filter((f): f is FieldSummary & { boundary: LatLng[] } => f.id !== field.id && !!f.boundary), [others.data, field.id]);
  // First view: this field's outline, else the other fields, else its province (or the home one).
  const initial = useMemo<MapFocus | null>(() => {
    if (field.boundary) return { key: 1, points: field.boundary };
    if (context.length) return { key: 1, points: context.flatMap((f) => f.boundary) };
    const p = provinceByName(field.province) ?? provinceByName(me.data?.province ?? '');
    return p ? { key: 1, points: [[p.lat, p.lon]], zoom: 12 } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [othersLoaded]);

  const goToMe = async () => {
    const p = await locate();
    if (!p) return;
    setPosition(p);
    setFocus({ key: nextFocusKey(), points: [p], zoom: 16 });
  };

  const add = async (lat: number, lng: number) => {
    setPoints((ps) => (ps.length >= BOUNDARY_MAX_POINTS ? ps : [...ps, [lat, lng]]));
  };

  const finish = () => (router.canGoBack() ? router.back() : router.replace({ pathname: '/tarlalar/[id]', params: { id: field.id } }));

  const save = async (boundary: LatLng[] | null) => {
    setSaving(true);
    try {
      await api(`/tarlalar/${field.id}/sinir`, { method: 'PUT', body: { boundary } });
      await refresh(keys.fields, keys.field(field.id));
      // The map's area differs from the one written down: offer to use it.
      if (boundary && area > 0 && Math.abs(area - field.areaDonum) / field.areaDonum > 0.05) {
        Alert.alert('Alan güncellensin mi?', `Haritaya göre tarlanız yaklaşık ${donumLabel(area)}. Kayıtlı alan ${donumLabel(field.areaDonum)}.`, [
          { text: 'Kayıtlı alan kalsın', style: 'cancel', onPress: finish },
          {
            text: `${donumLabel(area)} yap`,
            onPress: async () => {
              try {
                await api(`/tarlalar/${field.id}`, {
                  method: 'PUT',
                  body: {
                    name: field.name,
                    crop: field.crop,
                    stage: field.stage,
                    area: String(area).replace('.', ','),
                    province: field.province,
                    district: field.district,
                    expectedYield: field.expectedYieldKg ? String(field.expectedYieldKg).replace('.', ',') : '',
                    notes: field.notes,
                  },
                });
                await refresh(keys.fields, keys.field(field.id));
              } catch (err) {
                Alert.alert('Alan kaydedilemedi', errorMessage(err));
              }
              finish();
            },
          },
        ]);
      } else finish();
    } catch (err) {
      Alert.alert('Kaydedilemedi', errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const clearSaved = () =>
    Alert.alert('Sınır kaldırılsın mı?', `“${field.name}” haritadan kalkar; tarla ve masrafları silinmez.`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Kaldır', style: 'destructive', onPress: () => save(null) },
    ]);

  return (
    <View className="flex-1 bg-[#1f2937]">
      <FieldMapDom ref={view} fields={context.map((f) => ({ id: f.id, name: f.name, boundary: f.boundary }))} draft={points} drawing focus={focus ?? initial} me={position} onTap={add} inset={inset} dom={MAP_DOM} />
      <MapTopBar title={`${field.name}: sınır`} subtitle="Uydu görüntüsü" onLocate={goToMe} locating={locating} />

      <MapSheet onHeight={onSheetHeight}>
        <View className="flex-row items-start gap-2.5" accessibilityLiveRegion="polite">
          <HandPointingIcon size={24} weight="duotone" color={COLORS.primary} />
          <View className="min-w-0 flex-1">
            {points.length === 0 ? (
              <Text className="text-[14.5px] leading-5">Haritayı tarlanıza götürün (iki parmakla yakınlaştırın), sonra köşelerine sırayla dokunun.</Text>
            ) : points.length < 3 ? (
              <Text className="text-[14.5px] leading-5">
                {points.length} köşe işaretlendi. En az 3 köşe gerekiyor; sıradaki köşeye dokunun.
              </Text>
            ) : (
              <Text className="text-[14.5px] leading-5">
                <Text className="font-heading text-[17px]">≈ {donumLabel(area)}</Text> · {points.length} köşe. Başka köşe varsa dokunun, bitince kaydedin.
              </Text>
            )}
          </View>
        </View>
        <View className="flex-row gap-2">
          <Button variant="outline" className="h-12 flex-1 rounded-full bg-card" disabled={!points.length || saving} onPress={() => setPoints((ps) => ps.slice(0, -1))}>
            <ArrowUUpLeftIcon size={18} weight="bold" color={COLORS.foreground} />
            <Text>Son köşeyi sil</Text>
          </Button>
          <Button variant="outline" className="h-12 rounded-full bg-card px-4" disabled={!points.length || saving} onPress={() => setPoints([])} accessibilityLabel="Tüm köşeleri temizle">
            <EraserIcon size={18} weight="bold" color={COLORS.foreground} />
            <Text>Temizle</Text>
          </Button>
        </View>
        <Button className="h-14 rounded-full" disabled={!ready || saving} onPress={() => save(points)} accessibilityState={{ disabled: !ready || saving, busy: saving }}>
          {saving ? <ActivityIndicator color={COLORS.white} /> : null}
          <Text className="text-[16px]">{saving ? 'Kaydediliyor…' : ready ? 'Sınırı kaydet' : 'En az 3 köşe işaretleyin'}</Text>
        </Button>
        {field.boundary ? (
          <Button variant="ghost" className="h-11 rounded-full" disabled={saving} onPress={clearSaved}>
            <Text className="text-[14px] text-destructive">Sınırı haritadan kaldır</Text>
          </Button>
        ) : null}
      </MapSheet>
    </View>
  );
}
