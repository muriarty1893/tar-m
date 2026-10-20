import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, View, useWindowDimensions } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { BackHeader } from '@/components/app/back-header';
import { TabScreen } from '@/components/app/screen';
import { HEALTH_STYLE, HealthBadge } from '@/components/fields/health-badge';
import { CaretRightIcon, InfoIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { FIELDS, HEALTH, healthOf, type Field, type Health } from '@/domain/fields';
import { cn } from '@/lib/utils';
import { COLORS, SHADOW } from '@/theme/tokens';

const MAP = require('@/assets/images/app/harita-uydu.webp');
const MAP_RATIO = 877 / 1200;
const TAG_WIDTH = 80;
const TAG_HEIGHT = 28;
const ORDER: Health[] = ['riskli', 'izlenmeli', 'saglikli'];
const BAR: Record<Health, string> = { saglikli: 'bg-primary', izlenmeli: 'bg-gold', riskli: 'bg-destructive' };

/** "Tarla Haritası": the fields outlined on a satellite photo, tinted by plant health; tap one for its details. */
export default function FieldMap() {
  const { width } = useWindowDimensions();
  const w = Math.min(width, 640) - 32;
  const h = Math.round(w * MAP_RATIO);
  // Open on the field that most needs a look.
  const [selectedId, setSelectedId] = useState(() => [...FIELDS].sort((a, b) => ORDER.indexOf(healthOf(a)) - ORDER.indexOf(healthOf(b)))[0].id);
  const selected = FIELDS.find((f) => f.id === selectedId) ?? FIELDS[0];

  return (
    <TabScreen>
      <BackHeader title="Tarla Haritası" subtitle="Uydu görüntüsü · bitki sağlığı" />

      <View className="overflow-hidden rounded-[22px] bg-muted" style={{ width: w, height: h, boxShadow: SHADOW.soft }}>
        <Image source={MAP} style={{ width: w, height: h }} contentFit="cover" accessibilityLabel="Tarlaların uydu görüntüsü" />
        <Svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
          {FIELDS.map((f) => {
            const style = HEALTH_STYLE[healthOf(f)];
            const on = f.id === selected.id;
            return (
              <Polygon
                key={f.id}
                points={f.outline.map(([x, y]) => `${x * w},${y * h}`).join(' ')}
                fill={style.fill}
                stroke={on ? COLORS.white : style.line}
                strokeWidth={on ? 3.5 : 2.5}
                strokeLinejoin="round"
                // On the web, react-native-svg's touch handling leaks into the DOM; the name tags select there.
                onPress={Platform.OS === 'web' ? undefined : () => setSelectedId(f.id)}
              />
            );
          })}
        </Svg>
        {FIELDS.map((f) => (
          <MapTag key={f.id} field={f} w={w} h={h} selected={f.id === selected.id} onPress={() => setSelectedId(f.id)} />
        ))}
        <View className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2.5 py-1">
          <Text className="font-sans-medium text-[11.5px] text-white">Örnek uydu görüntüsü</Text>
        </View>
      </View>

      <View className="mt-3 flex-row flex-wrap gap-2" accessibilityLabel="Renklerin anlamı">
        {ORDER.map((k) => {
          const { Icon, color } = HEALTH_STYLE[k];
          return (
            <View key={k} className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
              <View className="size-3 rounded-[4px] border" style={{ backgroundColor: HEALTH_STYLE[k].fill, borderColor: color }} />
              <Icon size={14} weight="fill" color={color} />
              <Text className="text-[12.5px]">{HEALTH[k].label}</Text>
            </View>
          );
        })}
      </View>

      <SelectedCard field={selected} />

      <View className="mt-3 flex-row gap-2 rounded-[18px] bg-muted px-3.5 py-3">
        <InfoIcon size={18} weight="duotone" color={COLORS.mutedForeground} />
        <Text className="flex-1 text-[13px] leading-5 text-muted-foreground">
          Bitki sağlığı, uydudan ölçülen yeşillikle (NDVI) hesaplanır: 1’e yaklaştıkça bitki örtüsü daha canlıdır. Görüntü ve değerler örnektir.
        </Text>
      </View>
    </TabScreen>
  );
}

/** A field's name on the map, just above its outline; also the accessible way to pick it. */
function MapTag({ field, w, h, selected, onPress }: { field: Field; w: number; h: number; selected: boolean; onPress: () => void }) {
  const health = healthOf(field);
  const { Icon, color } = HEALTH_STYLE[health];
  const xs = field.outline.map(([x]) => x * w);
  const ys = field.outline.map(([, y]) => y * h);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  // Just above the outline, so the tag never hides it; below it when there's no room above.
  const above = Math.min(...ys) - TAG_HEIGHT - 4;
  const top = above >= 4 ? above : Math.max(...ys) + 4;
  const left = Math.min(Math.max(4, cx - TAG_WIDTH / 2), w - TAG_WIDTH - 4);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${field.name}, ${HEALTH[health].label}`}
      onPress={onPress}
      hitSlop={8}
      className={cn('absolute h-7 flex-row items-center justify-center gap-1 rounded-full px-1.5 active:scale-95', selected ? 'bg-foreground' : 'bg-white/95')}
      style={{ left, top, width: TAG_WIDTH, boxShadow: SHADOW.soft }}>
      <Icon size={13} weight="fill" color={selected ? COLORS.white : color} />
      <Text numberOfLines={1} className={cn('font-sans-bold text-[12px]', selected ? 'text-white' : 'text-foreground')}>
        {field.name.split(' ')[0]}
      </Text>
    </Pressable>
  );
}

function SelectedCard({ field }: { field: Field }) {
  const health = healthOf(field);
  const ndvi = field.ndvi.toFixed(2).replace('.', ',');
  return (
    <View className="mt-3 gap-3 rounded-[22px] border border-border bg-card p-3.5" style={{ boxShadow: SHADOW.soft }} accessibilityLiveRegion="polite">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1 gap-1">
          <Text role="heading" className="font-heading text-[19px]">
            {field.name}
          </Text>
          <Text className="text-[13px] text-muted-foreground">
            {field.crop} · {field.areaDonum} dönüm · {field.stage}
          </Text>
        </View>
        <HealthBadge health={health} />
      </View>
      <View className="gap-1.5" accessible accessibilityLabel={`Bitki sağlığı ${ndvi}, ${HEALTH[health].hint}`}>
        <View className="flex-row justify-between">
          <Text className="text-[13.5px]">Bitki sağlığı</Text>
          <Text className="font-heading text-[15px]">{ndvi}</Text>
        </View>
        <Progress value={field.ndvi * 100} className="h-2 bg-muted" indicatorClassName={BAR[health]} />
        <Text className="text-[12.5px] text-muted-foreground">{HEALTH[health].hint}</Text>
      </View>
      <Button size="sm" className="rounded-full" onPress={() => router.push({ pathname: '/tarlalar/[id]', params: { id: field.id } })}>
        <Text>Tarlaya git</Text>
        <CaretRightIcon size={16} weight="bold" color={COLORS.white} />
      </Button>
    </View>
  );
}
