import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import { keys, queryClient, refresh, useSignedIn, useTopic } from '@/api/queries';
import type { ForumReply, TopicDetail } from '@/api/types';
import { BackHeader } from '@/components/app/back-header';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { ErrorState, Loading } from '@/components/app/states';
import { CategoryChip } from '@/components/forum/parts';
import { ChatsTeardropIcon, CheckCircleIcon, FlagIcon, PaperPlaneRightIcon, TrashIcon } from '@/components/icons';
import { Avatar } from '@/components/market/parts';
import { ReportDialog } from '@/components/market/report-dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FORUM_REPORT_REASONS, REPLY_MAX, repliesLabel, validateReply } from '@/domain/forum';
import { agoLabel } from '@/domain/when';
import { useNow } from '@/hooks/use-now';
import { errorMessage, redirectForError } from '@/lib/api-errors';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

const back = () => (router.canGoBack() ? router.back() : router.replace('/forum'));

/** A forum topic: the question, its replies oldest first, and "Yanıt yaz" at the bottom. */
export default function TopicScreen() {
  const insets = useSafeAreaInsets();
  const { id, yeni } = useLocalSearchParams<{ id: string; yeni?: string }>();
  const q = useTopic(id);
  if (q.isPending) {
    return (
      <View className="flex-1 justify-center bg-background" style={{ paddingTop: insets.top }}>
        <Loading label="Konu yükleniyor…" />
      </View>
    );
  }
  if (q.isError || !q.data) {
    return (
      <View className="flex-1 justify-center gap-3 bg-background px-6" style={{ paddingTop: insets.top }}>
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
        <Button variant="outline" className="h-12 rounded-full bg-card" onPress={back}>
          <Text>Foruma dön</Text>
        </Button>
      </View>
    );
  }
  return <Topic topic={q.data.topic} admin={q.data.admin} isNew={!!yeni} />;
}

type Target = { kind: 'topic' } | { kind: 'reply'; reply: ForumReply };

