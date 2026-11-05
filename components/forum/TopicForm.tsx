"use client";

import { useRef, useState, useTransition } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { createTopic, updateTopic } from "@/app/forum/actions";
import { TOPIC_BODY_MAX, TOPIC_TITLE_MAX, validateTopic, type ForumCats, type TopicErrors, type TopicInput } from "@/lib/forum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, SelectChevron, selectClass } from "@/components/forms/fields";
import { MentionTextarea } from "@/components/forum/MentionTextarea";
import { PhotoPicker, usePhotoUploads } from "@/components/forum/PhotoPicker";

const NAMES: Record<keyof TopicInput, string> = { category: "Kategori", title: "Konu başlığı", body: "Açıklama", photos: "Fotoğraflar" };
const ORDER: (keyof TopicInput)[] = ["category", "title", "body", "photos"];

/**
 * "Konu aç", as the admins asked for it: first the category (one of the sections and sub-categories
 * they set up), then the title, then a large box for the text, and photos if wanted. With `topicId`
 * it edits that topic instead (its author, or an admin). Checked as on the server, with a summary of
 * what to fix.
 */
export function TopicForm({ cats, initial, topicId }: { cats: ForumCats; initial?: TopicInput; topicId?: string }) {
  const [values, setValues] = useState<Omit<TopicInput, "photos">>({ category: initial?.category ?? "", title: initial?.title ?? "", body: initial?.body ?? "" });
  const photos = usePhotoUploads(initial?.photos);
  const [errors, setErrors] = useState<TopicErrors>({});
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const summary = useRef<HTMLDivElement>(null);
  const set = (k: keyof Omit<TopicInput, "photos">, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => {
      const next = { ...e };
      delete next[k];
      return next;
    });
  };
  const failed = ORDER.filter((k) => errors[k]);

  const submit = () => {
    setMessage("");
    if (photos.uploading) {
      setMessage("Fotoğraflar hâlâ yükleniyor; birkaç saniye bekleyin.");
      return requestAnimationFrame(() => summary.current?.focus());
    }
    const input = { ...values, photos: photos.urls };
    const found = validateTopic(input, (id) => id in cats.byId);
    setErrors(found);
    if (Object.keys(found).length) return requestAnimationFrame(() => summary.current?.focus());
    start(async () => {
      const r = topicId ? await updateTopic(topicId, input) : await createTopic(input);
      if (r) {
        setErrors(r.errors);
        setMessage(r.message ?? "");
        requestAnimationFrame(() => summary.current?.focus());
      }
    });
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-6"
    >
      {(failed.length > 0 || message) && (
        <div ref={summary} tabIndex={-1} role="alert" aria-labelledby="konu-hata-baslik" className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4 outline-none">
          <p id="konu-hata-baslik" className="flex items-center gap-2 font-bold text-destructive">
            <WarningCircleIcon aria-hidden="true" weight="fill" className="size-6" />
            {failed.length ? "Yayınlamadan önce düzeltin" : message}
          </p>
          {failed.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-8">
              {failed.map((k) => (
                <li key={k}>
                  <a href={`#konu-${k}`} className="font-semibold text-destructive underline underline-offset-4">
                    {NAMES[k]}: {errors[k]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="space-y-2 border-b border-border p-4">
          <label htmlFor="konu-category" className="block font-semibold">
            Kategori
          </label>
          <div className="relative">
            <select
              id="konu-category"
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? "konu-category-hata" : "konu-category-ipucu"}
              className={selectClass}
            >
              <option value="" disabled>
                Bir kategori seçin
              </option>
              {cats.sections.map((s) =>
                s.children.length ? (
                  <optgroup key={s.id} label={s.name}>
                    <option value={s.id}>{s.name}: genel</option>
                    {s.children.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ),
              )}
            </select>
            <SelectChevron />
          </div>
          {errors.category ? (
            <FieldError id="konu-category-hata">{errors.category}</FieldError>
          ) : (
            <p id="konu-category-ipucu" className="text-sm text-muted-foreground">
              {values.category && cats.byId[values.category]?.description ? cats.byId[values.category].description : "Konunuz bu bölümde listelenir."}
            </p>
          )}
        </div>

        <div className="space-y-2 border-b border-border p-4">
          <label htmlFor="konu-title" className="block font-semibold">
            Konu başlığı
          </label>
          <Input
            id="konu-title"
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={TOPIC_TITLE_MAX}
            placeholder="Örn. Mısır kurduna karşı en etkili ilaç hangisi?"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "konu-title-hata" : "konu-title-ipucu"}
          />
          {errors.title ? (
            <FieldError id="konu-title-hata">{errors.title}</FieldError>
          ) : (
            <p id="konu-title-ipucu" className="text-sm text-muted-foreground">
              Kısa ve açık yazın; listede bu görünür.
            </p>
          )}
        </div>

        <div className="space-y-2 p-4">
          <label htmlFor="konu-body" className="block font-semibold">
            Açıklama
          </label>
          <MentionTextarea
            id="konu-body"
            value={values.body}
            onChange={(v) => set("body", v)}
            rows={12}
            maxLength={TOPIC_BODY_MAX}
            placeholder="Ne ektiniz, nerede, ne zaman? Ne denediniz? Birinden bahsetmek için @ yazın."
            aria-invalid={Boolean(errors.body)}
            aria-describedby={errors.body ? "konu-body-hata" : "konu-body-sayac"}
          />
          {errors.body ? (
            <FieldError id="konu-body-hata">{errors.body}</FieldError>
          ) : (
            <p id="konu-body-sayac" className="text-right text-sm text-muted-foreground tabular-nums">
              {values.body.length.toLocaleString("tr-TR")}/{TOPIC_BODY_MAX.toLocaleString("tr-TR")}
            </p>
          )}
        </div>
      </div>

      <div id="konu-photos" tabIndex={-1} className="space-y-2">
        <p className="font-semibold">
          Fotoğraflar <span className="font-normal text-muted-foreground">(isteğe bağlı, en fazla 4)</span>
        </p>
        <PhotoPicker uploads={photos} id="konu-foto" />
        {errors.photos && <FieldError id="konu-photos-hata">{errors.photos}</FieldError>}
      </div>

      <p className="text-sm text-muted-foreground">Kişisel bilgilerinizi (telefon, adres) paylaşmayın. Hakaret ve reklam içeren konular kaldırılır.</p>
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? (topicId ? "Kaydediliyor…" : "Yayınlanıyor…") : topicId ? "Değişiklikleri kaydet" : "Konuyu yayınla"}
      </Button>
    </form>
  );
}
