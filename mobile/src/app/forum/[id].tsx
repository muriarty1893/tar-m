import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import { keys, queryClient, refresh, useSignedIn, useTopic } from '@/api/queries';
import type { ForumReply, TopicDetail } from '@/api/types';
import { BackHeader } from '@/components/app/back-header';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { ErrorState, Loading } from '@/components/app/states';
import { LikeButton } from '@/components/forum/like-button';
import { MentionSuggestions, type Selection } from '@/components/forum/mention-suggestions';
import { MentionText } from '@/components/forum/mention-text';
import { CategoryChip } from '@/components/forum/parts';
import { PhotoButtons, PhotoThumbs, usePhotoUploads } from '@/components/forum/photo-picker';
import { PhotoGrid } from '@/components/forum/photo-grid';
import { ArrowBendDownRightIcon, ArrowBendUpLeftIcon, ChatsTeardropIcon, CheckCircleIcon, FlagIcon, PaperPlaneRightIcon, TrashIcon, XIcon } from '@/components/icons';
import { Avatar } from '@/components/market/parts';
import { ReportDialog } from '@/components/market/report-dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FORUM_REPORT_REASONS, REPLY_MAX, repliesLabel, threadReplies, validateReply } from '@/domain/forum';
import { agoLabel } from '@/domain/when';
import { useNow } from '@/hooks/use-now';
import { errorMessage, redirectForError } from '@/lib/api-errors';
import { cn } from '@/lib/utils';
import { COLORS } from '@/theme/tokens';

const back = () => (router.canGoBack() ? router.back() : router.replace('/forum'));
const openPerson = (handle: string | null) => handle && router.push({ pathname: '/forum/kisi/[handle]', params: { handle } });

/** A forum topic as an X conversation: the question, the answers with everything under each, and "Yanıt yaz" at the bottom. */
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

type Target = { kind: 'topic' } | { kind: 'reply'; reply: ForumReply; answered: boolean };

