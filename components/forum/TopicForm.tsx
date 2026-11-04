"use client";

import { useRef, useState, useTransition } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { createTopic } from "@/app/forum/actions";
import { FORUM_CATEGORIES, TOPIC_BODY_MAX, TOPIC_TITLE_MAX, validateTopic, type TopicErrors, type TopicInput } from "@/lib/forum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/forms/fields";
import { MentionTextarea } from "@/components/forum/MentionTextarea";
import { PhotoPicker, usePhotoUploads } from "@/components/forum/PhotoPicker";

const NAMES: Record<keyof TopicInput, string> = { category: "Konu türü", title: "Başlık", body: "Metin", photos: "Fotoğraflar" };
const ORDER: (keyof TopicInput)[] = ["category", "title", "body", "photos"];

/** "Konu aç": the kind of topic, a title, the text (with @mentions) and up to 4 photos; checked as on the server, with a summary of what to fix. */
export function TopicForm() {
  const [values, setValues] = useState<Omit<TopicInput, "photos">>({ category: "", title: "", body: "" });
  const photos = usePhotoUploads();
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
    const found = validateTopic(input);
    setErrors(found);
    if (Object.keys(found).length) return requestAnimationFrame(() => summary.current?.focus());
    start(async () => {
      const r = await createTopic(input);
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
      className="space-y-8"
    >
      {(failed.length > 0 || message) && (
        <div ref={summary} tabIndex={-1} role="alert" aria-labelledby="konu-hata-baslik" className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-4 outline-none">
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

      <fieldset id="konu-category" tabIndex={-1} aria-describedby={errors.category ? "konu-category-hata" : undefined}>
        <legend className="text-lg font-semibold">Konu türü</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {FORUM_CATEGORIES.map((c) => (
            <label key={c.id} className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-border px-4 font-semibold transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring/30">
              <input type="radio" name="category" value={c.id} checked={values.category === c.id} onChange={() => set("category", c.id)} className="sr-only" />
              {c.label}
            </label>
          ))}
        </div>
        {errors.category && (
          <div className="mt-2">
            <FieldError id="konu-category-hata">{errors.category}</FieldError>
          </div>
        )}
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="konu-title" className="block text-lg font-semibold">
          Başlık
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
        {errors.title ? <FieldError id="konu-title-hata">{errors.title}</FieldError> : <p id="konu-title-ipucu" className="text-muted-foreground">Kısa ve açık yazın; listede bu görünür.</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="konu-body" className="block text-lg font-semibold">
          Metin
        </label>
        <MentionTextarea
          id="konu-body"
          value={values.body}
          onChange={(v) => set("body", v)}
          rows={8}
          maxLength={TOPIC_BODY_MAX}
          placeholder="Ne ektiniz, nerede, ne zaman? Ne denediniz? Birinden bahsetmek için @ yazın."
          aria-invalid={Boolean(errors.body)}
          aria-describedby={errors.body ? "konu-body-hata" : "konu-body-sayac"}
        />
        {errors.body ? (
          <FieldError id="konu-body-hata">{errors.body}</FieldError>
        ) : (
          <p id="konu-body-sayac" className="text-muted-foreground">
            {values.body.length.toLocaleString("tr-TR")}/{TOPIC_BODY_MAX.toLocaleString("tr-TR")}
          </p>
        )}
      </div>

      <div id="konu-photos" tabIndex={-1} className="space-y-2">
        <p className="text-lg font-semibold">
          Fotoğraflar <span className="font-normal text-muted-foreground">(isteğe bağlı, en fazla 4)</span>
        </p>
        <p className="text-muted-foreground">Hastalıklı yaprak, makinedeki arıza… Fotoğraf, sorunuzu anlatmanın en kolay yolu.</p>
        <PhotoPicker uploads={photos} id="konu-foto" />
        {errors.photos && <FieldError id="konu-photos-hata">{errors.photos}</FieldError>}
      </div>

      <p className="text-muted-foreground">Kişisel bilgilerinizi (telefon, adres) paylaşmayın. Hakaret ve reklam içeren konular kaldırılır.</p>
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Yayınlanıyor…" : "Konuyu yayınla"}
      </Button>
    </form>
  );
}
