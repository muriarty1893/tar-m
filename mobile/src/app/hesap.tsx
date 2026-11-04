import { useAuth } from '@clerk/expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, View } from 'react-native';

import { api } from '@/api/client';
import { keys, queryClient, refresh, useMe } from '@/api/queries';
import type { Me } from '@/api/types';
import { BackHeader } from '@/components/app/back-header';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { ErrorState, Loading, SignInPrompt } from '@/components/app/states';
import { TabScreen } from '@/components/app/screen';
import { TextField } from '@/components/form/field';
import { ProvinceSelect } from '@/components/form/province-select';
import { ArrowSquareOutIcon, CaretRightIcon, CheckCircleIcon, ShieldCheckIcon, SignOutIcon, TrashIcon, WarningCircleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { errorMessage } from '@/lib/api-errors';
import { siteUrl } from '@/lib/config';
import { COLORS } from '@/theme/tokens';

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const monthYear = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * "Hesabım": the name other people see and the home province, the admin panel for admins, sign out,
 * and deleting the account with everything in it (KVKK). ?ad=1 when another screen needs the name first.
 */
export default function Account() {
  const { isLoaded, isSignedIn } = useAuth();
  const me = useMe();
  return (
    <TabScreen>
      <BackHeader title="Hesabım" />
      {!isLoaded || (isSignedIn && me.isPending) ? (
        <Loading />
      ) : !isSignedIn ? (
        <SignInPrompt title="Hesabınıza giriş yapın" body="İlan vermek, satıcılarla yazışmak, takviminizi ve tarlalarınızı tutmak için giriş yapın ya da ücretsiz hesap açın." />
      ) : me.isError || !me.data ? (
        <ErrorState error={me.error} onRetry={() => me.refetch()} />
      ) : (
        <AccountForm me={me.data} />
      )}
    </TabScreen>
  );
}

function AccountForm({ me }: { me: Me }) {
  const { signOut } = useAuth();
  const { ad } = useLocalSearchParams<{ ad?: string }>();
  const [name, setName] = useState(me.name);
  const [province, setProvince] = useState(me.province);
  const [errors, setErrors] = useState<{ name?: string; province?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const changed = name.trim() !== me.name || province !== me.province;

  const save = async () => {
    setSaving(true);
    setErrors({});
    setFormError(null);
    try {
      await api('/ben', { method: 'PATCH', body: { name, province } });
      await refresh(keys.me);
      setSaved(true);
      // Asked for the name by another screen: back to it.
      if (ad && router.canGoBack()) router.back();
    } catch (err) {
      const e = err as { errors?: Record<string, string> };
      if (e.errors && Object.keys(e.errors).length) setErrors(e.errors);
      else setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api('/ben', { method: 'DELETE', body: { confirm: true } });
      await signOut().catch(() => {});
      queryClient.clear();
      router.replace('/');
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View className="gap-5">
      {ad && !me.name ? (
        <View className="flex-row gap-2.5 rounded-[16px] border border-gold/40 bg-gold-soft px-3.5 py-3" role="alert">
          <WarningCircleIcon size={20} weight="fill" color={COLORS.gold} />
          <Text className="flex-1 text-[14.5px] leading-5">Önce adınızı yazın: ilanlarınızda ve mesajlarınızda bu ad görünür.</Text>
        </View>
      ) : null}

      <View className="gap-1 rounded-[20px] border border-border bg-card p-4">
        <Text className="text-[13px] text-muted-foreground">Giriş yapılan e-posta</Text>
        <Text className="font-sans-semibold text-[16px]">{me.email || '—'}</Text>
        {me.memberSince ? <Text className="text-[13px] text-muted-foreground">Üyelik: {monthYear(me.memberSince)}</Text> : null}
      </View>

      <TextField label="Adınız soyadınız" required value={name} onChangeText={(t) => {
          setName(t);
          setSaved(false);
        }}
        error={errors.name} hint="İlanlarınızda ve mesajlarda bu ad görünür." autoComplete="name" autoCapitalize="words" maxLength={60} />
      <ProvinceSelect label="Yaşadığınız il" value={province} onChange={(v) => {
          setProvince(v);
          setSaved(false);
        }}
        error={errors.province} hint="İlan ve tarla eklerken öntanımlı il olur." allowEmpty />
      {formError ? (
        <Text role="alert" className="text-[14px] text-destructive">
          {formError}
        </Text>
      ) : null}
      {saved && !changed ? (
        <View className="flex-row items-center gap-2" accessibilityLiveRegion="polite">
          <CheckCircleIcon size={20} weight="fill" color={COLORS.primary} />
          <Text className="font-sans-semibold text-[15px] text-primary">Kaydedildi.</Text>
        </View>
      ) : null}
      <Button className="h-14 rounded-full" disabled={saving || !changed} onPress={save} accessibilityState={{ busy: saving, disabled: saving || !changed }}>
        {saving ? <ActivityIndicator color={COLORS.white} /> : null}
        <Text className="text-[16px]">{saving ? 'Kaydediliyor…' : 'Kaydet'}</Text>
      </Button>

      {me.admin ? (
        <Pressable accessibilityRole="button" onPress={() => router.push('/yonetim')} className="min-h-16 flex-row items-center gap-3 rounded-[20px] border border-primary/30 bg-secondary px-4 active:opacity-80">
          <ShieldCheckIcon size={26} weight="duotone" color={COLORS.primary} />
          <View className="flex-1">
            <Text className="font-sans-bold text-[16px] text-primary">Yönetim paneli</Text>
            <Text className="text-[13.5px] text-foreground/80">Haberler ve şikâyet edilen ilanlar</Text>
          </View>
          <CaretRightIcon size={18} weight="bold" color={COLORS.primary} />
        </Pressable>
      ) : null}

      <View className="gap-2">
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(siteUrl('/hesabim'))} className="min-h-14 flex-row items-center gap-3 rounded-[18px] border border-border bg-card px-4 active:bg-secondary">
          <ArrowSquareOutIcon size={22} weight="duotone" color={COLORS.primary} />
          <Text className="flex-1 text-[15px]">E-posta ve şifre ayarları (sitede)</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => signOut()} className="min-h-14 flex-row items-center gap-3 rounded-[18px] border border-border bg-card px-4 active:bg-secondary">
          <SignOutIcon size={22} weight="duotone" color={COLORS.foreground} />
          <Text className="flex-1 font-sans-semibold text-[15px]">Çıkış yap</Text>
        </Pressable>
      </View>

      <View className="gap-2 rounded-[20px] border border-destructive/30 p-4">
        <Text role="heading" className="font-heading text-[17px] text-destructive">
          Hesabı sil
        </Text>
        <Text className="text-[14px] leading-5 text-muted-foreground">İlanlarınız, mesajlarınız, favorileriniz, tarlalarınız, masraflarınız ve takviminiz kalıcı olarak silinir. Bu geri alınamaz.</Text>
        <Button variant="outline" className="mt-1 h-12 rounded-full border-destructive/50" onPress={() => setDeleteOpen(true)}>
          <TrashIcon size={20} weight="duotone" color={COLORS.destructive} />
          <Text className="text-destructive">Hesabımı sil</Text>
        </Button>
      </View>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteAccount}
        title="Hesabınız silinsin mi?"
        body="Tüm bilgileriniz kalıcı olarak silinir ve hesabınızla sitede de giriş yapamazsınız."
        action="Kalıcı olarak sil"
        confirmLabel="Her şeyin silineceğini anlıyorum."
        busy={deleting}
        error={deleteError}
      />
    </View>
  );
}
