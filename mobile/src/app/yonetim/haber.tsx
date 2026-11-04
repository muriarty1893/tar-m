import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

import { ApiError, api } from '@/api/client';
import { keys, queryClient, refresh, useAdminArticle, useMe } from '@/api/queries';
import type { AdminArticle, ArticleInput } from '@/api/types';
import { uploadPhoto } from '@/api/upload';
import { AdminGate } from '@/components/admin/admin-gate';
import { Segmented } from '@/components/app/segmented';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { ErrorState, Loading } from '@/components/app/states';
import ArticleDom from '@/components/dom/article-dom';
import { useDomHeight, useDomStart } from '@/components/dom/use-dom-height';
import { Choices, ErrorSummary, Field, TextField, inputClass } from '@/components/form/field';
import { FormScreen } from '@/components/form/form-screen';
import { CaretLeftIcon, CaretRightIcon, CheckCircleIcon, ImageSquareIcon, LinkSimpleIcon, ListBulletsIcon, ListNumbersIcon, QuotesIcon, TextBIcon, TextHTwoIcon, TextItalicIcon, TrashIcon, type PhosphorIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { addDays, dayKey, fromDayKey, longDate } from '@/domain/format';
import { ARTICLE_FIELD_NAMES, ARTICLE_FIELD_ORDER, BODY_MAX, MARKDOWN_TOOLS, SUMMARY_MAX, TITLE_MAX, applyTool, slugify, validateArticle, type ArticleErrors } from '@/domain/news';
import { errorMessage } from '@/lib/api-errors';
import { siteUrl } from '@/lib/config';
import { cn } from '@/lib/utils';
import { hasErrors, mergeErrors } from '@/lib/form-errors';
import { COLORS } from '@/theme/tokens';

const TOOL_ICONS: Record<string, PhosphorIcon> = { h2: TextHTwoIcon, bold: TextBIcon, italic: TextItalicIcon, ul: ListBulletsIcon, ol: ListNumbersIcon, quote: QuotesIcon, link: LinkSimpleIcon };
const STATUS_OPTIONS = [
  { id: 'draft' as const, label: 'Taslak' },
  { id: 'published' as const, label: 'Yayında' },
];

const fromArticle = (a: AdminArticle): ArticleInput => ({ title: a.title, slug: a.slug, summary: a.summary, body: a.body, cover: a.cover ?? '', date: a.date, status: a.status });

/** The news editor (admins): write or edit an article, with a Markdown toolbar, a preview and a cover photo. ?id= edits one. */
export default function ArticleEditorScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  // The article this screen opened on: saving a new one adds its id to the address, which mustn't reload the editor.
  const [id] = useState(params.id);
  const me = useMe();
  const existing = useAdminArticle(me.data?.admin ? (id ?? '') : '');
  const title = id ? 'Haberi düzenle' : 'Yeni haber';
  // Not (yet) known as an admin: the gate says why, with the sheet's close button.
  if (!me.data?.admin) {
    return (
      <FormScreen title={title} footer={null}>
        <AdminGate>{() => null}</AdminGate>
      </FormScreen>
    );
  }
  if (id && existing.isPending) {
    return (
      <FormScreen title={title} footer={null}>
        <Loading />
      </FormScreen>
    );
  }
  if (id && (existing.isError || !existing.data)) {
    return (
      <FormScreen title={title} footer={null}>
        <ErrorState error={existing.error} onRetry={() => existing.refetch()} />
      </FormScreen>
    );
  }
  return <Editor id={id} initial={id && existing.data ? fromArticle(existing.data) : { title: '', slug: '', summary: '', body: '', cover: '', date: dayKey(new Date()), status: 'draft' }} />;
}