function Topic({ topic: t, admin, isNew }: { topic: TopicDetail; admin: boolean; isNew: boolean }) {
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { signedIn } = useSignedIn();
  const input = useRef<TextInput>(null);
  const [draft, setDraft] = useState('');
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 });
  const [replyTo, setReplyTo] = useState<ForumReply | null>(null);
  const photos = usePhotoUploads();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Target | null>(null);
  const [reporting, setReporting] = useState<Target | null>(null);
  const [busy, setBusy] = useState(false);
  const [reported, setReported] = useState<Set<string>>(() => new Set([...(t.reported ? [t.id] : []), ...t.replies.filter((r) => r.reported).map((r) => r.id)]));

  const thread = threadReplies(t.replies);
  const answered = new Set(t.replies.map((r) => r.parentId).filter(Boolean));
  const shown = t.replies.filter((r) => !r.deleted).length;
  const canSend = (!!draft.trim() || photos.urls.length > 0) && !sending && !photos.uploading;

  const startReply = (r: ForumReply) => {
    if (!signedIn) return router.push('/giris');
    setReplyTo(r);
    const text = r.authorHandle ? `@${r.authorHandle} ` : '';
    setDraft(text);
    setSelection({ start: text.length, end: text.length });
    setError(null);
    requestAnimationFrame(() => input.current?.focus());
  };

  const send = async () => {
    if (photos.uploading) return setError('Fotoğraflar yükleniyor; bitince yeniden dokunun.');
    const invalid = validateReply(draft, photos.urls.length);
    if (invalid) return setError(invalid);
    setSending(true);
    setError(null);
    try {
      const { topic } = await api<{ topic: TopicDetail }>(`/forum/${t.id}/yanit`, { method: 'POST', body: { body: draft, parentId: replyTo?.id ?? null, photos: photos.urls } });
      queryClient.setQueryData(keys.topic(t.id), { topic, admin });
      setDraft('');
      setReplyTo(null);
      photos.reset();
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
        if (replyTo?.id === deleting.reply.id) setReplyTo(null);
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

  /** ♥, "Yanıtla", "Sil", "Şikâyet et" under a post. */
  const actions = (target: Target, mine: boolean, id: string, likes: { liked: boolean; count: number }) => (
    <View className="flex-row flex-wrap items-center gap-x-4">
      <LikeButton key={`${id}-${likes.liked}-${likes.count}`} topicId={t.id} replyId={target.kind === 'reply' ? id : null} liked={likes.liked} count={likes.count} />
      {target.kind === 'reply' ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`${target.reply.authorName} kişisine yanıtla`} onPress={() => startReply(target.reply)} className="min-h-11 flex-row items-center gap-1.5 active:opacity-60">
          <ArrowBendUpLeftIcon size={16} weight="bold" color={COLORS.mutedForeground} />
          <Text className="font-sans-semibold text-[13.5px] text-muted-foreground">Yanıtla</Text>
        </Pressable>
      ) : null}
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

  const author = (name: string, handle: string | null, mine: boolean, size: 'lg' | 'sm') => (
    <Pressable accessibilityRole={handle ? 'link' : undefined} disabled={!handle} onPress={() => openPerson(handle)} className="min-w-0 flex-shrink flex-row flex-wrap items-baseline gap-x-1.5 active:opacity-60">
      <Text numberOfLines={1} className={cn('font-sans-semibold', size === 'lg' ? 'text-[15px]' : 'text-[14.5px]')}>
        {mine ? `${name} (siz)` : name}
      </Text>
      {handle ? <Text className="text-[13px] text-muted-foreground">@{handle}</Text> : null}
    </Pressable>
  );

  const replyCard = (r: ForumReply, parent?: ForumReply) => {
    if (r.deleted) {
      return (
        <View key={r.id} className="rounded-[14px] bg-muted px-3.5 py-3">
          <Text className="text-[14px] text-muted-foreground">Bu yanıt silindi.</Text>
        </View>
      );
    }
    return (
      <View key={r.id} className={cn('gap-1.5', replyTo?.id === r.id && 'rounded-[14px] bg-secondary/70 p-2')}>
        {parent ? (
          <View className="flex-row items-center gap-1">
            <ArrowBendDownRightIcon size={14} weight="bold" color={COLORS.mutedForeground} />
            {parent.deleted ? (
              <Text className="text-[12.5px] text-muted-foreground">Silinen bir yanıta yanıt</Text>
            ) : (
              <Text className="text-[12.5px] text-muted-foreground">
                {parent.authorHandle ? (
                  <Text onPress={() => openPerson(parent.authorHandle)} className="font-sans-semibold text-[12.5px] text-primary">
                    @{parent.authorHandle}
                  </Text>
                ) : (
                  parent.authorName
                )}{' '}
                kişisine yanıt
              </Text>
            )}
          </View>
        ) : null}
        <View className="flex-row items-center gap-2">
          <Avatar name={r.authorName} size={30} />
          {author(r.authorName, r.authorHandle, r.mine, 'sm')}
          {r.authorId === t.authorId ? (
            <View className="rounded-full bg-secondary px-2 py-0.5">
              <Text className="font-sans-bold text-[11px] text-primary">Konuyu açan</Text>
            </View>
          ) : null}
          <Text className="ml-auto text-[12.5px] text-muted-foreground">{agoLabel(new Date(r.createdAt), now)}</Text>
        </View>
        {r.body ? <MentionText text={r.body} className="text-[15px] leading-[23px]" /> : null}
        {r.photos.length ? <PhotoGrid photos={r.photos} label={`${r.authorName} kişisinin yanıtındaki fotoğraflar`} /> : null}
        {actions({ kind: 'reply', reply: r, answered: answered.has(r.id) }, r.mine, r.id, { liked: r.liked, count: r.likeCount })}
      </View>
    );
  };

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
            <View className="min-w-0 flex-1">
              {author(t.authorName, t.authorHandle, t.mine, 'lg')}
              <Text className="text-[13px] text-muted-foreground">{agoLabel(new Date(t.createdAt), now)}</Text>
            </View>
          </View>
          <MentionText text={t.body} className="text-[16px] leading-[25px]" />
          {t.photos.length ? <PhotoGrid photos={t.photos} label="Konunun fotoğrafları" /> : null}
          {actions({ kind: 'topic' }, t.mine, t.id, { liked: t.liked, count: t.likeCount })}
        </View>

        <View className="mb-2 mt-5 flex-row items-center gap-2">
          <ChatsTeardropIcon size={22} weight="duotone" color={COLORS.primary} />
          <Text role="heading" className="font-heading text-[18px]">
            {repliesLabel(shown)}
          </Text>
        </View>
        {thread.length === 0 ? <Text className="text-[15px] text-muted-foreground">Henüz yanıt yok. İlk yanıtı siz yazın.</Text> : null}
        <View className="gap-2.5">
          {thread.map(({ reply, children }) => (
            <View key={reply.id} className="gap-3 rounded-[18px] border border-border bg-card px-3.5 pb-1 pt-3">
              {replyCard(reply)}
              {children.length ? (
                <View className="ml-1 gap-3 border-l-2 border-border pl-3" accessibilityLabel="Bu yanıta gelen yanıtlar">
                  {children.map(({ reply: child, parent }) => replyCard(child, parent))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="gap-2 border-t border-border bg-card px-3 pt-2.5" style={{ paddingBottom: insets.bottom + 10 }}>
        {replyTo ? (
          <View className="flex-row items-center gap-2 rounded-[12px] bg-secondary px-3 py-1.5">
            <ArrowBendDownRightIcon size={15} weight="bold" color={COLORS.primary} />
            <Text numberOfLines={1} className="flex-1 text-[13.5px] text-primary">
              <Text className="font-sans-bold text-[13.5px] text-primary">{replyTo.authorName}</Text> kişisine yanıt veriyorsunuz
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Konuya yanıt yaz (bu yanıta değil)"
              hitSlop={8}
              onPress={() => {
                setReplyTo(null);
                if (replyTo.authorHandle && draft.trim() === `@${replyTo.authorHandle}`) setDraft('');
              }}
              className="size-9 items-center justify-center rounded-full active:bg-primary/10">
              <XIcon size={16} weight="bold" color={COLORS.primary} />
            </Pressable>
          </View>
        ) : null}
        {error ? (
          <Text role="alert" className="px-1 text-[13.5px] text-destructive">
            {error}
          </Text>
        ) : null}
        {signedIn ? (
          <>
            <MentionSuggestions
              text={draft}
              selection={selection}
              topicId={t.id}
              onPick={(next) => {
                setDraft(next.text);
                setSelection({ start: next.cursor, end: next.cursor });
                input.current?.focus();
              }}
            />
            <PhotoThumbs uploads={photos} />
            <View className="flex-row items-end gap-1.5">
              <PhotoButtons uploads={photos} compact />
              <TextInput
                ref={input}
                value={draft}
                onChangeText={(v) => {
                  setDraft(v);
                  setError(null);
                }}
                onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                placeholder={replyTo ? 'Yanıtınızı yazın…' : 'Yanıt yazın… (@ ile birinden bahsedin)'}
                placeholderTextColorClassName="accent-muted-foreground"
                accessibilityLabel={replyTo ? `${replyTo.authorName} kişisine yanıtınız` : 'Yanıtınız'}
                multiline
                maxLength={REPLY_MAX}
                className="max-h-32 min-h-12 flex-1 rounded-[22px] border border-input bg-background px-4 py-3 font-sans text-[15px] text-foreground"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Yanıtı gönder"
                accessibilityState={{ disabled: !canSend, busy: sending }}
                disabled={!canSend}
                onPress={send}
                className={cn('size-12 items-center justify-center rounded-full bg-primary', !canSend && 'opacity-40')}>
                {sending ? <ActivityIndicator color={COLORS.white} /> : <PaperPlaneRightIcon size={21} weight="fill" color={COLORS.white} />}
              </Pressable>
            </View>
          </>
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
        body={
          deleting?.kind === 'reply'
            ? deleting.answered
              ? 'Altındaki yanıtlar kalır; sizinkinin yerinde “Bu yanıt silindi” yazar.'
              : 'Yanıt kalıcı olarak silinir.'
            : t.replies.length
              ? 'Konu, yanıtlarıyla birlikte kalıcı olarak silinir.'
              : 'Konu kalıcı olarak silinir.'
        }
        action="Sil"
      />
      <ReportDialog open={!!reporting} onClose={() => setReporting(null)} onReport={report} title={reporting?.kind === 'reply' ? 'Yanıtı şikâyet et' : 'Konuyu şikâyet et'} reasons={FORUM_REPORT_REASONS} />
    </KeyboardAvoidingView>
  );
}
