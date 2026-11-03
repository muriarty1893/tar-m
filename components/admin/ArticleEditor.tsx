"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  ImageIcon,
  LinkSimpleIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  QuotesIcon,
  TextBIcon,
  TextHTwoIcon,
  TextItalicIcon,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { deleteArticle, previewMarkdown, saveArticle } from "@/app/yonetim/actions";
import {
  ARTICLE_FIELD_ORDER,
  SUMMARY_MAX,
  slugify,
  validateArticle,
  type ArticleErrors,
  type ArticleField,
  type ArticleInput,
} from "@/lib/news";
import { randomName, shrinkImage } from "@/lib/shrink-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, describedBy } from "@/components/forms/fields";

const LABELS: Record<ArticleField, string> = {
  title: "Başlık",
  slug: "Adres",
  summary: "Özet",
  body: "Metin",
  cover: "Kapak fotoğrafı",
  date: "Tarih",
  status: "Durum",
};
const IDS: Record<ArticleField, string> = {
  title: "haber-baslik",
  slug: "haber-adres",
  summary: "haber-ozet",
  body: "haber-metin",
  cover: "haber-kapak",
  date: "haber-tarih",
  status: "haber-durum-taslak",
};

/** Toolbar actions: wrap the selection, or put a prefix at the start of each selected line. */
const TOOLS: { label: string; Icon: typeof TextBIcon; wrap?: [string, string]; line?: string; placeholder: string }[] = [
  { label: "Ara başlık", Icon: TextHTwoIcon, line: "## ", placeholder: "Ara başlık" },
  { label: "Kalın", Icon: TextBIcon, wrap: ["**", "**"], placeholder: "kalın yazı" },
  { label: "İtalik", Icon: TextItalicIcon, wrap: ["_", "_"], placeholder: "italik yazı" },
  { label: "Madde listesi", Icon: ListBulletsIcon, line: "- ", placeholder: "madde" },
  { label: "Numaralı liste", Icon: ListNumbersIcon, line: "1. ", placeholder: "adım" },
  { label: "Alıntı", Icon: QuotesIcon, line: "> ", placeholder: "alıntı" },
  { label: "Bağlantı", Icon: LinkSimpleIcon, wrap: ["[", "](https://)"], placeholder: "bağlantı metni" },
];

