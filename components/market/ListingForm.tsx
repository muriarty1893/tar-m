"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { CameraIcon, StarIcon, TrashIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { provinces } from "@/data/provinces";
import { saveListing } from "@/app/pazar/actions";
import {
  CATEGORIES,
  CONDITIONS,
  DESCRIPTION_MAX,
  LISTING_FIELD_ORDER,
  MAX_PHOTOS,
  STOCK_PHOTOS,
  TITLE_MAX,
  UNITS,
  hasCondition,
  isListingCategory,
  soldByUnit,
  validateListing,
  type ListingErrors,
  type ListingField,
  type ListingInput,
} from "@/lib/market";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, SelectChevron, describedBy, selectClass } from "@/components/forms/fields";

type Photo = { key: string; preview: string; url?: string; state: "uploading" | "done" | "error" };

const FIELD_IDS: Record<ListingField, string> = {
  photos: "ilan-foto",
  title: "ilan-baslik",
  category: "ilan-kategori-urun",
  condition: "ilan-durum-sifir",
  price: "ilan-fiyat",
  unit: "ilan-birim",
  quantity: "ilan-miktar",
  negotiable: "ilan-pazarlik",
  province: "ilan-il",
  district: "ilan-ilce",
  description: "ilan-aciklama",
};

