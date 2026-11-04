import { router } from 'expo-router';
import { forwardRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { XIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/theme/tokens';

/**
 * A form opened as a sheet ("İlan ver", "Tarla ekle", "Yeni iş"): a close button and title on top,
 * the fields scrolling above the keyboard, and the main action pinned at the bottom.
 */
export const FormScreen = forwardRef<ScrollView, { title: string; onClose?: () => void; footer: ReactNode; children: ReactNode; right?: ReactNode }>(function FormScreen({ title, onClose, footer, children, right }, ref) {
  const insets = useSafeAreaInsets();
  const close = onClose ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-row items-center gap-3 border-b border-border px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={close} className="size-12 items-center justify-center rounded-full active:bg-secondary">
          <XIcon size={22} weight="bold" color={COLORS.foreground} />
        </Pressable>
        <Text role="heading" numberOfLines={1} className="flex-1 font-heading text-[20px]">
          {title}
        </Text>
        {right}
      </View>
      <ScrollView ref={ref} contentContainerClassName="gap-5 px-4 pb-10 pt-4" keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      <View className="gap-2 border-t border-border bg-card px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        {footer}
      </View>
    </KeyboardAvoidingView>
  );
});
