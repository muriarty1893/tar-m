import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, RefreshControl, View } from 'react-native';

import { useFields, useSignedIn } from '@/api/queries';
import type { FieldSummary } from '@/api/types';
import { BackHeader } from '@/components/app/back-header';
import { TabScreen } from '@/components/app/screen';
import { EmptyState, ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import { CalendarDotsIcon, CaretRightIcon, MapTrifoldIcon, PlusIcon, PolygonIcon, TractorIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cropPhoto, donumLabel, seasonSummary, tonsLabel } from '@/domain/fields';
import { fromDayKey, relativeDayLabel } from '@/domain/format';
import { formatPrice, placeLabel } from '@/domain/market';
import { useNow } from '@/hooks/use-now';
import { COLORS, FIELD_CARD_GRADIENT, SHADOW } from '@/theme/tokens';

/** "Tarlalarım": the season at a glance, then each field with its expenses, next task and map outline. */
export default function Fields() {
  const { loaded, signedIn } = useSignedIn();
  const fields = useFields();
  const list = fields.data ?? [];
  const season = seasonSummary(list);
  return (
    <TabScreen refreshControl={signedIn ? <RefreshControl refreshing={fields.isRefetching} onRefresh={() => fields.refetch()} tintColor={COLORS.primary} colors={[COLORS.primary]} /> : undefined}>
      <BackHeader
        title="Tarlalarım"
        subtitle={fields.data ? `${list.length} tarla` : undefined}
        right={
          signedIn ? (
            <Button size="icon" className="size-12 rounded-full" accessibilityLabel="Tarla ekle" onPress={() => router.push('/tarlalar/duzenle')}>
              <PlusIcon size={22} weight="bold" color={COLORS.white} />
            </Button>
          ) : null
        }
      />
      {!loaded ? (
        <Loading />
      ) : !signedIn ? (
        <SignInPrompt title="Tarlalarınız için giriş yapın" body="Tarlalarınızı, bu sezonki masraflarınızı ve beklenen ürününüzü tutun; haritada sınırlarını çizin." />
      ) : fields.isPending ? (
        <Loading label="Tarlalar yükleniyor…" />
      ) : fields.isError ? (
        <ErrorState error={fields.error} onRetry={() => fields.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState Icon={TractorIcon} title="Henüz tarla eklemediniz" body="Tarlanızın adını, ürününü ve alanını yazın; sonra haritada sınırını çizin, masraflarını ekleyin." action="İlk tarlayı ekle" onAction={() => router.push('/tarlalar/duzenle')} />
      ) : (
        <>
          <View className="rounded-[28px]" style={{ boxShadow: SHADOW.lift }}>
            <LinearGradient colors={FIELD_CARD_GRADIENT} locations={[0, 0.35, 0.75, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 28, padding: 16 }}>
              <Text className="font-sans-bold text-[12px] uppercase tracking-[1px] text-emerald-300">Bu sezon</Text>
              <View className="mt-2 flex-row gap-2">
                <Stat value={donumLabel(season.areaDonum)} label="Toplam alan" />
                <Stat value={formatPrice(season.expenses)} label="Harcama" />
                <Stat value={season.yieldKg ? tonsLabel(season.yieldKg) : '—'} label="Beklenen ürün" />
              </View>
            </LinearGradient>
          </View>

          <Button variant="outline" className="mt-3 h-12 rounded-full bg-card" onPress={() => router.push('/harita')}>
            <MapTrifoldIcon size={20} weight="duotone" color={COLORS.primary} />
            <Text className="text-primary">Haritada gör</Text>
          </Button>

          <View className="mt-4 gap-2.5">
            {list.map((f) => (
              <FieldCard key={f.id} field={f} />
            ))}
          </View>
        </>
      )}
    </TabScreen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="min-w-0 flex-1">
      <Text numberOfLines={1} adjustsFontSizeToFit className="font-heading text-[17px] text-primary-foreground">
        {value}
      </Text>
      <Text className="text-[12px] text-primary-foreground/85">{label}</Text>
    </View>
  );
}

function FieldCard({ field: f }: { field: FieldSummary }) {
  const now = useNow();
  const next = f.nextTask ? `${relativeDayLabel(fromDayKey(f.nextTask.date), now)} · ${f.nextTask.title}` : 'Yaklaşan iş yok';
  const facts = [f.crop, donumLabel(f.areaDonum), f.stage].filter(Boolean).join(' · ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${f.name}. ${facts}. Harcama ${formatPrice(f.expenses)}. Sıradaki iş: ${next}${f.boundary ? '' : '. Sınırı çizilmedi'}`}
      onPress={() => router.push({ pathname: '/tarlalar/[id]', params: { id: f.id } })}
      className="flex-row items-center gap-3 rounded-[22px] border border-border bg-card p-2.5 active:bg-secondary/60"
      style={{ boxShadow: SHADOW.soft }}>
      <Image source={cropPhoto(f.crop, f.name)} style={{ width: 84, height: 100, borderRadius: 16 }} contentFit="cover" />
      <View className="min-w-0 flex-1 gap-1">
        <Text numberOfLines={1} className="font-heading text-[17px]">
          {f.name}
        </Text>
        <Text numberOfLines={1} className="text-[13px] text-muted-foreground">
          {facts}
        </Text>
        {f.province ? (
          <Text numberOfLines={1} className="text-[12.5px] text-muted-foreground">
            {placeLabel(f.province, f.district)}
          </Text>
        ) : null}
        <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
          <Text className="font-sans-semibold text-[12.5px]">{formatPrice(f.expenses)}</Text>
          <View className="flex-row items-center gap-1">
            <PolygonIcon size={13} weight="duotone" color={f.boundary ? COLORS.primary : COLORS.mutedForeground} />
            <Text className={f.boundary ? 'text-[12.5px] text-primary' : 'text-[12.5px] text-muted-foreground'}>{f.boundary ? 'Haritada' : 'Sınır yok'}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <CalendarDotsIcon size={14} weight="duotone" color={COLORS.primary} />
          <Text numberOfLines={1} className="flex-1 text-[12.5px] text-foreground">
            {next}
          </Text>
        </View>
      </View>
      <CaretRightIcon size={18} weight="bold" color={COLORS.mutedForeground} />
    </Pressable>
  );
}
