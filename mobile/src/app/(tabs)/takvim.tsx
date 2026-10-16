import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';

import { SectionTitle, TabTitle } from '@/components/app/headers';
import { RoundButton } from '@/components/app/round-button';
import { Screen } from '@/components/app/screen';
import { TaskRow } from '@/components/app/task-row';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { WEEKDAY_INITIALS, dayKey, dayTitle, fromDayKey, monthGrid, monthName } from '@/domain/format';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';
import { useAppStore, type TaskKind } from '@/state/store';

const KINDS: { id: TaskKind; label: string }[] = [
  { id: 'ilaclama', label: 'İlaçlama' },
  { id: 'sulama', label: 'Sulama' },
  { id: 'gubre', label: 'Gübre' },
  { id: 'hasat', label: 'Hasat' },
  { id: 'diger', label: 'Diğer' },
];

export default function Calendar() {
  const now = useNow();
  const tasks = useAppStore((s) => s.tasks);
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(dayKey(now));
  const [adding, setAdding] = useState(false);

  const weeks = useMemo(() => monthGrid(cursor.y, cursor.m), [cursor]);
  const byDay = useMemo(() => {
    const map = new Map<string, { open: number; done: number }>();
    for (const t of tasks) {
      const e = map.get(t.date) ?? { open: 0, done: 0 };
      if (t.done) e.done++;
      else e.open++;
      map.set(t.date, e);
    }
    return map;
  }, [tasks]);
  const dayTasks = tasks.filter((t) => t.date === selected).sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));
  const shift = (n: number) => setCursor(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }));

  return (
    <Screen tabs>
      <TabTitle title="Takvim" subtitle={`${tasks.filter((t) => !t.done && t.date >= dayKey(now)).length} yaklaşan iş`} />

      <View className="mx-4 rounded-[28px] bg-card p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <RoundButton icon="alt-arrow-left-linear" label="Önceki ay" onPress={() => shift(-1)} className="bg-background" />
          <Text className="font-heading text-2xl">
            {monthName(cursor.m)} {cursor.y}
          </Text>
          <RoundButton icon="alt-arrow-right-linear" label="Sonraki ay" onPress={() => shift(1)} className="bg-background" />
        </View>
        <View className="flex-row">
          {WEEKDAY_INITIALS.map((d) => (
            <Text key={d} className="flex-1 text-center font-sans-semibold text-base text-muted-foreground">
              {d}
            </Text>
          ))}
        </View>
        {weeks.map((week, wi) => (
          <View key={wi} className="flex-row">
            {week.map((day, di) => {
              if (!day) return <View key={di} className="h-14 flex-1" />;
              const key = dayKey(day);
              const isToday = key === dayKey(now);
              const isSel = key === selected;
              const info = byDay.get(key);
              return (
                <Pressable
                  key={di}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSel }}
                  accessibilityLabel={`${dayTitle(day)}${info?.open ? `, ${info.open} iş` : ''}`}
                  onPress={() => setSelected(key)}
                  className="h-14 flex-1 items-center justify-center">
                  <View className={cn('size-11 items-center justify-center rounded-full', isSel ? 'bg-foreground' : isToday ? 'bg-accent' : '')}>
                    <Text className={cn('text-lg', isSel || isToday ? 'font-sans-bold text-background' : '')}>{day.getDate()}</Text>
                  </View>
                  <View className="absolute bottom-0.5 flex-row gap-0.5">
                    {info?.open ? <View className="size-1.5 rounded-full bg-accent" /> : null}
                    {info?.done ? <View className="size-1.5 rounded-full bg-olive" /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <SectionTitle
        action={
          <Button size="sm" onPress={() => setAdding(true)} accessibilityLabel="Bu güne iş ekle">
            <Text>+ İş ekle</Text>
          </Button>
        }>
        {selected === dayKey(now) ? 'Bugün' : dayTitle(fromDayKey(selected))}
      </SectionTitle>
      <View className="gap-3 px-4">
        {dayTasks.length ? (
          dayTasks.map((t) => <TaskRow key={t.id} task={t} />)
        ) : (
          <Text className="rounded-3xl bg-popover p-5 text-lg text-muted-foreground">Bu gün için iş yok.</Text>
        )}
      </View>

      <AddTaskDialog open={adding} onOpenChange={setAdding} date={selected} />
    </Screen>
  );
}

function AddTaskDialog({ open, onOpenChange, date }: { open: boolean; onOpenChange: (v: boolean) => void; date: string }) {
  const fields = useAppStore((s) => s.fields);
  const addTask = useAppStore((s) => s.addTask);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<TaskKind>('ilaclama');
  const [fieldId, setFieldId] = useState<string | undefined>(undefined);

  const save = () => {
    addTask({ title: title.trim() || KINDS.find((k) => k.id === kind)!.label, kind, date, fieldId });
    setTitle('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 rounded-[28px] bg-background">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="gap-4">
          <DialogHeader>
            <DialogTitle>Yeni iş · {dayTitle(fromDayKey(date))}</DialogTitle>
          </DialogHeader>
          <Input value={title} onChangeText={setTitle} placeholder="Ne yapılacak? (örn. Sulama)" className="h-14 rounded-2xl text-lg" accessibilityLabel="İşin adı" />
          <ToggleGroup type="single" value={kind} onValueChange={(v) => v && setKind(v as TaskKind)} className="flex-wrap gap-2">
            {KINDS.map((k) => (
              <ToggleGroupItem key={k.id} value={k.id} className={cn('h-11 flex-none rounded-full px-4', kind === k.id ? 'bg-accent' : 'bg-secondary')} accessibilityLabel={k.label}>
                <Text>{k.label}</Text>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <View className="flex-row flex-wrap gap-2">
            {fields.map((f) => (
              <Pressable
                key={f.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: fieldId === f.id }}
                onPress={() => setFieldId(fieldId === f.id ? undefined : f.id)}
                className={cn('h-11 justify-center rounded-full border px-4', fieldId === f.id ? 'border-olive bg-olive/15' : 'border-border')}>
                <Text className="text-base">{f.name}</Text>
              </Pressable>
            ))}
          </View>
          <DialogFooter>
            <Button onPress={save}>
              <Text>Kaydet</Text>
            </Button>
          </DialogFooter>
        </KeyboardAvoidingView>
      </DialogContent>
    </Dialog>
  );
}
