import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, View } from 'react-native';

import { api } from '@/api/client';
import { keys, refresh, useMe, useReports } from '@/api/queries';
import type { ReportedListing } from '@/api/types';
import { AdminGate } from '@/components/admin/admin-gate';
import { BackHeader } from '@/components/app/back-header';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { TabScreen } from '@/components/app/screen';
import { EmptyState, ErrorState, Loading } from '@/components/app/states';
import { CheckCircleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { agoLabel } from '@/domain/when';
import { useNow } from '@/hooks/use-now';
import { errorMessage } from '@/lib/api-errors';
import { COLORS } from '@/theme/tokens';

const STATUS: Record<string, string> = { active: 'Yayında', sold: 'Satıldı', removed: 'Kaldırıldı' };

/** Reported listings, the most reported first: take the listing down, or close its reports. */
export default function Reports() {
  const me = useMe();
  const reports = useReports(!!me.data?.admin);
  const now = useNow();
  const [removing, setRemoving] = useState<ReportedListing | null>(null);
  const [busy, setBusy] = useState(false);

  const act = async (r: ReportedListing, action: 'remove' | 'dismiss') => {
    setBusy(true);
    try {
      await api(`/yonetim/sikayetler/${r.id}`, { method: 'POST', body: { action } });
      await refresh(keys.admin, ...(action === 'remove' ? [keys.listings, keys.listing(r.id)] : []));
      setRemoving(null);
    } catch (err) {
      Alert.alert('Yapılamadı', errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <TabScreen refreshControl={<RefreshControl refreshing={reports.isRefetching} onRefresh={() => reports.refetch()} tintColor={COLORS.primary} colors={[COLORS.primary]} />}>
      <BackHeader title="Şikâyetler" subtitle="Açık şikâyetler, en çok şikâyet alan ilan önce" fallback="/yonetim" />
      <AdminGate>
        {() =>
          reports.isPending ? (
            <Loading />
          ) : reports.isError ? (
            <ErrorState error={reports.error} onRetry={() => reports.refetch()} />
          ) : reports.data.length === 0 ? (
            <EmptyState Icon={CheckCircleIcon} title="Açık şikâyet yok" body="Kullanıcılar bir ilanı şikâyet ettiğinde burada görünür." />
          ) : (
            <View className="gap-3">
              {reports.data.map((r) => (
                <View key={r.id} className="gap-2 rounded-[20px] border border-border bg-card p-3.5">
                  <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/ilan/[id]', params: { id: r.id } })} className="active:opacity-60">
                    <Text className="font-heading text-[17px] text-primary underline">{r.title}</Text>
                  </Pressable>
                  <Text className="text-[13.5px] text-muted-foreground">
                    {r.count} şikâyet · son {agoLabel(new Date(r.lastAt), now)} · Satıcı: {r.sellerName} · {STATUS[r.status] ?? r.status}
                  </Text>
                  <View className="gap-1">
                    {r.reasons.map((reason) => (
                      <Text key={reason} className="text-[14.5px]">
                        • {reason}
                      </Text>
                    ))}
                    {r.notes.map((note, i) => (
                      <Text key={i} className="text-[14px] italic text-muted-foreground">
                        “{note}”
                      </Text>
                    ))}
                  </View>
                  <View className="mt-1 flex-row gap-2">
                    <Button variant="outline" className="h-12 flex-1 rounded-full bg-card" disabled={busy} onPress={() => act(r, 'dismiss')}>
                      <Text>Şikâyetleri kapat</Text>
                    </Button>
                    {r.status !== 'removed' ? (
                      <Button variant="destructive" className="h-12 flex-1 rounded-full" disabled={busy} onPress={() => setRemoving(r)}>
                        <Text>İlanı kaldır</Text>
                      </Button>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )
        }
      </AdminGate>
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && act(removing, 'remove')}
        busy={busy}
        title="İlan kaldırılsın mı?"
        body={removing ? `“${removing.title}” Pazar’dan kalkar ve şikâyetleri kapanır.` : ''}
        action="Kaldır"
      />
    </TabScreen>
  );
}