function Editor({ id: startId, initial }: { id?: string; initial: ArticleInput }) {
  const [id, setId] = useState(startId);
  const [a, setA] = useState<ArticleInput>(initial);
  const [slugEdited, setSlugEdited] = useState(!!startId);
  const [tab, setTab] = useState<'yaz' | 'onizle'>('yaz');
  const [preview, setPreview] = useState<{ html: string; loading: boolean; error?: string }>({ html: '', loading: false });
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [forced, setForced] = useState<{ start: number; end: number } | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [server, setServer] = useState<ArticleErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const inputs = useRef<Partial<Record<keyof ArticleInput, TextInput | null>>>({});
  const dirty = useRef(false);
  const body = useDomHeight(160);
  const view = useDomStart();

  const errors = mergeErrors(validateArticle(a), server);
  const shown = (k: keyof ArticleInput) => (submitted ? errors[k] : undefined);
  const set = <K extends keyof ArticleInput>(k: K, v: ArticleInput[K]) => {
    dirty.current = true;
    setSaved(null);
    setServer((e) => ({ ...e, [k]: undefined }));
    setA((d) => ({ ...d, [k]: v }));
  };
  const setTitle = (t: string) => {
    set('title', t);
    if (!slugEdited) setA((d) => ({ ...d, slug: slugify(t) }));
  };
  const summary = submitted ? ARTICLE_FIELD_ORDER.filter((k) => errors[k]) : [];
  const date = fromDayKey(a.date);
  const focusField = (k: keyof ArticleInput) => {
    if (k !== 'body') return inputs.current[k]?.focus();
    setTab('yaz');
    setTimeout(() => inputs.current.body?.focus(), 50);
  };

  const showPreview = async () => {
    setTab('onizle');
    setPreview((p) => ({ ...p, loading: true, error: undefined }));
    try {
      const { html } = await api<{ html: string }>('/yonetim/onizleme', { method: 'POST', body: { body: a.body } });
      setPreview({ html, loading: false });
    } catch (err) {
      setPreview({ html: '', loading: false, error: errorMessage(err) });
    }
  };

  const tool = (t: (typeof MARKDOWN_TOOLS)[number]) => {
    const next = applyTool(a.body, selection, t);
    set('body', next.text);
    setSelection(next.selection);
    setForced(next.selection);
    inputs.current.body?.focus();
    // Let the text box take the new cursor, then hand it back.
    setTimeout(() => setForced(undefined), 50);
  };

  const pickCover = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
      if (res.canceled) return;
      setUploading(true);
      set('cover', await uploadPhoto(res.assets[0], 'haberler'));
    } catch (err) {
      Alert.alert('Kapak yüklenemedi', errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSubmitted(true);
    setMessage(null);
    setSaved(null);
    if (uploading) return setMessage('Kapak fotoğrafı yükleniyor; bitince yeniden dokunun.');
    if (hasErrors(errors)) {
      // The text is wrong but hidden behind the preview: back to writing, where it can be fixed.
      if (errors.body && tab === 'onizle') setTab('yaz');
      return scroll.current?.scrollTo({ y: 0, animated: true });
    }
    setSaving(true);
    try {
      const res = await api<{ id: string }>(id ? `/yonetim/haberler/${id}` : '/yonetim/haberler', { method: id ? 'PUT' : 'POST', body: a });
      setId(res.id);
      router.setParams({ id: res.id });
      dirty.current = false;
      await refresh(keys.admin, keys.news, keys.article(a.slug));
      setSaved(a.status === 'published' ? 'Kaydedildi: sitede ve uygulamada yayında.' : 'Taslak kaydedildi: yalnızca yönetim panelinde görünür.');
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.errors).length) {
        setServer(err.errors);
        if (err.errors.body && tab === 'onizle') setTab('yaz');
      }
      setMessage(errorMessage(err));
      scroll.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await api(`/yonetim/haberler/${id}`, { method: 'DELETE' });
      queryClient.removeQueries({ queryKey: [...keys.admin, 'article', id] });
      await refresh(keys.admin, keys.news);
      setDeleteOpen(false);
      dirty.current = false;
      if (router.canGoBack()) router.back();
      else router.replace('/yonetim/haberler');
    } catch (err) {
      Alert.alert('Silinemedi', errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const close = () => {
    const leave = () => (router.canGoBack() ? router.back() : router.replace('/yonetim'));
    if (!dirty.current) return leave();
    Alert.alert('Değişiklikler kaydedilmedi', 'Çıkarsanız yazdıklarınız silinir.', [
      { text: 'Yazmaya devam et', style: 'cancel' },
      { text: 'Çık', style: 'destructive', onPress: leave },
    ]);
  };

  const action = saving ? 'Kaydediliyor…' : uploading ? 'Kapak yükleniyor…' : a.status === 'published' ? (initial.status === 'published' && id ? 'Kaydet' : 'Yayınla') : 'Taslağı kaydet';

  return (
    <FormScreen
      ref={scroll}
      title={id ? 'Haberi düzenle' : 'Yeni haber'}
      onClose={close}
      footer={
        <>
          {saved ? (
            <View className="flex-row items-center justify-center gap-2" accessibilityLiveRegion="polite">
              <CheckCircleIcon size={18} weight="fill" color={COLORS.primary} />
              <Text className="font-sans-semibold text-[14px] text-primary">{saved}</Text>
            </View>
          ) : message && !summary.length ? (
            <Text role="alert" className="text-center text-[14px] text-destructive">
              {message}
            </Text>
          ) : summary.length ? (
            <Text role="alert" className="text-center text-[14px] text-destructive">
              Kaydetmeden önce yukarıdaki {summary.length} alanı düzeltin.
            </Text>
          ) : null}
          <Button className="h-14 rounded-full" disabled={saving} onPress={save} accessibilityState={{ busy: saving }}>
            {saving ? <ActivityIndicator color={COLORS.white} /> : null}
            <Text className="text-[16px]">{action}</Text>
          </Button>
        </>
      }>
      <ErrorSummary message={summary.length ? (message ?? undefined) : undefined} items={summary.map((k) => ({ key: k, label: ARTICLE_FIELD_NAMES[k], error: errors[k]! }))} onPick={focusField} />

      <TextField
        ref={(r) => {
          inputs.current.title = r;
        }}
        label="Başlık"
        required
        value={a.title}
        onChangeText={setTitle}
        error={shown('title')}
        maxLength={TITLE_MAX}
        multiline
        className="h-auto min-h-14 py-3"
      />
      <TextField
        ref={(r) => {
          inputs.current.slug = r;
        }}
        label="Adres"
        required
        value={a.slug}
        onChangeText={(t) => {
          setSlugEdited(true);
          set('slug', t.toLowerCase().replace(/\s+/g, '-'));
        }}
        error={shown('slug')}
        hint={`Sitede: /haberler/${a.slug || 'haber-adresi'}`}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextField
        ref={(r) => {
          inputs.current.summary = r;
        }}
        label="Özet"
        required
        value={a.summary}
        onChangeText={(t) => set('summary', t)}
        error={shown('summary')}
        hint={`Listede ve paylaşım önizlemesinde görünür. ${a.summary.length}/${SUMMARY_MAX}`}
        multiline
        maxLength={SUMMARY_MAX}
        className="h-24"
      />

      <Field label="Tarih" required error={shown('date')}>
        <View className="h-14 flex-row items-center gap-2 rounded-[16px] border border-input bg-card px-1.5">
          <Pressable accessibilityRole="button" accessibilityLabel="Önceki gün" onPress={() => set('date', dayKey(addDays(date, -1)))} className="size-11 items-center justify-center rounded-full active:bg-secondary">
            <CaretLeftIcon size={20} weight="bold" color={COLORS.foreground} />
          </Pressable>
          <Text className="flex-1 text-center font-sans-semibold text-[15px]" accessibilityLiveRegion="polite">
            {longDate(a.date)}
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Sonraki gün" onPress={() => set('date', dayKey(addDays(date, 1)))} className="size-11 items-center justify-center rounded-full active:bg-secondary">
            <CaretRightIcon size={20} weight="bold" color={COLORS.foreground} />
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" onPress={() => set('date', dayKey(new Date()))} className="min-h-11 justify-center self-start rounded-full border border-border bg-card px-3.5 active:bg-secondary">
          <Text className="font-sans-semibold text-[14px]">Bugün</Text>
        </Pressable>
      </Field>

      <Field label="Kapak fotoğrafı" error={shown('cover')} hint="İsteğe bağlı. Yatay bir fotoğraf en iyi görünür.">
        {a.cover ? (
          <View className="overflow-hidden rounded-[18px] bg-muted">
            <Image source={{ uri: siteUrl(a.cover) }} style={{ width: '100%', aspectRatio: 16 / 9 }} contentFit="cover" accessibilityLabel="Kapak fotoğrafı" />
            <View className="absolute bottom-2 right-2 flex-row gap-2">
              <Button size="sm" variant="outline" className="h-11 rounded-full bg-white/95" disabled={uploading} onPress={pickCover}>
                <Text className="text-[14px]">Değiştir</Text>
              </Button>
              <Button size="sm" variant="outline" className="h-11 rounded-full bg-white/95" disabled={uploading} onPress={() => set('cover', '')}>
                <Text className="text-[14px] text-destructive">Kaldır</Text>
              </Button>
            </View>
            {uploading ? (
              <View className="absolute inset-0 items-center justify-center bg-black/40">
                <ActivityIndicator color={COLORS.white} />
              </View>
            ) : null}
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={pickCover} disabled={uploading} className="h-28 items-center justify-center gap-1 rounded-[18px] border-2 border-dashed border-primary/40 bg-secondary/60 active:bg-secondary">
            {uploading ? <ActivityIndicator color={COLORS.primary} /> : <ImageSquareIcon size={28} weight="duotone" color={COLORS.primary} />}
            <Text className="font-sans-semibold text-[14px] text-primary">{uploading ? 'Yükleniyor…' : 'Galeriden kapak seçin'}</Text>
          </Pressable>
        )}
      </Field>

      <Field label="Metin" required={a.status === 'published'} error={shown('body')} hint={`Markdown. ${a.body.length.toLocaleString('tr-TR')}/${BODY_MAX.toLocaleString('tr-TR')}`}>
        <Segmented
          label="Metin görünümü"
          value={tab}
          onChange={(t) => (t === 'onizle' ? showPreview() : setTab('yaz'))}
          options={[
            { id: 'yaz', label: 'Yaz' },
            { id: 'onizle', label: 'Önizleme' },
          ]}
        />
        {tab === 'yaz' ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1.5" keyboardShouldPersistTaps="always" accessibilityLabel="Biçimlendirme">
              {MARKDOWN_TOOLS.map((t) => {
                const Icon = TOOL_ICONS[t.id];
                return (
                  <Pressable key={t.id} accessibilityRole="button" accessibilityLabel={t.label} onPress={() => tool(t)} className="size-12 items-center justify-center rounded-[14px] border border-border bg-card active:bg-secondary">
                    <Icon size={22} weight="bold" color={COLORS.foreground} />
                  </Pressable>
                );
              })}
            </ScrollView>
            <TextInput
              ref={(r) => {
                inputs.current.body = r;
              }}
              value={a.body}
              onChangeText={(t) => set('body', t)}
              onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
              selection={forced}
              multiline
              textAlignVertical="top"
              maxLength={BODY_MAX}
              placeholder={'Haberin metni…\n\n## Ara başlık\n\nParagraflar arasında bir boş satır bırakın.'}
              placeholderTextColorClassName="accent-muted-foreground"
              accessibilityLabel="Haberin metni"
              aria-invalid={!!shown('body')}
              className={cn(inputClass(shown('body')), 'h-auto min-h-72 border py-3 text-[15.5px] leading-6')}
            />
          </>
        ) : (
          <View className="min-h-40 rounded-[18px] border border-border bg-card p-4">
            {preview.loading ? (
              <Loading label="Önizleme hazırlanıyor…" />
            ) : preview.error ? (
              <Text role="alert" className="text-[14px] text-destructive">
                {preview.error}
              </Text>
            ) : a.body.trim() ? (
              <ArticleDom ref={view} html={preview.html} onLink={async () => {}} onHeight={body.onHeight} dom={body.dom} />
            ) : (
              <Text className="text-[15px] text-muted-foreground">Henüz metin yok.</Text>
            )}
            <Button variant="ghost" className="mt-2 h-11 rounded-full" onPress={() => setTab('yaz')}>
              <Text className="text-primary">Yazmaya dön</Text>
            </Button>
          </View>
        )}
      </Field>

      <Field label="Durum" error={shown('status')} hint={a.status === 'published' ? 'Kaydedince sitede ve uygulamada hemen görünür.' : 'Taslaklar yalnızca yönetim panelinde görünür.'}>
        <Choices label="Durum" options={STATUS_OPTIONS} value={a.status} onChange={(s) => set('status', s)} />
      </Field>

      {id ? (
        <Button variant="outline" className="h-12 rounded-full border-destructive/50" onPress={() => setDeleteOpen(true)}>
          <TrashIcon size={20} weight="duotone" color={COLORS.destructive} />
          <Text className="text-destructive">Haberi sil</Text>
        </Button>
      ) : null}
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={remove} busy={deleting} title="Haber silinsin mi?" body={`“${a.title || 'Bu haber'}” kalıcı olarak silinir; sitede ve uygulamada da kalkar.`} action="Sil" />
    </FormScreen>
  );
}
