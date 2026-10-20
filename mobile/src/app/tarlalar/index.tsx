import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { BackHeader } from '@/components/app/back-header';
import { TabScreen } from '@/components/app/screen';
import { HealthBadge } from '@/components/fields/health-badge';
import { CalendarDotsIcon, CaretRightIcon, MapTrifoldIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FIELDS, HEALTH, healthOf, seasonSummary, tonsLabel, upcomingTasks, type Field } from '@/domain/fields';
import { relativeDayLabel } from '@/domain/format';
import { formatPrice } from '@/domain/market';
import { scenarioById } from '@/domain/scenarios';
import { useNow } from '@/hooks/use-now';
import { COLORS, SHADOW } from '@/theme/tokens';

/** "Tarlalarım": the season at a glance, then each field with its health, last scan and next task. */
export default function Fields() {
  const now = useNow();
  const season = seasonSummary(FIELDS);
  return (
    <TabScreen>
      <BackHeader title="Tarlalarım" subtitle={`${FIELDS.length} tarla · Konya`} />

      <View className="rounded-[22px] bg-primary p-4" style={{ boxShadow: SHADOW.lift }}>
        <Text className="font-sans-semibold text-[13px] text-primary-foreground/85">Bu sezon</Text>
        <View className="mt-2 flex-row gap-2">
          <Stat value={`${season.areaDonum} dönüm`} label="Toplam alan" />
          <Stat value={formatPrice(season.expenses)} label="Harcama" />
          <Stat value={tonsLabel(season.yieldKg)} label="Beklenen ürün" />
        </View>
      </View>

      <Button variant="outline" size="sm" className="mt-3 rounded-full bg-card" onPress={() => router.push('/harita')}>
        <MapTrifoldIcon size={19} weight="duotone" color={COLORS.primary} />
        <Text className="text-primary">Haritada gör</Text>
      </Button>

      <View className="mt-4 gap-2.5">
        {FIELDS.map((f) => (
          <FieldCard key={f.id} field={f} now={now} />
        ))}
      </View>
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

function FieldCard({ field, now }: { field: Field; now: Date }) {
  const health = healthOf(field);
  const scan = scenarioById(field.scenarioId);
  const [next] = upcomingTasks(field, now, 1);
  const nextLine = next ? `${relativeDayLabel(next.date, now)} ${next.task.time} · ${next.task.title}` : 'Yaklaşan görev yok';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${field.name}, ${field.crop}, ${field.areaDonum} dönüm. Durum: ${HEALTH[health].label}${scan ? `, son tarama yüzde ${scan.successRate}` : ''}. Sıradaki görev: ${nextLine}`}
      onPress={() => router.push({ pathname: '/tarlalar/[id]', params: { id: field.id } })}
      className="flex-row items-center gap-3 rounded-[22px] border border-border bg-card p-2.5 active:bg-secondary/60"
      style={{ boxShadow: SHADOW.soft }}>
      <Image source={field.photo} style={{ width: 84, height: 96, borderRadius: 16 }} contentFit="cover" />
      <View className="min-w-0 flex-1 gap-1">
        <Text numberOfLines={1} className="font-heading text-[17px]">
          {field.name}
        </Text>
        <Text numberOfLines={1} className="text-[13px] text-muted-foreground">
          {field.crop} · {field.areaDonum} dönüm · {field.stage}
        </Text>
        <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
          <HealthBadge health={health} />
          {scan ? <Text className="text-[12.5px] text-muted-foreground">Son tarama %{scan.successRate}</Text> : null}
        </View>
        <View className="flex-row items-center gap-1.5">
          <CalendarDotsIcon size={14} weight="duotone" color={COLORS.primary} />
          <Text numberOfLines={1} className="flex-1 text-[12.5px] text-foreground">
            {nextLine}
          </Text>
        </View>
      </View>
      <CaretRightIcon size={18} weight="bold" color={COLORS.mutedForeground} />
    </Pressable>
  );
}
