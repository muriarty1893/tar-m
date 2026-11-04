import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, View } from 'react-native';

import { api } from '@/api/client';
import { keys, refresh, useForumReports, useMe, useReports } from '@/api/queries';
import type { ReportedListing, ReportedPost } from '@/api/types';
import { AdminGate } from '@/components/admin/admin-gate';
import { BackHeader } from '@/components/app/back-header';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { TabScreen } from '@/components/app/screen';
import { Segmented } from '@/components/app/segmented';
import { EmptyState, ErrorState, Loading } from '@/components/app/states';
import { CheckCircleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { agoLabel } from '@/domain/when';
import { useNow } from '@/hooks/use-now';
import { errorMessage } from '@/lib/api-errors';
import { COLORS } from '@/theme/tokens';

const STATUS: Record<string, string> = { active: 'Yayında', sold: 'Satıldı', removed: 'Kaldırıldı' };

type Section = 'ilanlar' | 'forum';

/**
 * Open reports, the most reported first (as /yonetim/sikayetler on the website): listings (take the
 * listing down, or close its reports) and forum posts (delete the topic or reply, or close its reports).
 */
export default function Reports() {
  const me = useMe();
  const admin = !!me.data?.admin;
  const params = useLocalSearchParams<{ bolum?: string }>();
  const [section, setSection] = useState<Section>(params.bolum === 'forum' ? 'forum' : 'ilanlar');
  const listings = useReports(admin);
  const forum = useForumReports(admin);
  const current = section === 'forum' ? forum : listings;

  return (
    <TabScreen refreshControl={<RefreshControl refreshing={current.isRefetching} onRefresh={() => current.refetch()} tintColor={COLORS.primary} colors={[COLORS.primary]} />}>
      <BackHeader title="Şikâyetler" subtitle="Açık şikâyetler, en çok şikâyet alan önce" fallback="/yonetim" />
      <AdminGate>
        {() => (
          <View className="gap-4">
            <Segmented
              label="Şikâyet türü"
              value={section}
              onChange={setSection}
              options={[
                { id: 'ilanlar', label: 'İlanlar', badge: listings.data?.length || undefined },
                { id: 'forum', label: 'Forum', badge: forum.data?.length || undefined },
              ]}
            />
            {section === 'ilanlar' ? <ListingReports /> : <ForumReports />}
          </View>
        )}
      </AdminGate>
    </TabScreen>
  );
}

function ListingReports() {
  const reports = useReports(true);
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

  if (reports.isPending) return <Loading />;
  if (reports.isError) return <ErrorState error={reports.error} onRetry={() => reports.refetch()} />;
  if (reports.data.length === 0) return <EmptyState Icon={CheckCircleIcon} title="Açık şikâyet yok" body="Kullanıcılar bir ilanı şikâyet ettiğinde burada görünür." />;

  return (
    <View className="gap-3">
      {reports.data.map((r) => (
        <View key={r.id} className="gap-2 rounded-[20px] border border-border bg-card p-3.5">
          <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/ilan/[id]', params: { id: r.id } })} className="active:opacity-60">
            <Text className="font-heading text-[17px] text-primary underline">{r.title}</Text>
          </Pressable>
          <Text className="text-[13.5px] text-muted-foreground">
            {r.count} şikâyet · son {agoLabel(new Date(r.lastAt), now)} · Satıcı: {r.sellerName} · {STATUS[r.status] ?? r.status}
          </Text>
          <Reasons reasons={r.reasons} notes={r.notes} />
          <View className="mt-1 gap-2">
            <Button variant="outline" className="h-12 rounded-full bg-card" disabled={busy} onPress={() => act(r, 'dismiss')}>
              <Text>Şikâyetleri kapat</Text>
            </Button>
            {r.status !== 'removed' ? (
              <Button variant="destructive" className="h-12 rounded-full" disabled={busy} onPress={() => setRemoving(r)}>
                <Text>İlanı kaldır</Text>
              </Button>
            ) : null}
          </View>
        </View>
      ))}
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && act(removing, 'remove')}
        busy={busy}
        title="İlan kaldırılsın mı?"
        body={removing ? `“${removing.title}” Pazar’dan kalkar ve şikâyetleri kapanır.` : ''}
        action="Kaldır"
      />
    </View>
  );
}

function ForumReports() {
  const reports = useForumReports(true);
  const now = useNow();
  const [removing, setRemoving] = useState<ReportedPost | null>(null);
  const [busy, setBusy] = useState(false);

  const act = async (r: ReportedPost, action: 'remove' | 'dismiss') => {
    setBusy(true);
    try {
      await api('/yonetim/forum', { method: 'POST', body: { topicId: r.topicId, replyId: r.replyId, action } });
      await refresh(keys.admin, ...(action === 'remove' ? [keys.forum, keys.topic(r.topicId)] : []));
      setRemoving(null);
    } catch (err) {
      Alert.alert('Yapılamadı', errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (reports.isPending) return <Loading />;
  if (reports.isError) return <ErrorState error={reports.error} onRetry={() => reports.refetch()} />;
  if (reports.data.length === 0) return <EmptyState Icon={CheckCircleIcon} title="Açık şikâyet yok" body="Kullanıcılar bir konuyu ya da yanıtı şikâyet ettiğinde burada görünür." />;

  return (
    <View className="gap-3">
      {reports.data.map((r) => (
        <View key={`${r.topicId}-${r.replyId ?? 'konu'}`} className="gap-2 rounded-[20px] border border-border bg-card p-3.5">
          <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/forum/[id]', params: { id: r.topicId } })} className="active:opacity-60">
            <Text className="font-heading text-[17px] text-primary underline">{r.replyId ? `Yanıt: ${r.topicTitle}` : r.topicTitle}</Text>
          </Pressable>
          <Text className="text-[13.5px] text-muted-foreground">
            {r.count} şikâyet · son {agoLabel(new Date(r.lastAt), now)} · Yazan: {r.authorName}
          </Text>
          <View className="border-l-4 border-border pl-3">
            <Text numberOfLines={6} className="text-[15px] leading-[22px]">
              {r.text}
            </Text>
          </View>
          <Reasons reasons={r.reasons} notes={r.notes} />
          <View className="mt-1 gap-2">
            <Button variant="outline" className="h-12 rounded-full bg-card" disabled={busy} onPress={() => act(r, 'dismiss')}>
              <Text>Şikâyetleri kapat</Text>
            </Button>
            <Button variant="destructive" className="h-12 rounded-full" disabled={busy} onPress={() => setRemoving(r)}>
              <Text>{r.replyId ? 'Yanıtı sil' : 'Konuyu sil'}</Text>
            </Button>
          </View>
        </View>
      ))}
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && act(removing, 'remove')}
        busy={busy}
        title={removing?.replyId ? 'Yanıt silinsin mi?' : 'Konu silinsin mi?'}
        body={removing ? (removing.replyId ? 'Yanıt kalıcı olarak silinir ve şikâyetleri kapanır.' : `“${removing.topicTitle}” yanıtlarıyla birlikte kalıcı olarak silinir.`) : ''}
        action="Sil"
      />
    </View>
  );
}

function Reasons({ reasons, notes }: { reasons: string[]; notes: string[] }) {
  return (
    <View className="gap-1">
      {reasons.map((reason) => (
        <Text key={reason} className="text-[14.5px]">
          • {reason}
        </Text>
      ))}
      {notes.map((note, i) => (
        <Text key={i} className="text-[14px] italic text-muted-foreground">
          “{note}”
        </Text>
      ))}
    </View>
  );
}