/** The news editor on /yonetim/haberler: new (no `articleId`) or editing one. */
export function ArticleEditor({ initial, articleId, justSaved = false }: { initial: ArticleInput; articleId?: string; justSaved?: boolean }) {
  const [v, setV] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [slugEdited, setSlugEdited] = useState(Boolean(articleId));
  const [errors, setErrors] = useState<ArticleErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [savedAt, setSavedAt] = useState(justSaved ? "Kaydedildi." : "");
  const [tab, setTab] = useState<"yaz" | "onizleme">("yaz");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, start] = useTransition();
  const body = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const shown = submitted ? { ...validateArticle(v), ...errors } : errors;
  const summaryList = submitted ? ARTICLE_FIELD_ORDER.filter((f) => shown[f]) : [];

  const set = <K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) => {
    setV((x) => ({ ...x, [key]: value, ...(key === "title" && !slugEdited ? { slug: slugify(String(value)) } : {}) }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setSavedAt("");
  };

  function applyTool(t: (typeof TOOLS)[number]) {
    const el = body.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const selected = value.slice(a, b) || t.placeholder;
    let insert: string;
    if (t.wrap) insert = `${t.wrap[0]}${selected}${t.wrap[1]}`;
    else insert = selected.split("\n").map((l, i) => (t.line === "1. " ? `${i + 1}. ` : t.line) + l).join("\n");
    // Line formats start on a new line.
    const before = value.slice(0, a);
    const lead = t.line && before && !before.endsWith("\n") ? "\n" : "";
    const next = before + lead + insert + value.slice(b);
    set("body", next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = (before + lead).length;
      el.setSelectionRange(pos, pos + insert.length);
    });
  }

  async function onCover(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setErrors((e) => ({ ...e, cover: undefined }));
    try {
      const blob = await shrinkImage(file, 1600);
      const ext = blob.type === "image/webp" ? "webp" : "jpg";
      const result = await upload(`haberler/${randomName()}.${ext}`, blob, { access: "public", handleUploadUrl: "/api/yonetim/kapak", contentType: blob.type });
      set("cover", result.url);
    } catch {
      setErrors((e) => ({ ...e, cover: "Fotoğraf yüklenemedi; yeniden deneyin." }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setMessage("");
    if (uploading) return setMessage("Kapak fotoğrafı yükleniyor; birkaç saniye bekleyin.");
    const clientErrors = validateArticle(v);
    if (Object.keys(clientErrors).length) {
      // The text box is hidden while previewing: bring it back if the text is what needs fixing.
      if (clientErrors.body) setTab("yaz");
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    start(async () => {
      let r: Awaited<ReturnType<typeof saveArticle>> | undefined;
      try {
        r = await saveArticle(v, articleId);
      } catch (err) {
        // A redirect after a new article is saved is not a failure.
        if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")) throw err;
        console.error("saveArticle", err);
        setMessage("Kaydedilemedi: bağlantı ya da sunucu hatası. Sayfayı yenilemeden yeniden deneyin; sorun sürerse metni bir yere kopyalayın.");
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      // A new article opens in the editor (the action redirects); an edit stays here.
      if (!r) return;
      setErrors(r.errors);
      setMessage(r.message ?? "");
      if (r.saved) {
        setSaved(v);
        setSubmitted(false);
        setSavedAt(`Kaydedildi, ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}.`);
      } else {
        if (r.errors.body) setTab("yaz");
        requestAnimationFrame(() => summaryRef.current?.focus());
      }
    });
  }

  /** An error in the summary: go to its field (back in the writing view for the text). */
  const goTo = (f: ArticleField) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (f === "body") setTab("yaz");
    requestAnimationFrame(() => {
      const el = document.getElementById(IDS[f]);
      el?.scrollIntoView({ block: "center" });
      el?.focus();
    });
  };

  const showPreview = () => {
    setTab("onizleme");
    start(async () => {
      try {
        setPreview(await previewMarkdown(v.body));
      } catch {
        setPreview("<p>Önizleme yüklenemedi; yeniden deneyin.</p>");
      }
    });
  };

  const slugChangedLive = Boolean(articleId) && initial.status === "published" && v.slug !== initial.slug;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="min-w-0 space-y-7">
        {(summaryList.length > 0 || message) && (
          <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="haber-hata" className="rounded-2xl border-l-4 border-destructive bg-destructive/10 p-4 outline-none">
            <p id="haber-hata" className="flex items-center gap-2 font-semibold">
              <WarningCircleIcon aria-hidden="true" weight="fill" className="size-6 text-destructive" />
              {message || "Kaydetmeden önce şunları düzeltin:"}
            </p>
            {summaryList.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-10">
                {summaryList.map((f) => (
                  <li key={f}>
                    <a href={`#${IDS[f]}`} onClick={goTo(f)} className="font-semibold underline underline-offset-4">
                      {LABELS[f]}: {shown[f]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Field id={IDS.title} label="Başlık" error={shown.title}>
          <Input id={IDS.title} value={v.title} onChange={(e) => set("title", e.target.value)} className="text-xl font-semibold" placeholder="Ör. Buğday hasadı başladı" {...describedBy(IDS.title, shown.title)} />
        </Field>

        <Field id={IDS.slug} label="Adres" error={shown.slug}>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-muted-foreground">/haberler/</span>
            <Input
              id={IDS.slug}
              value={v.slug}
              onChange={(e) => {
                setSlugEdited(true);
                set("slug", e.target.value.toLowerCase());
              }}
              autoCapitalize="off"
              spellCheck={false}
              {...describedBy(IDS.slug, shown.slug)}
            />
          </div>
          {!articleId && !slugEdited && <p className="text-sm text-muted-foreground">Başlıktan oluşturulur; isterseniz değiştirin.</p>}
          {slugChangedLive && <p className="text-sm font-semibold text-gold">Yayındaki haberin adresini değiştirirseniz paylaşılmış eski bağlantılar açılmaz.</p>}
        </Field>

        <Field id={IDS.summary} label="Özet" error={shown.summary}>
          <Textarea
            id={IDS.summary}
            value={v.summary}
            onChange={(e) => set("summary", e.target.value)}
            rows={3}
            maxLength={SUMMARY_MAX + 20}
            className="min-h-24"
            aria-describedby={`haber-ozet-not${shown.summary ? ` ${IDS.summary}-hata` : ""}`}
            aria-invalid={shown.summary ? true : undefined}
          />
          <p id="haber-ozet-not" className="flex justify-between gap-3 text-sm text-muted-foreground">
            <span>Haber listesinde ve WhatsApp paylaşım önizlemesinde görünür.</span>
            <span className="shrink-0 tabular-nums">
              {v.summary.trim().length} / {SUMMARY_MAX}
            </span>
          </p>
        </Field>

        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <label htmlFor={IDS.body} className="text-base font-semibold">
              Metin
            </label>
            <div role="group" aria-label="Yaz ya da önizle" className="grid grid-cols-2 gap-1 rounded-[var(--btn-radius)] bg-muted p-1">
              <button type="button" aria-pressed={tab === "yaz"} onClick={() => setTab("yaz")} className="min-h-10 cursor-pointer rounded-[calc(var(--btn-radius)-2px)] px-4 font-semibold text-muted-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-soft">
                Yaz
              </button>
              <button type="button" aria-pressed={tab === "onizleme"} onClick={showPreview} className="min-h-10 cursor-pointer rounded-[calc(var(--btn-radius)-2px)] px-4 font-semibold text-muted-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-soft">
                Önizleme
              </button>
            </div>
          </div>
          {tab === "yaz" ? (
            <>
              <div role="toolbar" aria-label="Biçimlendirme" className="flex flex-wrap gap-1 rounded-t-2xl border-2 border-b-0 border-input bg-surface p-1.5">
                {TOOLS.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => applyTool(t)}
                    aria-label={t.label}
                    title={t.label}
                    className="flex size-11 cursor-pointer items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary"
                  >
                    <t.Icon aria-hidden="true" weight="bold" className="size-5" />
                  </button>
                ))}
              </div>
              <Textarea
                ref={body}
                id={IDS.body}
                value={v.body}
                onChange={(e) => set("body", e.target.value)}
                rows={18}
                className="-mt-2 rounded-t-none font-mono text-base leading-relaxed"
                placeholder={"Haberin metni.\n\n## Ara başlık\n\n**Kalın** yazı, - madde listesi…"}
                {...describedBy(IDS.body, shown.body)}
              />
              <p className="text-sm text-muted-foreground">
                Markdown ile: <code>## Ara başlık</code>, <code>**kalın**</code>, <code>- madde</code>, <code>[bağlantı](https://…)</code>. Boş satır yeni paragraf başlatır.
              </p>
            </>
          ) : (
            <div className="min-h-64 rounded-2xl border-2 border-input p-6">
              <p className="mb-4 text-sm text-muted-foreground">
                Önizleme: haber sitede böyle görünecek.{" "}
                <button type="button" onClick={() => setTab("yaz")} className="cursor-pointer font-semibold text-primary underline underline-offset-4">
                  Yazmaya dön
                </button>
              </p>
              {pending && !preview ? (
                <p className="text-muted-foreground">Önizleme hazırlanıyor…</p>
              ) : preview ? (
                <div className="prose-article space-y-5 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: preview }} />
              ) : (
                <p className="text-muted-foreground">Metin boş.</p>
              )}
            </div>
          )}
          {shown.body && <FieldError id={`${IDS.body}-hata`}>{shown.body}</FieldError>}
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24">
        <fieldset className="rounded-2xl border border-border p-5">
          <legend className="px-1 text-base font-semibold">Durum</legend>
          {(
            [
              ["draft", "Taslak", "Yalnızca yöneticiler görür."],
              ["published", "Yayında", "Haberler sayfasında herkes görür."],
            ] as const
          ).map(([id, label, hint]) => (
            <label key={id} className="mt-2 flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-secondary">
              <input
                type="radio"
                id={id === "draft" ? IDS.status : "haber-durum-yayinda"}
                name="durum"
                checked={v.status === id}
                onChange={() => set("status", id)}
                className="mt-1 size-5 accent-[var(--primary)]"
              />
              <span>
                <span className="block font-semibold">{label}</span>
                <span className="block text-sm text-muted-foreground">{hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <Field id={IDS.date} label="Tarih" error={shown.date}>
          <Input id={IDS.date} type="date" value={v.date} onChange={(e) => set("date", e.target.value)} {...describedBy(IDS.date, shown.date)} />
        </Field>

        <div className="space-y-2">
          <p className="text-base font-semibold">
            Kapak fotoğrafı <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
          </p>
          {v.cover ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-muted">
              <Image src={v.cover} alt="Kapak fotoğrafı" fill sizes="320px" className="object-cover" />
            </div>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border-2 border-dashed border-input text-muted-foreground">
              <ImageIcon aria-hidden="true" weight="duotone" className="size-10" />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <label htmlFor={IDS.cover} className="inline-flex min-h-11 cursor-pointer items-center rounded-[var(--btn-radius)] border-2 border-primary px-4 font-semibold text-primary hover:bg-primary/10 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring/30">
              {uploading ? "Yükleniyor…" : v.cover ? "Değiştir" : "Fotoğraf yükle"}
              <input
                ref={fileRef}
                id={IDS.cover}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => onCover(e.target.files)}
                {...describedBy(IDS.cover, shown.cover)}
              />
            </label>
            {v.cover && (
              <Button variant="ghost" size="sm" onClick={() => set("cover", "")}>
                Kaldır
              </Button>
            )}
          </div>
          {shown.cover && <FieldError id={`${IDS.cover}-hata`}>{shown.cover}</FieldError>}
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <Button type="submit" size="lg" disabled={pending || uploading} className="w-full">
            {pending && tab === "yaz" ? "Kaydediliyor…" : articleId ? "Kaydet" : v.status === "published" ? "Yayınla" : "Taslak olarak kaydet"}
          </Button>
          {(summaryList.length > 0 || message) && (
            <p className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
              <WarningCircleIcon aria-hidden="true" weight="fill" className="mt-0.5 size-5 shrink-0" />
              <span>
                {summaryList.length > 0 ? `Kaydedilmedi: ${summaryList.length} alanı düzeltin (${summaryList.map((f) => LABELS[f]).join(", ")}).` : message}
              </span>
            </p>
          )}
          <p role="status" className="min-h-6 text-center font-semibold text-primary">
            {savedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircleIcon aria-hidden="true" weight="fill" className="size-5" />
                {savedAt}
              </span>
            ) : dirty && articleId ? (
              <span className="text-muted-foreground">Kaydedilmemiş değişiklikler var.</span>
            ) : null}
          </p>
          {articleId && saved.status === "published" && (
            <Link href={`/haberler/${saved.slug}`} target="_blank" className="inline-flex min-h-11 w-full items-center justify-center gap-2 font-semibold text-primary underline-offset-4 hover:underline">
              Sitede gör
              <ArrowSquareOutIcon aria-hidden="true" weight="bold" className="size-5" />
            </Link>
          )}
        </div>

        {articleId && (
          <div className="border-t border-border pt-6">
            {confirmDelete ? (
              <div role="alertdialog" aria-labelledby="haber-sil" className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-4">
                <p id="haber-sil" className="font-semibold">
                  Haber kalıcı olarak silinsin mi? Bu işlem geri alınamaz.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setConfirmDelete(false)} autoFocus>
                    Vazgeç
                  </Button>
                  <Button
                    disabled={pending}
                    onClick={() => start(() => deleteArticle(articleId))}
                    className="bg-destructive hover:bg-[color-mix(in_oklab,var(--destructive),black_12%)]"
                  >
                    Evet, sil
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)} className="w-full text-destructive hover:bg-destructive/10">
                <TrashIcon aria-hidden="true" weight="bold" />
                Haberi sil
              </Button>
            )}
          </div>
        )}
      </aside>
    </form>
  );
}