function Topic({ topic: t, admin, isNew }: { topic: TopicDetail; admin: boolean; isNew: boolean }) {
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { signedIn } = useSignedIn();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Target | null>(null);
  const [reporting, setReporting] = useState<Target | null>(null);
  const [busy, setBusy] = useState(false);
  const [reported, setReported] = useState<Set<string>>(() => new Set([...(t.reported ? [t.id] : []), ...t.replies.filter((r) => r.reported).map((r) => r.id)]));

  const send = async () => {
    const invalid = validateReply(draft);
    if (invalid) return setError(invalid);
    setSending(true);
    setError(null);
    try {
      const { topic } = await api<{ topic: TopicDetail }>(`/forum/${t.id}/yanit`, { method: 'POST', body: { body: draft } });
      queryClient.setQueryData(keys.topic(t.id), { topic, admin });
      setDraft('');
      void refresh(keys.forum);
    } catch (err) {
      if (!redirectForError(err)) setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      if (deleting.kind === 'topic') {
        await api(`/forum/${t.id}`, { method: 'DELETE' });
        queryClient.removeQueries({ queryKey: keys.topic(t.id) });
        await refresh(keys.forum);
        setDeleting(null);
        back();
      } else {
        await api(`/forum/yanitlar/${deleting.reply.id}`, { method: 'DELETE' });
        await refresh(keys.topic(t.id), keys.forum);
        setDeleting(null);
      }
    } catch (err) {
      setError(errorMessage(err));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  const report = async (reason: string, note: string) => {
    if (!reporting) return null;
    const replyId = reporting.kind === 'reply' ? reporting.reply.id : null;
    try {
      await api('/forum/sikayet', { method: 'POST', body: { topicId: t.id, replyId, reason, note } });
      setReported((s) => new Set([...s, replyId ?? t.id]));
      setReporting(null);
      return null;
    } catch (err) {
      if (redirectForError(err)) {
        setReporting(null);
        return null;
      }
      return errorMessage(err);
    }
  };

  const actions = (target: Target, mine: boolean, id: string) => (
    <View className="flex-row flex-wrap gap-x-3">
      {mine || admin ? (
        <Pressable accessibilityRole="button" onPress={() => setDeleting(target)} className="min-h-11 flex-row items-center gap-1.5 active:opacity-60">
          <TrashIcon size={16} weight="bold" color={COLORS.mutedForeground} />
          <Text className="font-sans-semibold text-[13.5px] text-muted-foreground">Sil</Text>
        </Pressable>
      ) : null}
      {signedIn && !mine ? (
        reported.has(id) ? (
          <View className="min-h-11 flex-row items-center gap-1.5">
            <CheckCircleIcon size={16} weight="fill" color={COLORS.primary} />
            <Text className="text-[13.5px] text-muted-foreground">Şikâyetiniz alındı</Text>
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setReporting(target)} className="min-h-11 flex-row items-center gap-1.5 active:opacity-60">
            <FlagIcon size={16} weight="bold" color={COLORS.mutedForeground} />
            <Text className="font-sans-semibold text-[13.5px] text-muted-foreground">Şikâyet et</Text>
          </Pressable>
        )
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <BackHeader title="Forum" fallback="/forum" />
        {isNew ? (
          <View className="mb-3 flex-row items-center gap-2.5 rounded-[16px] bg-secondary px-3.5 py-3" accessibilityRole="alert">
            <CheckCircleIcon size={22} weight="fill" color={COLORS.primary} />
            <Text className="flex-1 font-sans-semibold text-[14.5px] text-primary">Konunuz yayında; sitede de görünüyor. Yanıtlar geldikçe burada.</Text>
          </View>
        ) : null}

        <View className="gap-3 rounded-[22px] border border-border bg-card p-4">
          <CategoryChip category={t.category} />
          <Text role="heading" className="font-heading text-[22px] leading-7">
            {t.title}
          </Text>
          <View className="flex-row items-center gap-2.5">
            <Avatar name={t.authorName} size={40} />
            <View>
              <Text className="font-sans-semibold text-[15px]">{t.mine ? `${t.authorName} (siz)` : t.authorName}</Text>
              <Text className="text-[13px] text-muted-foreground">{agoLabel(new Date(t.createdAt), now)}</Text>
            </View>
          </View>
          <Text className="text-[16px] leading-[25px]">{t.body}</Text>
          {actions({ kind: 'topic' }, t.mine, t.id)}
        </View>

        <View className="mb-2 mt-5 flex-row items-center gap-2">
          <ChatsTeardropIcon size={22} weight="duotone" color={COLORS.primary} />
          <Text role="heading" className="font-heading text-[18px]">
            {repliesLabel(t.replies.length)}
          </Text>
        </View>
        {t.replies.length === 0 ? <Text className="text-[15px] text-muted-foreground">Henüz yanıt yok. İlk yanıtı siz yazın.</Text> : null}
        <View className="gap-2.5">
          {t.replies.map((r) => (
            <View key={r.id} className="gap-1.5 rounded-[18px] border border-border bg-card px-3.5 pb-1 pt-3">
              <View className="flex-row items-center gap-2">
                <Avatar name={r.authorName} size={30} />
                <Text numberOfLines={1} className="flex-shrink font-sans-semibold text-[14.5px]">
                  {r.mine ? `${r.authorName} (siz)` : r.authorName}
                </Text>
                {r.authorId === t.authorId ? (
                  <View className="rounded-full bg-secondary px-2 py-0.5">
                    <Text className="font-sans-bold text-[11px] text-primary">Konuyu açan</Text>
                  </View>
                ) : null}
                <Text className="ml-auto text-[12.5px] text-muted-foreground">{agoLabel(new Date(r.createdAt), now)}</Text>
              </View>
              <Text className="text-[15px] leading-[23px]">{r.body}</Text>
              {actions({ kind: 'reply', reply: r }, r.mine, r.id)}
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="gap-2 border-t border-border bg-card px-3 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        {error ? (
          <Text role="alert" className="px-1 text-[13.5px] text-destructive">
            {error}
          </Text>
        ) : null}
        {signedIn ? (
          <View className="flex-row items-end gap-2">
            <TextInput
              value={draft}
              onChangeText={(v) => {
                setDraft(v);
                setError(null);
              }}
              placeholder="Yanıtınızı yazın…"
              placeholderTextColorClassName="accent-muted-foreground"
              accessibilityLabel="Yanıtınız"
              multiline
              maxLength={REPLY_MAX}
              className="max-h-32 min-h-12 flex-1 rounded-[22px] border border-input bg-background px-4 py-3 font-sans text-[15px] text-foreground"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Yanıtı gönder"
              accessibilityState={{ disabled: !draft.trim() || sending, busy: sending }}
              disabled={!draft.trim() || sending}
              onPress={send}
              className={cn('size-12 items-center justify-center rounded-full bg-primary', (!draft.trim() || sending) && 'opacity-40')}>
              {sending ? <ActivityIndicator color={COLORS.white} /> : <PaperPlaneRightIcon size={21} weight="fill" color={COLORS.white} />}
            </Pressable>
          </View>
        ) : (
          <Button className="h-12 rounded-full" onPress={() => router.push('/giris')}>
            <Text>Yanıt yazmak için giriş yapın</Text>
          </Button>
        )}
      </View>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        busy={busy}
        title={deleting?.kind === 'reply' ? 'Yanıt silinsin mi?' : 'Konu silinsin mi?'}
        body={deleting?.kind === 'reply' ? 'Yanıt kalıcı olarak silinir.' : t.replies.length ? 'Konu, yanıtlarıyla birlikte kalıcı olarak silinir.' : 'Konu kalıcı olarak silinir.'}
        action="Sil"
      />
      <ReportDialog open={!!reporting} onClose={() => setReporting(null)} onReport={report} title={reporting?.kind === 'reply' ? 'Yanıtı şikâyet et' : 'Konuyu şikâyet et'} reasons={FORUM_REPORT_REASONS} />
    </KeyboardAvoidingView>
  );
}