/** Shrinks a photo to at most 1600 px on its long side (WebP, or JPEG where WebP can't be made), so it uploads fast on mobile data. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encode = (type: string, quality: number) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  const webp = await encode("image/webp", 0.82);
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await encode("image/jpeg", 0.85);
  if (!jpeg) throw new Error("Fotoğraf işlenemedi.");
  return jpeg;
}

const randomName = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^\w-]/g, "");

/** The İlan ver form, also used to edit a listing (`listingId`). */
export function ListingForm({ initial, listingId, defaultProvince = "" }: { initial: ListingInput; listingId?: string; defaultProvince?: string }) {
  const [values, setValues] = useState<ListingInput>({ ...initial, province: initial.province || defaultProvince });
  const [photos, setPhotos] = useState<Photo[]>(() => initial.photos.map((url) => ({ key: url, preview: url, url, state: "done" })));
  const [touched, setTouched] = useState<Partial<Record<ListingField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<ListingErrors>({});
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const summaryRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const done = photos.filter((p) => p.state === "done" && p.url).map((p) => p.url!);
  const current: ListingInput = { ...values, photos: done };
  const clientErrors = validateListing(current);
  const errors: ListingErrors = { ...serverErrors, ...clientErrors };
  const shown = (f: ListingField) => (submitted || touched[f] ? errors[f] : undefined);
  const uploading = photos.some((p) => p.state === "uploading");
  const summary = submitted ? LISTING_FIELD_ORDER.filter((f) => errors[f]) : [];

  useEffect(() => () => photos.forEach((p) => p.preview.startsWith("blob:") && URL.revokeObjectURL(p.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof ListingInput>(key: K, value: ListingInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setServerErrors((e) => ({ ...e, [key]: undefined }));
  };
  const blur = (f: ListingField) => () => setTouched((t) => ({ ...t, [f]: true }));

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(0, room));
    for (const file of picked) {
      const key = randomName();
      const preview = URL.createObjectURL(file);
      setPhotos((ps) => [...ps, { key, preview, state: "uploading" }]);
      try {
        const blob = await shrink(file);
        const ext = blob.type === "image/webp" ? "webp" : "jpg";
        const result = await upload(`ilanlar/${randomName()}.${ext}`, blob, { access: "public", handleUploadUrl: "/api/pazar/foto", contentType: blob.type });
        setPhotos((ps) => ps.map((p) => (p.key === key ? { ...p, url: result.url, state: "done" } : p)));
      } catch {
        setPhotos((ps) => ps.map((p) => (p.key === key ? { ...p, state: "error" } : p)));
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  const removePhoto = (key: string) => setPhotos((ps) => ps.filter((p) => p.key !== key));
  const makeCover = (key: string) => setPhotos((ps) => [...ps.filter((p) => p.key === key), ...ps.filter((p) => p.key !== key)]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setMessage("");
    if (uploading) return setMessage("Fotoğraflar hâlâ yükleniyor; birkaç saniye bekleyin.");
    if (Object.keys(clientErrors).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    start(async () => {
      const r = await saveListing(current, listingId);
      // On success the action opens the listing; anything returned is a problem to show.
      if (r) {
        setServerErrors(r.errors);
        setMessage(r.message ?? "");
        requestAnimationFrame(() => summaryRef.current?.focus());
      }
    });
  }

  const category = values.category;
  const byUnit = soldByUnit(category);
  const labelFor: Record<ListingField, string> = {
    photos: "Fotoğraflar",
    title: "Başlık",
    category: "Kategori",
    condition: "Durum",
    price: "Fiyat",
    unit: "Birim",
    quantity: "Miktar",
    negotiable: "Pazarlık",
    province: "İl",
    district: "İlçe",
    description: "Açıklama",
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      {(summary.length > 0 || message) && (
        <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="ilan-hata-baslik" className="rounded-2xl border-l-4 border-destructive bg-destructive/10 p-4 outline-none">
          <p id="ilan-hata-baslik" className="flex items-center gap-2 font-semibold">
            <WarningCircleIcon aria-hidden="true" weight="fill" className="size-6 text-destructive" />
            {message || "İlanı yayınlamadan önce şunları düzeltin:"}
          </p>
          {summary.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-10">
              {summary.map((f) => (
                <li key={f}>
                  <a href={`#${FIELD_IDS[f]}`} className="font-semibold underline underline-offset-4">
                    {labelFor[f]}: {errors[f]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <section aria-labelledby="foto-baslik" className="space-y-3">
        <h2 id="foto-baslik" className="text-xl font-bold">
          Fotoğraflar <span className="font-normal text-muted-foreground">(en fazla {MAX_PHOTOS}, isteğe bağlı)</span>
        </h2>
        <p className="text-muted-foreground">Gün ışığında, ürünün tamamını gösteren fotoğraflar daha çok ilgi görür. İlk fotoğraf kapak olur.</p>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {photos.map((p, i) => (
            <li key={p.key} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
              <Image src={p.preview} alt={`Fotoğraf ${i + 1}`} fill sizes="160px" className="object-cover" unoptimized={p.preview.startsWith("blob:")} />
              {p.state === "uploading" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                  <span aria-hidden="true" className="mr-2 size-4 rounded-full border-2 border-white border-t-transparent motion-safe:animate-spin" />
                  Yükleniyor
                </span>
              )}
              {p.state === "error" && <span className="absolute inset-x-0 bottom-0 bg-destructive px-2 py-1 text-center text-xs font-semibold text-white">Yüklenemedi</span>}
              {i === 0 && p.state === "done" && <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">Kapak</span>}
              <div className="absolute bottom-1.5 right-1.5 flex gap-1.5">
                {i > 0 && p.state === "done" && (
                  <button type="button" onClick={() => makeCover(p.key)} aria-label={`Fotoğraf ${i + 1}: kapak yap`} className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-soft">
                    <StarIcon aria-hidden="true" weight="bold" className="size-4" />
                  </button>
                )}
                <button type="button" onClick={() => removePhoto(p.key)} aria-label={`Fotoğraf ${i + 1}: kaldır`} className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/95 text-destructive shadow-soft">
                  <TrashIcon aria-hidden="true" weight="bold" className="size-4" />
                </button>
              </div>
            </li>
          ))}
          {photos.length < MAX_PHOTOS && (
            <li>
              <label
                htmlFor={FIELD_IDS.photos}
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-input text-center font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring/30"
              >
                <CameraIcon aria-hidden="true" weight="duotone" className="size-8" />
                Fotoğraf ekle
                <input
                  ref={fileRef}
                  id={FIELD_IDS.photos}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  multiple
                  className="sr-only"
                  onChange={(e) => addFiles(e.target.files)}
                  {...describedBy(FIELD_IDS.photos, shown("photos"))}
                />
              </label>
            </li>
          )}
        </ul>
        {photos.length === 0 && isListingCategory(category) && (
          <p className="flex items-center gap-3 text-muted-foreground">
            <span className="relative size-14 shrink-0 overflow-hidden rounded-lg">
              <Image src={STOCK_PHOTOS[category]} alt="" fill sizes="56px" className="object-cover" />
            </span>
            Fotoğraf eklemezseniz kategorinin örnek görseli “Temsilî görsel” notuyla gösterilir.
          </p>
        )}
        {shown("photos") && <FieldError id={`${FIELD_IDS.photos}-hata`}>{shown("photos")}</FieldError>}
      </section>

      <section aria-labelledby="bilgi-baslik" className="space-y-6">
        <h2 id="bilgi-baslik" className="text-xl font-bold">
          İlan bilgileri
        </h2>
        <Field id={FIELD_IDS.title} label="Başlık" error={shown("title")}>
          <Input
            id={FIELD_IDS.title}
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            onBlur={blur("title")}
            maxLength={TITLE_MAX + 10}
            placeholder="Ör. 2015 model 75 beygir traktör"
            {...describedBy(FIELD_IDS.title, shown("title"))}
          />
        </Field>

        <fieldset aria-describedby={shown("category") ? "ilan-kategori-hata" : undefined}>
          <legend className="text-base font-semibold">Kategori</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.id !== "tumu").map((c) => (
              <label key={c.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  id={`ilan-kategori-${c.id}`}
                  value={c.id}
                  checked={category === c.id}
                  onChange={() => set("category", c.id)}
                  onBlur={blur("category")}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-12 items-center rounded-full border-2 border-input px-4 font-semibold transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-4 peer-focus-visible:ring-ring/30">
                  {c.label}
                </span>
              </label>
            ))}
          </div>
          {shown("category") && <FieldError id="ilan-kategori-hata">{shown("category")}</FieldError>}
        </fieldset>

        {hasCondition(category) && (
          <fieldset aria-describedby={shown("condition") ? "ilan-durum-hata" : undefined}>
            <legend className="text-base font-semibold">Durum</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <label key={c.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="condition"
                    id={`ilan-durum-${c.id}`}
                    value={c.id}
                    checked={values.condition === c.id}
                    onChange={() => set("condition", c.id)}
                    onBlur={blur("condition")}
                    className="peer sr-only"
                  />
                  <span className="inline-flex min-h-12 items-center rounded-full border-2 border-input px-4 font-semibold transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-4 peer-focus-visible:ring-ring/30">
                    {c.label}
                  </span>
                </label>
              ))}
            </div>
            {shown("condition") && <FieldError id="ilan-durum-hata">{shown("condition")}</FieldError>}
          </fieldset>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={FIELD_IDS.price} label={byUnit ? "Birim fiyatı (₺)" : "Fiyat (₺)"} error={shown("price")}>
            <Input
              id={FIELD_IDS.price}
              inputMode="decimal"
              autoComplete="off"
              value={values.price}
              onChange={(e) => set("price", e.target.value)}
              onBlur={blur("price")}
              placeholder={byUnit ? "Ör. 11.200" : "Ör. 145.000"}
              {...describedBy(FIELD_IDS.price, shown("price"))}
            />
          </Field>
          {byUnit && (
            <Field id={FIELD_IDS.unit} label="Birim" error={shown("unit")}>
              <div className="relative">
                <select
                  id={FIELD_IDS.unit}
                  value={values.unit}
                  onChange={(e) => set("unit", e.target.value)}
                  onBlur={blur("unit")}
                  className={selectClass}
                  {...describedBy(FIELD_IDS.unit, shown("unit"))}
                >
                  <option value="">Seçin</option>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </Field>
          )}
          {byUnit && (
            <Field id={FIELD_IDS.quantity} label="Satılık miktar" optional error={shown("quantity")}>
              <Input
                id={FIELD_IDS.quantity}
                value={values.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                onBlur={blur("quantity")}
                placeholder={values.unit ? `Ör. 25 (${values.unit})` : "Ör. 25"}
                {...describedBy(FIELD_IDS.quantity, shown("quantity"))}
              />
            </Field>
          )}
        </div>
        <label htmlFor={FIELD_IDS.negotiable} className="flex min-h-12 cursor-pointer items-center gap-3 text-lg">
          <input
            id={FIELD_IDS.negotiable}
            type="checkbox"
            checked={values.negotiable}
            onChange={(e) => set("negotiable", e.target.checked)}
            className="size-6 accent-[var(--primary)]"
          />
          Pazarlık payı var
        </label>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={FIELD_IDS.province} label="İl" error={shown("province")}>
            <div className="relative">
              <select
                id={FIELD_IDS.province}
                value={values.province}
                onChange={(e) => set("province", e.target.value)}
                onBlur={blur("province")}
                className={selectClass}
                {...describedBy(FIELD_IDS.province, shown("province"))}
              >
                <option value="">Seçin</option>
                {provinces.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </Field>
          <Field id={FIELD_IDS.district} label="İlçe" optional error={shown("district")}>
            <Input
              id={FIELD_IDS.district}
              value={values.district}
              onChange={(e) => set("district", e.target.value)}
              onBlur={blur("district")}
              placeholder="Ör. Çumra"
              {...describedBy(FIELD_IDS.district, shown("district"))}
            />
          </Field>
        </div>

        <Field id={FIELD_IDS.description} label="Açıklama" optional error={shown("description")}>
          <Textarea
            id={FIELD_IDS.description}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            onBlur={blur("description")}
            rows={6}
            placeholder="Durumu, kullanım süresi, teslim şekli, görülebileceği saatler…"
            aria-describedby={`ilan-aciklama-sayac${shown("description") ? ` ${FIELD_IDS.description}-hata` : ""}`}
            aria-invalid={shown("description") ? true : undefined}
          />
          <p id="ilan-aciklama-sayac" className="text-right text-sm text-muted-foreground">
            {values.description.length} / {DESCRIPTION_MAX}
          </p>
        </Field>
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <p className="mb-3 text-muted-foreground">
          İlan vererek{" "}
          <Link href="/pazar/kurallar" className="font-semibold text-primary underline underline-offset-4">
            Pazar kurallarını
          </Link>{" "}
          kabul etmiş olursunuz.
        </p>
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending && <span aria-hidden="true" className="size-5 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />}
          {pending ? "Kaydediliyor…" : listingId ? "Değişiklikleri kaydet" : "İlanı yayınla"}
        </Button>
      </div>
    </form>
  );
}
