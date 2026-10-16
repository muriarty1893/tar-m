import { Pressable, View } from 'react-native';

import { Checkbox } from '@/components/ui/checkbox';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useAppStore, type Task } from '@/state/store';

/** A task with a big round checkbox; the whole row toggles it. */
export function TaskRow({ task, showTime = true }: { task: Task; showTime?: boolean }) {
  const toggleTask = useAppStore((s) => s.toggleTask);
  const field = useAppStore((s) => s.fields.find((f) => f.id === task.fieldId));
  const meta = [field?.name, showTime ? task.time : undefined].filter(Boolean).join(' · ');

  return (
    <Pressable onPress={() => toggleTask(task.id)} className="flex-row items-center gap-4 rounded-3xl bg-popover px-4 py-4 active:opacity-80" accessibilityRole="none">
      <Checkbox
        checked={task.done}
        onCheckedChange={() => toggleTask(task.id)}
        accessibilityLabel={task.title}
        className="size-8 rounded-full border-2 border-olive"
        checkedClassName="border-olive"
        indicatorClassName="bg-olive"
        iconClassName="text-background"
        iconSize={18}
      />
      <View className="flex-1">
        <Text className={cn('font-sans-bold text-lg leading-6', task.done && 'text-muted-foreground line-through')}>{task.title}</Text>
        {meta ? <Text className="text-base text-muted-foreground">{meta}</Text> : null}
      </View>
    </Pressable>
  );
}
