import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaretDownIcon, CheckIcon, MagnifyingGlassIcon, MapPinIcon, XIcon } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { findProvinces } from '@/domain/provinces';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

import { Field, inputClass } from './field';

/** The 81 provinces with search, as a sheet. `emptyLabel` adds a first row for "none" ("Tüm iller"). */
export function ProvinceModal({ open, title, value, emptyLabel, onPick, onClose }: { open: boolean; title: string; value: string; emptyLabel?: string; onPick: (v: string) => void; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const list = useMemo(() => findProvinces(query), [query]);
  const pick = (v: string) => {
    onPick(v);
    setQuery('');
  };
  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top ? 8 : 16 }}>
        <View className="flex-row items-center gap-3 px-4 pb-3">
          <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={onClose} className="size-12 items-center justify-center rounded-full active:bg-secondary">
            <XIcon size={22} weight="bold" color={COLORS.foreground} />
          </Pressable>
          <Text role="heading" className="font-heading text-[20px]">
            {title}
          </Text>
        </View>
        <View className="mx-4 mb-2 h-12 flex-row items-center gap-2 rounded-full border border-input bg-card pl-4 pr-2">
          <MagnifyingGlassIcon size={20} weight="bold" color={COLORS.mutedForeground} />
          <TextInput value={query} onChangeText={setQuery} placeholder="İl ara…" placeholderTextColorClassName="accent-muted-foreground" accessibilityLabel="İl ara" className="h-full flex-1 font-sans text-[16px] text-foreground" />
        </View>
        <FlatList
          data={emptyLabel && !query ? [{ name: '' }, ...list] : list}
          keyExtractor={(p) => p.name || '-'}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          renderItem={({ item }) => {
            const on = item.name === value;
            return (
              <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => pick(item.name)} className="min-h-14 flex-row items-center justify-between border-b border-border px-5 active:bg-secondary">
                <Text className={cn('text-[16px]', on && 'font-sans-bold text-primary', !item.name && 'text-muted-foreground')}>{item.name || emptyLabel}</Text>
                {on ? <CheckIcon size={20} weight="bold" color={COLORS.primary} /> : null}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

/** A province field in a form: a button showing the choice, opening the list. */
export function ProvinceSelect({ label = 'İl', value, onChange, required, error, hint, allowEmpty }: { label?: string; value: string; onChange: (v: string) => void; required?: boolean; error?: string; hint?: string; allowEmpty?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Field label={label} required={required} error={error} hint={hint}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || 'seçilmedi'}`}
        accessibilityHint="İl listesini açar"
        onPress={() => setOpen(true)}
        className={cn(inputClass(error), 'flex-row items-center justify-between border active:bg-secondary')}>
        <Text className={cn('text-[16px]', value ? 'text-foreground' : 'text-muted-foreground')}>{value || 'İl seçin'}</Text>
        <CaretDownIcon size={18} weight="bold" color={COLORS.mutedForeground} />
      </Pressable>
      <ProvinceModal
        open={open}
        title={label}
        value={value}
        emptyLabel={allowEmpty ? 'Seçmeyin' : undefined}
        onClose={() => setOpen(false)}
        onPick={(v) => {
          onChange(v);
          setOpen(false);
        }}
      />
    </Field>
  );
}

/** A filter chip for a list ("Tüm iller ▾" / "Konya ▾"). */
export function ProvinceChip({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`İl: ${value || 'tüm iller'}`}
        onPress={() => setOpen(true)}
        className={cn('min-h-11 flex-row items-center gap-1.5 rounded-full border px-3.5', value ? 'border-primary bg-secondary' : 'border-border bg-card active:bg-secondary')}>
        <MapPinIcon size={17} weight="duotone" color={COLORS.primary} />
        <Text className={cn('font-sans-semibold text-[14px]', value ? 'text-primary' : 'text-foreground')}>{value || 'Tüm iller'}</Text>
        <CaretDownIcon size={14} weight="bold" color={value ? COLORS.primary : COLORS.mutedForeground} />
      </Pressable>
      <ProvinceModal
        open={open}
        title="İl"
        value={value}
        emptyLabel="Tüm iller"
        onClose={() => setOpen(false)}
        onPick={(v) => {
          onChange(v);
          setOpen(false);
        }}
      />
    </>
  );
}
