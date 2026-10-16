import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { ScreenTitle, TabScreen } from '@/components/app/screen';
import { DropIcon, FirstAidKitIcon, FlaskIcon, GrainsIcon, PlantIcon, ShovelIcon, SnowflakeIcon, TractorIcon, type PhosphorIcon } from '@/components/icons';
import { Checkbox } from '@/components/ui/checkbox';
import { Text } from '@/components/ui/text';
import { TASK_KINDS, taskId, tasksOn, type TaskKind } from '@/domain/farm-calendar';
import { WEEKDAYS, WEEKDAY_INITIALS, dayKey, monthGrid, monthName } from '@/domain/format';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/store';
import { COLORS, KIND_COLORS } from '@/theme/tokens';

const KIND_ICON: Record<TaskKind, PhosphorIcon> = {
  analiz: FlaskIcon,
  toprak: ShovelIcon,
  gubre: PlantIcon,
  ilac: FirstAidKitIcon,
  ekim: GrainsIcon,
  sulama: DropIcon,
  hasat: TractorIcon,
  uyari: SnowflakeIcon,
};

/** "Tarım takvimi", as in the website demo: the month's farm tasks, a day at a time, tickable. */
export default function Calendar() {
  const now = useNow();
  const done = useAppStore((s) => s.doneTasks);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const [picked, setPicked] = useState(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()));

  const weeks = useMemo(() => monthGrid(now.getFullYear(), now.getMonth()), [now]);
  const total = weeks.flat().reduce((n, d) => n + (d ? tasksOn(d, now).length : 0), 0);
  const month = `${monthName(now.getMonth())} ${now.getFullYear()}`;
  const tasks = tasksOn(picked, now);
  const isToday = dayKey(picked) === dayKey(now);

  return (
    <TabScreen>
      <ScreenTitle>Tarım takvimi</ScreenTitle>

      <View className="rounded-[22px] border border-border bg-card p-3">
        <View className="mb-2 flex-row items-baseline justify-between px-1">
          <Text className="font-heading text-[17px]">{month}</Text>
          <Text className="text-[13px] text-muted-foreground">{total} görev</Text>
        </View>
        <View className="flex-row pb-1">
          {WEEKDAY_INITIALS.map((w) => (
            <Text key={w} className="flex-1 text-center font-sans-semibold text-[12px] text-muted-foreground">
              {w}
            </Text>
          ))}
        </View>
        {weeks.map((week, wi) => (
          <View key={wi} className="flex-row">
            {week.map((day, di) => {
              if (!day) return <View key={di} className="h-11 flex-1" />;
              const list = tasksOn(day, now);
              const on = dayKey(day) === dayKey(picked);
              const today = dayKey(day) === dayKey(now);
              return (
                <View key={di} className="h-11 flex-1 items-center justify-center">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${day.getDate()} ${monthName(day.getMonth())} ${WEEKDAYS[day.getDay()]}${today ? ', bugün' : ''}, ${list.length ? `${list.length} görev` : 'görev yok'}`}
                    onPress={() => setPicked(day)}
                    className={cn('size-10 items-center justify-center rounded-full', on ? 'bg-primary' : today ? 'border-2 border-primary' : 'active:bg-secondary')}>
                    <Text className={cn('font-sans-semibold text-[15px]', on ? 'text-primary-foreground' : today ? 'text-primary' : '')}>{day.getDate()}</Text>
                    {list.length > 0 ? (
                      <View className="absolute bottom-1 flex-row gap-0.5">
                        {list.slice(0, 3).map((t, i) => (
                          <View key={i} className="size-1 rounded-full" style={{ backgroundColor: on ? COLORS.white : KIND_COLORS[t.kind].dot }} />
                        ))}
                      </View>
                    ) : null}
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View className="mb-2 mt-5 flex-row items-center gap-2">
        <Text role="heading" className="font-heading text-[17px]">
          {picked.getDate()} {monthName(picked.getMonth())} {WEEKDAYS[picked.getDay()]}
        </Text>
        {isToday ? (
          <View className="rounded-full bg-secondary px-2 py-0.5">
            <Text className="font-sans-semibold text-[12px] text-primary">Bugün</Text>
          </View>
        ) : null}
      </View>

      {tasks.length === 0 ? (
        <Text className="rounded-[18px] border border-dashed border-border px-4 py-5 text-center text-[14px] text-muted-foreground">
          Bu gün için görev yok. Noktalı günlere dokunun.
        </Text>
      ) : (
        <View className="gap-2">
          {tasks.map((t) => {
            const id = taskId(picked, t);
            const checked = done.includes(id);
            const Icon = KIND_ICON[t.kind];
            const c = KIND_COLORS[t.kind];
            return (
              <Pressable key={id} onPress={() => toggleTask(id)} className="flex-row items-start gap-3 rounded-[18px] border border-border bg-card px-3 py-3">
                <View className="mt-0.5 size-11 items-center justify-center rounded-[12px]" style={{ backgroundColor: c.tile }}>
                  <Icon size={24} weight="duotone" color={c.icon} />
                </View>
                <View className="min-w-0 flex-1 flex-row gap-2.5">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleTask(id)}
                    accessibilityLabel={t.title}
                    className="mt-0.5 size-[21px] rounded-[6px] border-2 border-primary"
                    checkedClassName="border-primary"
                    indicatorClassName="bg-primary"
                    iconSize={14}
                  />
                  <View className="min-w-0 flex-1">
                    <Text className={cn('font-sans-medium text-[15px] leading-5', checked && 'opacity-50 line-through')}>{t.title}</Text>
                    <Text className="text-[13px] text-muted-foreground">
                      {TASK_KINDS[t.kind].label} · {t.field} · {t.time}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </TabScreen>
  );
}
