import { router } from 'expo-router';

import { Text } from '@/components/ui/text';
import { splitMentions } from '@/domain/forum';
import { cn } from '@/lib/utils';

/** A post's text with each "@kullanıcıadı" in green; a tap opens that person's forum page. */
export function MentionText({ text, className }: { text: string; className?: string }) {
  return (
    <Text className={className}>
      {splitMentions(text).map((part, i) =>
        'handle' in part ? (
          <Text
            key={i}
            accessibilityRole="link"
            accessibilityLabel={`@${part.handle}: profili aç`}
            onPress={() => router.push({ pathname: '/forum/kisi/[handle]', params: { handle: part.handle } })}
            className={cn(className, 'font-sans-bold text-primary')}>
            @{part.handle}
          </Text>
        ) : (
          <Text key={i} className={className}>
            {part.text}
          </Text>
        )
      )}
    </Text>
  );
}
