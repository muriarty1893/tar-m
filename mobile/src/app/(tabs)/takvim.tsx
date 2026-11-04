import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, View } from 'react-native';

import { api } from '@/api/client';
import { keys, refresh, useCalendar, useSignedIn } from '@/api/queries';
import type { Task } from '@/api/types';
import { ScanHistory } from '@/components/app/scan-history';
import { ScreenTitle, SectionTitle, TabScreen } from '@/components/app/screen';
import { ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import CalendarTasksDom from '@/components/dom/calendar-tasks-dom';
import { useDomHeight, useDomStart } from '@/components/dom/use-dom-height';
import { CaretLeftIcon, CaretRightIcon, PlusIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { shiftMonthKey } from '@/domain/farm-calendar';
import { WEEKDAYS, WEEKDAY_INITIALS, dayKey, fromDayKey, monthGrid, monthName } from '@/domain/format';
import { useNow } from '@/hooks/use-now';
import { errorMessage } from '@/lib/api-errors';
import { cn } from '@/lib/utils';
import { COLORS, KIND_COLORS } from '@/theme/tokens';

/**
 * "Tarım takvimi": the month's own tasks (kept on the website, as on its Takvim), a day at a time:
 * tick, delete, add. Past demo scans ("Geçmiş taramalar") below.
 */
export default function Calendar() {
  const now = useNow();
  const { loaded, signedIn } = useSignedIn();
  const today = dayKey(now);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [picked, setPicked] = useState(today);
  const calendar = useCalendar(month);

  const go = (by: number) => {
    const next = shiftMonthKey(month, by);
    setMonth(next);
    setPicked(next === today.slice(0, 7) ? today : `${next}-01`);
  };

  return (
    <TabScreen refreshControl={signedIn ? <RefreshControl refreshing={calendar.isRefetching} onRefresh={() => calendar.refetch()} tintColor={COLORS.primary} colors={[COLORS.primary]} /> : undefined}>
      <ScreenTitle>Tarım takvimi</ScreenTitle>
      {!loaded ? (
        <Loading />
      ) : !signedIn ? (
        <SignInPrompt title="Takviminiz için giriş yapın" body="Gübreleme, ilaçlama, ekim ve hasat işlerinizi günü gününe yazın; sitede de aynı takvimi görün." />
      ) : calendar.isPending ? (
        <Loading label="Takvim yükleniyor…" />
      ) : calendar.isError ? (
        <ErrorState error={calendar.error} onRetry={() => calendar.refetch()} />
      ) : (
        <Month month={month} today={today} picked={picked} onPick={setPicked} onShift={go} tasks={calendar.data.tasks} />
      )}

      <View className="mb-2 mt-6 flex-row items-center gap-2">
        <SectionTitle>Geçmiş taramalar</SectionTitle>
        <View className="rounded-full bg-gold-soft px-2 py-0.5">
          <Text className="font-sans-bold text-[11.5px] text-gold">Örnek</Text>
        </View>
      </View>
      <Text className="mb-2 text-[13px] leading-5 text-muted-foreground">Yapay zekâ taraması yakında; şimdilik örnek sonuçlarla nasıl çalışacağını gösterir.</Text>
      <ScanHistory now={now} />
    </TabScreen>
  );
}

function Month({ month, today, picked, onPick, onShift, tasks }: { month: string; today: string; picked: string; onPick: (k: string) => void; onShift: (by: number) => void; tasks: Task[] }) {
  const list = useDomHeight(80);
  // One web view for every day: switching days sends it new tasks instead of loading a new one.
  const listView = useDomStart();
  const [year, m] = month.split('-').map(Number);
  const weeks = useMemo(() => monthGrid(year, m - 1), [year, m]);
  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) map.set(t.date, [...(map.get(t.date) ?? []), t]);
    return map;
  }, [tasks]);
  const dayTasks = byDay.get(picked) ?? [];
  const pickedDate = fromDayKey(picked);

  const toggle = async (id: string, done: boolean) => {
    try {
      await api(`/takvim/${id}`, { method: 'PATCH', body: { done } });
      await refresh(keys.calendar, keys.fields);
    } catch (err) {
      Alert.alert('Kaydedilemedi', errorMessage(err));
      await refresh(keys.calendar);
    }
  };
  const remove = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    Alert.alert('İş silinsin mi?', task ? `“${task.title}” takvimden silinir.` : undefined, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await api(`/takvim/${id}`, { method: 'DELETE' });
            await refresh(keys.calendar, keys.fields);
          } catch (err) {
            Alert.alert('Silinemedi', errorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <View>
      <View className="rounded-[22px] border border-border bg-card p-3">
        <View className="mb-2 flex-row items-center justify-between">
          <Pressable accessibilityRole="button" accessibilityLabel="Önceki ay" onPress={() => onShift(-1)} className="size-12 items-center justify-center rounded-full active:bg-secondary">
            <CaretLeftIcon size={20} weight="bold" color={COLORS.foreground} />
          </Pressable>
          <View className="items-center">
            <Text className="font-heading text-[17px]" accessibilityLiveRegion="polite">
              {monthName(m - 1)} {year}
            </Text>
            <Text className="text-[13px] text-muted-foreground">{tasks.length} iş</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Sonraki ay" onPress={() => onShift(1)} className="size-12 items-center justify-center rounded-full active:bg-secondary">
            <CaretRightIcon size={20} weight="bold" color={COLORS.foreground} />
          </Pressable>
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
              if (!day) return <View key={di} className="h-12 flex-1" />;
              const key = dayKey(day);
              const items = byDay.get(key) ?? [];
              const on = key === picked;
              const isToday = key === today;
              return (
                <View key={di} className="h-12 flex-1 items-center justify-center">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${day.getDate()} ${monthName(day.getMonth())} ${WEEKDAYS[day.getDay()]}${isToday ? ', bugün' : ''}, ${items.length ? `${items.length} iş` : 'iş yok'}`}
                    onPress={() => onPick(key)}
                    className={cn('size-11 items-center justify-center rounded-full', on ? 'bg-primary' : isToday ? 'border-2 border-primary' : 'active:bg-secondary')}>
                    <Text className={cn('font-sans-semibold text-[15px]', on ? 'text-primary-foreground' : isToday ? 'text-primary' : '')}>{day.getDate()}</Text>
                    {items.length > 0 ? (
                      <View className="absolute bottom-1 flex-row gap-0.5">
                        {items.slice(0, 3).map((t) => (
                          <View key={t.id} className="size-1 rounded-full" style={{ backgroundColor: on ? COLORS.white : t.done ? COLORS.mutedForeground : KIND_COLORS[t.kind].dot }} />
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
        <Text role="heading" className="flex-1 font-heading text-[17px]">
          {pickedDate.getDate()} {monthName(pickedDate.getMonth())} {WEEKDAYS[pickedDate.getDay()]}
          {picked === today ? <Text className="font-sans-semibold text-[13px] text-primary">  · Bugün</Text> : null}
        </Text>
        <Button size="sm" className="h-11 rounded-full px-4" onPress={() => router.push({ pathname: '/gorev', params: { tarih: picked } })}>
          <PlusIcon size={18} weight="bold" color={COLORS.white} />
          <Text className="text-[14px]">İş ekle</Text>
        </Button>
      </View>

      {dayTasks.length === 0 ? (
        <Text className="rounded-[18px] border border-dashed border-border px-4 py-5 text-center text-[14px] text-muted-foreground">Bu gün için iş yok. “İş ekle” ile yazın ya da noktalı günlere dokunun.</Text>
      ) : null}
      {/* Kept mounted (hidden) on empty days, so the next day with tasks shows at once. */}
      <View style={dayTasks.length === 0 ? { display: 'none' } : undefined}>
        <CalendarTasksDom
          label={`${pickedDate.getDate()} ${monthName(pickedDate.getMonth())} işleri`}
          tasks={dayTasks.map((t) => ({ id: t.id, title: t.title, kind: t.kind, field: t.fieldName ?? '', time: t.time, done: t.done }))}
          onToggle={toggle}
          onDelete={remove}
          ref={listView}
          onHeight={list.onHeight}
          dom={list.dom}
        />
      </View>
    </View>
  );
}
