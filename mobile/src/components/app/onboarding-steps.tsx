import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/** "Adım 2 / 3" with three dots, as in the welcome design. */
export function OnboardingSteps({ step }: { step: 1 | 2 | 3 }) {
  return (
    <View className="items-center gap-2" accessibilityLabel={`Adım ${step} / 3`}>
      <View className="flex-row gap-2">
        {[1, 2, 3].map((n) => (
          <View key={n} className={cn('size-2.5 rounded-full', n === step ? 'bg-foreground' : 'bg-secondary')} />
        ))}
      </View>
      <Text className="text-base text-muted-foreground">Adım {step} / 3</Text>
    </View>
  );
}
