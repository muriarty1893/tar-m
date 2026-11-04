import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, View } from 'react-native';

import { api } from '@/api/client';
import { keys, refresh, useCalendar, useSignedIn } from '@/api/queries';
import type { Task } from '@/api/types';
import { ScanHistory } from '@/components/app/scan-history';
import { ScreenTitle, SectionTitle, TabScreen } from '@/components/app/screen';
import { ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import { HINT_ICONS, HINT_TONE, WeatherHero } from '@/components/app/weather-hero';
import { WeatherIcon } from '@/components/app/weather-icon';
import CalendarTasksDom from '@/components/dom/calendar-tasks-dom';
import { useDomHeight, useDomStart } from '@/components/dom/use-dom-height';
import { CaretLeftIcon, CaretRightIcon, PlusIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { shiftMonthKey } from '@/domain/farm-calendar';
import { WEEKDAYS, WEEKDAY_INITIALS, clock, dayKey, fromDayKey, monthGrid, monthName } from '@/domain/format';
import { dayLabel, describeWeather, farmingHint, shortDayLabel, tempLabel, weatherIcon, type DailyForecast } from '@/domain/weather';
import { useNow } from '@/hooks/use-now';
import { useWeather } from '@/hooks/use-weather';
import { errorMessage } from '@/lib/api-errors';
import { cn } from '@/lib/utils';
import { COLORS, KIND_COLORS } from '@/theme/tokens';

/**
 * "Takvim ve hava": the province's live weather and 7-day forecast on top of the month's own tasks
 * (kept on the website, as on its Takvim). A forecast day or a calendar day opens that day: its
 * weather and farming hint, then its tasks (tick, delete, add). The weather needs no account; the
 * tasks do. Past demo scans ("Geçmiş taramalar") below.
 */
export default function Calendar() {
  const now = useNow();
  const { loaded, signedIn } = useSignedIn();
  const today = dayKey(now);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [picked, setPicked] = useState(today);
  const calendar = useCalendar(month);
  const weather = useWeather();
  const daily = weather.forecast?.data.daily ?? [];
  const tasks = signedIn ? (calendar.data?.tasks ?? []) : [];

  const go = (by: number) => {
    const next = shiftMonthKey(month, by);
    setMonth(next);
    setPicked(next === today.slice(0, 7) ? today : `${next}-01`);
  };
  const pickDay = (key: string) => {
    setMonth(key.slice(0, 7));
    setPicked(key);
  };
  const reload = () => {
    void weather.retry();
    if (signedIn) void calendar.refetch();
  };

  return (
    <TabScreen
      refreshControl={
        <RefreshControl refreshing={(signedIn && calendar.isRefetching) || (weather.status === 'loading' && !!weather.forecast)} onRefresh={reload} tintColor={COLORS.primary} colors={[COLORS.primary]} />
      }>
      <ScreenTitle>Takvim ve hava</ScreenTitle>
      <WeatherHero hint={false} />
      <ForecastStrip daily={daily} picked={picked} now={now} onPick={pickDay} failed={weather.status === 'error'} onRetry={() => void weather.retry()} />
      <Credit at={weather.forecast?.at} />

      <MonthGrid month={month} today={today} picked={picked} onPick={setPicked} onShift={go} tasks={tasks} counted={signedIn && calendar.isSuccess} />

      <DayHeader picked={picked} today={today} onAdd={() => router.push(signedIn ? { pathname: '/gorev', params: { tarih: picked } } : '/giris')} />
      <DayWeather day={daily.find((d) => d.date === picked)} />
      {!loaded ? (
        <Loading />
      ) : !signedIn ? (
        <SignInPrompt title="İşleriniz için giriş yapın" body="Gübreleme, ilaçlama, ekim ve hasat işlerinizi günü gününe yazın; sitede de aynı takvimi görün." />
      ) : calendar.isPending ? (
        <Loading label="Takvim yükleniyor…" />
      ) : calendar.isError ? (
        <ErrorState error={calendar.error} onRetry={() => calendar.refetch()} />
      ) : (
        <DayTasks picked={picked} tasks={tasks} />
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

/** The next 7 days side by side (no sideways scrolling): day, sky, high and low, and a mark for frost, heavy rain or a good spraying day. */
function ForecastStrip({ daily, picked, now, onPick, failed, onRetry }: { daily: DailyForecast[]; picked: string; now: Date; onPick: (key: string) => void; failed: boolean; onRetry: () => void }) {
  if (!daily.length) {
    return failed ? (
      <View className="mt-3 flex-row items-center gap-3 rounded-[22px] border border-dashed border-border px-4 py-3" accessibilityRole="alert">
        <Text className="flex-1 text-[14px] leading-5 text-muted-foreground">7 günlük tahmin alınamadı. İnternet bağlantınızı kontrol edin.</Text>
        <Button size="sm" className="rounded-full" onPress={onRetry}>
          <Text>Tekrar dene</Text>
        </Button>
      </View>
    ) : (
      <Skeleton className="mt-3 h-[112px] rounded-[22px] bg-muted" accessibilityLabel="Tahmin yükleniyor" />
    );
  }
  return (
    <View className="mt-3 flex-row gap-1 rounded-[22px] border border-border bg-card p-1.5" accessibilityLabel="7 günlük tahmin">
      {daily.slice(0, 7).map((d) => {
        const on = d.date === picked;
        const code = d.code ?? 3;
        const hint = farmingHint(d);
        const HintIcon = HINT_ICONS[hint.kind];
        return (
          <Pressable
            key={d.date}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${dayLabel(d.date, now)}: ${describeWeather(code)}, en yüksek ${tempLabel(d.max, 0)}, en düşük ${tempLabel(d.min, 0)}. ${hint.text}`}
            onPress={() => onPick(d.date)}
            className={cn('min-h-[100px] flex-1 items-center justify-between rounded-[16px] px-0.5 py-2', on ? 'bg-primary' : 'active:bg-secondary')}>
            <Text numberOfLines={1} className={cn('font-sans-bold text-[12px]', on ? 'text-primary-foreground' : 'text-muted-foreground')}>
              {shortDayLabel(d.date, now)}
            </Text>
            <WeatherIcon kind={weatherIcon(code)} size={24} color={on ? COLORS.white : undefined} />
            <View className="items-center">
              <Text className={cn('font-heading text-[14px] leading-[18px]', on && 'text-primary-foreground')}>{tempLabel(d.max, 0)}</Text>
              <Text className={cn('text-[12px] leading-4', on ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{tempLabel(d.min, 0)}</Text>
            </View>
            <View className="h-4 items-center justify-center">{hint.kind === 'normal' ? null : <HintIcon size={14} weight="fill" color={on ? COLORS.white : HINT_TONE[hint.kind]} />}</View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Open-Meteo's data is CC BY 4.0: the source, and when it was fetched. */
function Credit({ at }: { at?: string }) {
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-x-1">
      {at ? <Text className="text-[12.5px] text-muted-foreground">Güncellendi {clock(new Date(at))} ·</Text> : null}
      <Pressable accessibilityRole="link" accessibilityLabel="Hava verisi Open-Meteo’dan. Kaynağı tarayıcıda açar" onPress={() => void WebBrowser.openBrowserAsync('https://open-meteo.com').catch(() => undefined)} hitSlop={10} className="min-h-11 justify-center active:opacity-60">
        <Text className="text-[12.5px] text-muted-foreground underline">Hava verisi: Open-Meteo.com</Text>
      </Pressable>
    </View>
  );
}

function MonthGrid({ month, today, picked, onPick, onShift, tasks, counted }: { month: string; today: string; picked: string; onPick: (k: string) => void; onShift: (by: number) => void; tasks: Task[]; counted: boolean }) {
  const [year, m] = month.split('-').map(Number);
  const weeks = useMemo(() => monthGrid(year, m - 1), [year, m]);
  const byDay = useMemo(() => tasksByDay(tasks), [tasks]);
  return (
    <View className="rounded-[22px] border border-border bg-card p-3">
      <View className="mb-2 flex-row items-center justify-between">
        <Pressable accessibilityRole="button" accessibilityLabel="Önceki ay" onPress={() => onShift(-1)} className="size-12 items-center justify-center rounded-full active:bg-secondary">
          <CaretLeftIcon size={20} weight="bold" color={COLORS.foreground} />
        </Pressable>
        <View className="items-center">
          <Text className="font-heading text-[17px]" accessibilityLiveRegion="polite">
            {monthName(m - 1)} {year}
          </Text>
          {counted ? <Text className="text-[13px] text-muted-foreground">{tasks.length} iş</Text> : null}
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
                  accessibilityLabel={`${day.getDate()} ${monthName(day.getMonth())} ${WEEKDAYS[day.getDay()]}${isToday ? ', bugün' : ''}${counted ? `, ${items.length ? `${items.length} iş` : 'iş yok'}` : ''}`}
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
  );
}

function DayHeader({ picked, today, onAdd }: { picked: string; today: string; onAdd: () => void }) {
  const date = fromDayKey(picked);
  return (
    <View className="mb-2 mt-5 flex-row items-center gap-2">
      <Text role="heading" className="flex-1 font-heading text-[17px]">
        {date.getDate()} {monthName(date.getMonth())} {WEEKDAYS[date.getDay()]}
        {picked === today ? <Text className="font-sans-semibold text-[13px] text-primary">  · Bugün</Text> : null}
      </Text>
      <Button size="sm" className="h-11 rounded-full px-4" onPress={onAdd}>
        <PlusIcon size={18} weight="bold" color={COLORS.white} />
        <Text className="text-[14px]">İş ekle</Text>
      </Button>
    </View>
  );
}

/** The chosen day's weather and what it means for the field, when it's one of the forecast days. */
function DayWeather({ day }: { day?: DailyForecast }) {
  if (!day) return null;
  const code = day.code ?? 3;
  const hint = farmingHint(day);
  const HintIcon = HINT_ICONS[hint.kind];
  return (
    <View
      className="mb-3 gap-2.5 rounded-[18px] border border-border bg-card px-3.5 py-3"
      accessible
      accessibilityLabel={`Hava: ${describeWeather(code)}, en yüksek ${tempLabel(day.max, 0)}, en düşük ${tempLabel(day.min, 0)}, yağış ihtimali yüzde ${Math.round(day.rainProb)}, rüzgâr ${Math.round(day.windMax)} kilometre. ${hint.text}`}>
      <View className="flex-row items-center gap-3">
        <WeatherIcon kind={weatherIcon(code)} size={30} />
        <View className="min-w-0 flex-1">
          <Text className="font-sans-bold text-[15px]">
            {describeWeather(code)} · {tempLabel(day.max, 0)} / {tempLabel(day.min, 0)}
          </Text>
          <Text className="text-[13px] text-muted-foreground">
            Yağış %{Math.round(day.rainProb)} · Rüzgâr {Math.round(day.windMax)} km/s
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2 border-t border-border pt-2.5">
        <HintIcon size={18} weight="duotone" color={HINT_TONE[hint.kind]} />
        <Text className="flex-1 font-sans-semibold text-[14px] leading-5" style={{ color: HINT_TONE[hint.kind] }}>
          {hint.text}
        </Text>
      </View>
    </View>
  );
}

function DayTasks({ picked, tasks }: { picked: string; tasks: Task[] }) {
  const list = useDomHeight(80);
  // One web view for every day: switching days sends it new tasks instead of loading a new one.
  const listView = useDomStart();
  const byDay = useMemo(() => tasksByDay(tasks), [tasks]);
  const dayTasks = byDay.get(picked) ?? [];
  const date = fromDayKey(picked);

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
      {dayTasks.length === 0 ? (
        <Text className="rounded-[18px] border border-dashed border-border px-4 py-5 text-center text-[14px] text-muted-foreground">Bu gün için iş yok. “İş ekle” ile yazın ya da noktalı günlere dokunun.</Text>
      ) : null}
      {/* Kept mounted (hidden) on empty days, so the next day with tasks shows at once. */}
      <View style={dayTasks.length === 0 ? { display: 'none' } : undefined}>
        <CalendarTasksDom
          label={`${date.getDate()} ${monthName(date.getMonth())} işleri`}
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

function tasksByDay(tasks: Task[]) {
  const map = new Map<string, Task[]>();
  for (const t of tasks) map.set(t.date, [...(map.get(t.date) ?? []), t]);
  return map;
}
