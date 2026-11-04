import { Pressable, ScrollView } from 'react-native';

import { useMentionSuggestions } from '@/api/queries';
import { AtIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { insertMention, mentionAtCursor } from '@/domain/forum';
import { COLORS } from '@/theme/tokens';

/** Where the cursor is in a text box (kept from onSelectionChange). */
export type Selection = { start: number; end: number };

/**
 * While "@ah…" is being typed: a row of people to mention, the topic's own first (as on X). A tap
 * puts "@kullanıcıadı " in place and moves the cursor after it.
 */
export function MentionSuggestions({
  text,
  selection,
  topicId,
  onPick,
}: {
  text: string;
  selection: Selection;
  topicId?: string;
  onPick: (next: { text: string; cursor: number }) => void;
}) {
  const at = selection.start === selection.end ? mentionAtCursor(text, selection.start) : null;
  const q = useMentionSuggestions(at ? at.query : null, topicId);
  const items = at ? (q.data ?? []) : [];
  if (!at || !items.length) return null;
  return (
    <ScrollView horizontal keyboardShouldPersistTaps="always" showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 py-1" accessibilityLabel="Bahsedilecek kişiler">
      {items.map((s) => (
        <Pressable
          key={s.handle}
          accessibilityRole="button"
          accessibilityLabel={`${s.name}, @${s.handle}: bahset`}
          onPress={() => onPick(insertMention(text, at, selection.start, s.handle))}
          className="min-h-11 flex-row items-center gap-1.5 rounded-full border border-primary/30 bg-secondary px-3 active:bg-primary/15">
          <AtIcon size={15} weight="bold" color={COLORS.primary} />
          <Text className="font-sans-bold text-[14px] text-primary">{s.handle}</Text>
          <Text numberOfLines={1} className="max-w-[120px] text-[13px] text-muted-foreground">
            {s.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
