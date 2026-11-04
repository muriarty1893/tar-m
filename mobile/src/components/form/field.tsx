import { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type TextInput, type TextInputProps } from 'react-native';

import { WarningCircleIcon, type PhosphorIcon } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

/** A form field: its visible label (a star when required), the control, then its error or a hint, announced. */
export function Field({ label, required, error, hint, children, nativeID }: { label: string; required?: boolean; error?: string; hint?: string; children: ReactNode; nativeID?: string }) {
  return (
    <View className="gap-1.5">
      <Text nativeID={nativeID} className="font-sans-semibold text-[15px]">
        {label}
        {required ? <Text className="text-[15px] text-destructive"> *</Text> : null}
      </Text>
      {children}
      {error ? (
        <View className="flex-row items-start gap-1.5" accessibilityLiveRegion="polite" role="alert">
          <WarningCircleIcon size={16} weight="fill" color={COLORS.destructive} style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[13.5px] leading-5 text-destructive">{error}</Text>
        </View>
      ) : hint ? (
        <Text className="text-[13.5px] leading-5 text-muted-foreground">{hint}</Text>
      ) : null}
    </View>
  );
}

export const inputClass = (error?: string) => cn('h-14 rounded-[16px] bg-card px-4 font-sans text-[16px] shadow-none', error ? 'border-destructive' : 'border-input');

/** A labelled text box: the label is its accessible name, its error is read with it. */
export const TextField = forwardRef<TextInput, TextInputProps & { label: string; required?: boolean; error?: string; hint?: string; multiline?: boolean }>(function TextField(
  { label, required, error, hint, className, multiline, ...props },
  ref
) {
  return (
    <Field label={label} required={required} error={error} hint={hint}>
      <Input
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={error}
        aria-invalid={!!error}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : undefined}
        className={cn(inputClass(error), multiline && 'h-32 py-3', className)}
        {...props}
      />
    </Field>
  );
});

/** Pill choices for one value (radio buttons). */
export function Choices<T extends string>({ label, options, value, onChange }: { label: string; options: readonly { id: T; label: string; Icon?: PhosphorIcon }[]; value: string; onChange: (v: T) => void }) {
  return (
    <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.id)}
            className={cn('min-h-12 flex-row items-center gap-1.5 rounded-full border px-4', on ? 'border-primary bg-primary' : 'border-border bg-card active:bg-secondary')}>
            {o.Icon ? <o.Icon size={18} weight="duotone" color={on ? COLORS.white : COLORS.primary} /> : null}
            <Text className={cn('font-sans-semibold text-[15px]', on ? 'text-primary-foreground' : 'text-foreground')}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** After a failed submit: what to fix, each line jumping to its field. */
export function ErrorSummary<K extends string>({ title = 'Kaydetmeden önce düzeltin', items, message, onPick }: { title?: string; items: { key: K; label: string; error: string }[]; message?: string; onPick?: (key: K) => void }) {
  if (!items.length && !message) return null;
  return (
    <View className="gap-1.5 rounded-[16px] border border-destructive/40 bg-destructive/5 p-3.5" role="alert" accessibilityLiveRegion="assertive">
      <View className="flex-row items-center gap-2">
        <WarningCircleIcon size={20} weight="fill" color={COLORS.destructive} />
        <Text className="flex-1 font-sans-bold text-[15px] text-destructive">{items.length ? title : message}</Text>
      </View>
      {items.length && message ? <Text className="text-[14px] text-destructive">{message}</Text> : null}
      {items.map((i) => (
        <Pressable key={i.key} accessibilityRole="link" onPress={() => onPick?.(i.key)} className="min-h-10 justify-center">
          <Text className="text-[14px] leading-5 text-destructive underline">
            {i.label}: {i.error}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
