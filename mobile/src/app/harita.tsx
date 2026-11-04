import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { useFields, useMe, useSignedIn } from '@/api/queries';
import type { FieldSummary, LatLng } from '@/api/types';
import { ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import FieldMapDom, { type MapFocus } from '@/components/dom/field-map-dom';
import { MAP_DOM, nextFocusKey, useDomStart } from '@/components/dom/use-dom-height';
import { MapSheet, MapTopBar, useMapInset } from '@/components/fields/map-parts';
import { CaretRightIcon, PlusIcon, PolygonIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { donumLabel } from '@/domain/fields';
import { areaM2, donumOf } from '@/domain/geo';
import { formatPrice } from '@/domain/market';
import { provinceByName } from '@/domain/provinces';
import { useMyPosition } from '@/hooks/use-my-position';
import { COLORS } from '@/theme/tokens';

/**
 * "Tarla Haritası": the farmer's fields outlined on a satellite map, with their names. Tap one for its
 * details; fields not drawn yet are listed with "Çiz". ?tarla= opens on that field.
 */
export default function FieldMap() {
  const { loaded, signedIn } = useSignedIn();
  const fields = useFields();
  const me = useMe();
  const { tarla } = useLocalSearchParams<{ tarla?: string }>();
  const view = useDomStart();
  const { inset, onSheetHeight } = useMapInset();
  const { locate, busy: locating } = useMyPosition();
  const [selectedId, setSelectedId] = useState<string | null>(tarla ?? null);
  const [position, setPosition] = useState<LatLng | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);

  const list = fields.data ?? [];
  const drawn = list.filter((f): f is FieldSummary & { boundary: LatLng[] } => !!f.boundary);
  const undrawn = list.filter((f) => !f.boundary);
  const selected = drawn.find((f) => f.id === selectedId) ?? null;
  const fieldsLoaded = !!fields.data;

  // First view: the asked field, else all the outlines, else the home province.
  const initial = useMemo<MapFocus | null>(() => {
    if (!fields.data) return null;
    const asked = drawn.find((f) => f.id === tarla);
    if (asked) return { key: 1, points: asked.boundary };
    if (drawn.length) return { key: 1, points: drawn.flatMap((f) => f.boundary) };
    const p = provinceByName(me.data?.province ?? '');
    return p ? { key: 1, points: [[p.lat, p.lon]], zoom: 11 } : null;
    // The first view is set once, when the fields arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsLoaded]);

  const goToMe = async () => {
    const p = await locate();
    if (!p) return;
    setPosition(p);
    setFocus({ key: nextFocusKey(), points: [p], zoom: 15 });
  };
  const select = (f: FieldSummary & { boundary: LatLng[] }) => {
    setSelectedId(f.id);
    setFocus({ key: nextFocusKey(), points: f.boundary });
  };

  if (!loaded || (signedIn && fields.isPending)) return <Centered><Loading label="Harita yükleniyor…" /></Centered>;
  if (!signedIn) return <Centered><SignInPrompt title="Haritanız için giriş yapın" body="Tarlalarınızın sınırlarını uydu görüntüsü üzerinde çizin ve görün." /></Centered>;
  if (fields.isError) return <Centered><ErrorState error={fields.error} onRetry={() => fields.refetch()} /></Centered>;

  return (
    <View className="flex-1 bg-[#1f2937]">
      <FieldMapDom
        ref={view}
        fields={drawn.map((f) => ({ id: f.id, name: f.name, boundary: f.boundary }))}
        selectedId={selectedId}
        focus={focus ?? initial}
        me={position}
        onSelect={async (id) => setSelectedId(id)}
        inset={inset} dom={MAP_DOM}
      />
      <MapTopBar title="Tarla Haritası" subtitle={`${drawn.length} / ${list.length} tarla haritada`} onLocate={goToMe} locating={locating} />

      <MapSheet onHeight={onSheetHeight}>
        {selected ? (
          <View className="gap-3" accessibilityLiveRegion="polite">
            <View className="flex-row items-start gap-3">
              <View className="min-w-0 flex-1">
                <Text role="heading" className="font-heading text-[19px]">
                  {selected.name}
                </Text>
                <Text className="text-[13.5px] text-muted-foreground">{[selected.crop, donumLabel(selected.areaDonum), selected.stage].filter(Boolean).join(' · ')}</Text>
                <Text className="mt-0.5 text-[13px] text-muted-foreground">
                  Haritaya göre ≈ {donumLabel(donumOf(areaM2(selected.boundary)))} · Masraf {formatPrice(selected.expenses)}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <Button variant="outline" className="h-12 flex-1 rounded-full bg-card" onPress={() => router.push({ pathname: '/sinir/[id]', params: { id: selected.id } })}>
                <PolygonIcon size={18} weight="duotone" color={COLORS.primary} />
                <Text className="text-primary">Sınırı düzenle</Text>
              </Button>
              <Button className="h-12 flex-1 rounded-full" onPress={() => router.push({ pathname: '/tarlalar/[id]', params: { id: selected.id } })}>
                <Text>Tarlaya git</Text>
                <CaretRightIcon size={16} weight="bold" color={COLORS.white} />
              </Button>
            </View>
          </View>
        ) : list.length === 0 ? (
          <View className="gap-2">
            <Text className="font-heading text-[18px]">Henüz tarla yok</Text>
            <Text className="text-[14px] leading-5 text-muted-foreground">Önce tarlanızı ekleyin, sonra sınırını bu haritada çizin.</Text>
            <Button className="h-12 rounded-full" onPress={() => router.push('/tarlalar/duzenle')}>
              <PlusIcon size={18} weight="bold" color={COLORS.white} />
              <Text>Tarla ekle</Text>
            </Button>
          </View>
        ) : (
          <Text className="text-[14px] leading-5 text-muted-foreground">{drawn.length ? 'Ayrıntıları görmek için bir tarlaya dokunun.' : 'Tarlalarınızın sınırı henüz çizilmedi. Birini seçip köşelerine dokunarak çizin.'}</Text>
        )}

        {drawn.length > 1 || (drawn.length && !selected) ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2" accessibilityLabel="Haritadaki tarlalar">
            {drawn.map((f) => (
              <Pressable key={f.id} accessibilityRole="button" accessibilityState={{ selected: f.id === selectedId }} onPress={() => select(f)} className={`min-h-11 justify-center rounded-full border px-3.5 ${f.id === selectedId ? 'border-primary bg-primary' : 'border-border bg-card active:bg-secondary'}`}>
                <Text className={`font-sans-semibold text-[14px] ${f.id === selectedId ? 'text-primary-foreground' : ''}`}>{f.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {undrawn.length ? (
          <View className="gap-1.5">
            <Text className="font-sans-semibold text-[13px] text-muted-foreground">Sınırı çizilmemiş</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
              {undrawn.map((f) => (
                <Pressable key={f.id} accessibilityRole="button" accessibilityLabel={`${f.name}: sınırını çiz`} onPress={() => router.push({ pathname: '/sinir/[id]', params: { id: f.id } })} className="min-h-11 flex-row items-center gap-1.5 rounded-full border border-dashed border-primary/50 bg-secondary/60 px-3.5 active:bg-secondary">
                  <PolygonIcon size={16} weight="duotone" color={COLORS.primary} />
                  <Text className="font-sans-semibold text-[14px] text-primary">{f.name}: çiz</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </MapSheet>
    </View>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 justify-center bg-background px-4">
      <MapTopBar title="Tarla Haritası" />
      {children}
    </View>
  );
}
