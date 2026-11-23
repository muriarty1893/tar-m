"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type DragEvent, type ReactNode } from "react";
import { upload } from "@vercel/blob/client";
import { randomName, shrinkImage } from "@/lib/shrink-image";
import {
  CameraIcon,
  CaretRightIcon,
  ChatsCircleIcon,
  CheckIcon,
  GearSixIcon,
  GrainsIcon,
  MagnifyingGlassIcon,
  PlantIcon,
  StarIcon,
  TractorIcon,
  TrashIcon,
  WarningCircleIcon,
  WrenchIcon,
} from "@phosphor-icons/react/dist/ssr";
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
  categoryLabel,
  conditionLabel,
  fold,
  formatTL,
  hasCondition,
  isListingCategory,
  parsePrice,
  soldByUnit,
  validateListing,
  type Condition,
  type ListingCategory,
  type ListingErrors,
  type ListingField,
  type ListingInput,
} from "@/lib/market";
import { Button } from "@/components/ui/button";
import { FieldError, SelectChevron, describedBy, selectClass } from "@/components/forms/fields";

type Photo = { key: string; preview: string; url?: string; state: "uploading" | "done" | "error" };
type Step = 1 | 2 | 3;

const FIELD_IDS: Record<ListingField, string> = {
  photos: "ilan-foto",
  title: "ilan-baslik",
  category: "ilan-kategori",
  condition: "ilan-durum",
  price: "ilan-fiyat",
  unit: "ilan-birim",
  quantity: "ilan-miktar",
  negotiable: "ilan-pazarlik",
  province: "ilan-il",
  district: "ilan-ilce",
  description: "ilan-aciklama",
};

/** sahibinden's steps (without the paid "Doping" one). */
const STEPS = ["Kategori Seçimi", "İlan Detayları", "Önizleme", "Tebrikler"];

/** Each category's card in step 1: its picture, colour and the words that find it. */
const CATEGORY_CARDS: Record<ListingCategory, { Icon: typeof PlantIcon; color: string; words: string }> = {
  urun: { Icon: GrainsIcon, color: "#d97706", words: "ürün buğday arpa mısır yulaf çavdar nohut mercimek fasulye domates biber patates soğan sebze meyve elma üzüm zeytin fındık ceviz saman balya yem bal süt yumurta" },
  tohum: { Icon: PlantIcon, color: "#16a34a", words: "tohum fide fidan gübre kompost ilaç sertifikalı" },
  alet: { Icon: WrenchIcon, color: "#0d9488", words: "alet el aleti çapa kürek tırpan makas budama testere motorlu tırpan pompa hortum el arabası" },
  ekipman: { Icon: GearSixIcon, color: "#4f46e5", words: "ekipman pulluk mibzer pulverizatör diskaro kültivatör tırmık römork damla sulama yağmurlama balya makinesi silaj sağım makinesi depo" },
  arac: { Icon: TractorIcon, color: "#dc2626", words: "araç traktör biçerdöver kamyon kamyonet pikap patpat motosiklet" },
};

const LISTING_CATEGORIES = CATEGORIES.filter((c) => c.id !== "tumu") as { id: ListingCategory; label: string }[];

const input =
  "min-h-11 w-full rounded-sm border border-input bg-card px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive";
const select = `${selectClass} rounded-sm`;

/**
 * İlan ver, step by step as on sahibinden.com: 1 Kategori Seçimi (cards, or find it by a word),
 * 2 İlan Detayları (sections in white boxes, "İlan verme kurallarını okudum" and Devam Et),
 * 3 Önizleme (the listing as buyers will see it, then Yayınla), 4 Tebrikler (the published listing).
 * Editing (`listingId`) starts at step 2.
 */
export function ListingForm({ initial, listingId, defaultProvince = "" }: { initial: ListingInput; listingId?: string; defaultProvince?: string }) {
  const [values, setValues] = useState<ListingInput>({ ...initial, province: initial.province || defaultProvince });
  const [photos, setPhotos] = useState<Photo[]>(() => initial.photos.map((url) => ({ key: url, preview: url, url, state: "done" })));
  const [step, setStep] = useState<Step>(listingId && isListingCategory(initial.category) ? 2 : 1);
  const [touched, setTouched] = useState<Partial<Record<ListingField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [accepted, setAccepted] = useState(Boolean(listingId));
  const [acceptError, setAcceptError] = useState(false);
  const [serverErrors, setServerErrors] = useState<ListingErrors>({});
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [pending, start] = useTransition();
  const summaryRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

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
  const goTo = (s: Step) => {
    setStep(s);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: "start" }));
  };

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
        const blob = await shrinkImage(file);
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
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  function chooseCategory(id: ListingCategory) {
    setValues((v) => ({ ...v, category: id, condition: hasCondition(id) ? v.condition : "", unit: soldByUnit(id) ? v.unit : "" }));
    goTo(2);
  }

  /** Step 2's "Devam Et": everything checked, then the preview. */
  function toPreview() {
    setSubmitted(true);
    setMessage("");
    if (uploading) return setMessage("Fotoğraflar hâlâ yükleniyor; birkaç saniye bekleyin.");
    if (Object.keys(clientErrors).length) return requestAnimationFrame(() => summaryRef.current?.focus());
    if (!accepted) return setAcceptError(true);
    goTo(3);
  }

  function publish() {
    start(async () => {
      const r = await saveListing(current, listingId);
      // On success the action opens the listing; anything returned is a problem to show on step 2.
      if (r) {
        setServerErrors(r.errors);
        setMessage(r.message ?? "");
        goTo(2);
        requestAnimationFrame(() => summaryRef.current?.focus());
      }
    });
  }

  const category = isListingCategory(values.category) ? values.category : null;
  const byUnit = soldByUnit(values.category);
  const labelFor: Record<ListingField, string> = {
    photos: "Fotoğraf",
    title: "İlan Başlığı",
    category: "Kategori",
    condition: "Durumu",
    price: "Fiyat",
    unit: "Birim",
    quantity: "Miktar",
    negotiable: "Pazarlık",
    province: "İl",
    district: "İlçe",
    description: "Açıklama",
  };

  return (
    <div ref={topRef} className="scroll-mt-[57px]">
      <Stepper step={step} />

      <div className="mx-auto max-w-5xl px-3 pb-8 pt-5 sm:px-4">
        {step === 1 && <CategoryStep chosen={category} onChoose={chooseCategory} />}

        {step === 2 && (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              toPreview();
            }}
            className="space-y-7"
          >
            {(summary.length > 0 || message) && (
              <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="ilan-hata-baslik" className="rounded-sm border-l-4 border-destructive bg-destructive/10 p-4 outline-none">
                <p id="ilan-hata-baslik" className="flex items-center gap-2 font-semibold">
                  <WarningCircleIcon aria-hidden="true" weight="fill" className="size-6 text-destructive" />
                  {message || "Devam etmeden önce şunları düzeltin:"}
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

            <Section
              title="Seçtiğiniz Kategori"
              action={
                <button type="button" onClick={() => goTo(1)} className="cursor-pointer text-[13.5px] text-primary hover:underline">
                  Değiştir
                </button>
              }
            >
              {category && (
                <div className="flex items-center gap-3 rounded-sm bg-muted/70 px-4 py-4 text-[14px]">
                  <CategoryIcon id={category} size="sm" />
                  <span className="flex flex-wrap items-center gap-1.5">
                    Pazar <CaretRightIcon aria-hidden="true" weight="bold" className="size-3 text-muted-foreground" />
                    <b>{categoryLabel(category)}</b>
                  </span>
                </div>
              )}
            </Section>

            <Section
              title="İlan Detayları"
              action={
                <Link href="/pazar/kurallar" target="_blank" className="text-[13.5px] text-primary hover:underline">
                  İlan Vermenin Püf Noktaları
                </Link>
              }
            >
              <div className="space-y-6">
                <Row id={FIELD_IDS.title} label="İlan Başlığı" required error={shown("title")}>
                  <input
                    id={FIELD_IDS.title}
                    value={values.title}
                    onChange={(e) => set("title", e.target.value)}
                    onBlur={blur("title")}
                    maxLength={TITLE_MAX + 10}
                    placeholder="Ör. 2015 model 75 beygir traktör"
                    className={input}
                    {...describedBy(FIELD_IDS.title, shown("title"))}
                  />
                </Row>

                <Row id={FIELD_IDS.description} label="Açıklama" error={shown("description")}>
                  <textarea
                    id={FIELD_IDS.description}
                    value={values.description}
                    onChange={(e) => set("description", e.target.value)}
                    onBlur={blur("description")}
                    rows={8}
                    placeholder="Alıcı ve satıcı güvenliği için açıklamaya telefon numarası yazmayın. Durumu, kullanım süresi, teslim şekli, görülebileceği saatler…"
                    className={`${input} min-h-48 py-2.5`}
                    aria-describedby={`ilan-aciklama-sayac${shown("description") ? ` ${FIELD_IDS.description}-hata` : ""}`}
                    aria-invalid={shown("description") ? true : undefined}
                  />
                  <p id="ilan-aciklama-sayac" className="text-right text-[12.5px] text-muted-foreground">
                    {values.description.length} / {DESCRIPTION_MAX}
                  </p>
                </Row>

                <Row id={FIELD_IDS.price} label={byUnit ? "Birim Fiyatı" : "Fiyat"} required error={shown("price") ?? shown("unit")}>
                  <div className="flex max-w-md gap-2">
                    <input
                      id={FIELD_IDS.price}
                      inputMode="decimal"
                      autoComplete="off"
                      value={values.price}
                      onChange={(e) => set("price", e.target.value)}
                      onBlur={blur("price")}
                      placeholder={byUnit ? "Ör. 11.200" : "Ör. 145.000"}
                      className={`${input} flex-1`}
                      {...describedBy(FIELD_IDS.price, shown("price"))}
                    />
                    <span className="inline-flex min-h-11 items-center rounded-sm border border-input bg-muted/60 px-3 text-[14px]">TL</span>
                    {byUnit && (
                      <div className="relative w-32">
                        <label htmlFor={FIELD_IDS.unit} className="sr-only">
                          Birim
                        </label>
                        <select
                          id={FIELD_IDS.unit}
                          value={values.unit}
                          onChange={(e) => set("unit", e.target.value)}
                          onBlur={blur("unit")}
                          className={select}
                          {...describedBy(FIELD_IDS.unit, shown("unit"))}
                        >
                          <option value="">/ birim</option>
                          {UNITS.map((u) => (
                            <option key={u} value={u}>
                              / {u}
                            </option>
                          ))}
                        </select>
                        <SelectChevron />
                      </div>
                    )}
                  </div>
                </Row>

                {byUnit && (
                  <Row id={FIELD_IDS.quantity} label="Satılık Miktar" error={shown("quantity")}>
                    <input
                      id={FIELD_IDS.quantity}
                      value={values.quantity}
                      onChange={(e) => set("quantity", e.target.value)}
                      onBlur={blur("quantity")}
                      placeholder={values.unit ? `Ör. 25 (${values.unit})` : "Ör. 25"}
                      className={`${input} max-w-xs`}
                      {...describedBy(FIELD_IDS.quantity, shown("quantity"))}
                    />
                  </Row>
                )}

                <hr className="border-border" />

                {hasCondition(values.category) && (
                  <Row id={FIELD_IDS.condition} label="Durumu" required error={shown("condition")}>
                    <div className="relative max-w-xs">
                      <select
                        id={FIELD_IDS.condition}
                        value={values.condition}
                        onChange={(e) => set("condition", e.target.value)}
                        onBlur={blur("condition")}
                        className={select}
                        {...describedBy(FIELD_IDS.condition, shown("condition"))}
                      >
                        <option value="">Seçiniz</option>
                        {CONDITIONS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <SelectChevron />
                    </div>
                  </Row>
                )}

                <Row id={FIELD_IDS.negotiable} label="Pazarlık Payı">
                  <div className="relative max-w-xs">
                    <select id={FIELD_IDS.negotiable} value={values.negotiable ? "var" : "yok"} onChange={(e) => set("negotiable", e.target.value === "var")} className={select}>
                      <option value="yok">Yok</option>
                      <option value="var">Var</option>
                    </select>
                    <SelectChevron />
                  </div>
                </Row>
              </div>
            </Section>

            <Section title="Adres Bilgileri" action={<span className="text-[13.5px]">Türkiye</span>}>
              <div className="grid gap-4 sm:grid-cols-3">
                <Row id={FIELD_IDS.province} label="İl" required error={shown("province")}>
                  <div className="relative">
                    <select
                      id={FIELD_IDS.province}
                      value={values.province}
                      onChange={(e) => set("province", e.target.value)}
                      onBlur={blur("province")}
                      className={select}
                      {...describedBy(FIELD_IDS.province, shown("province"))}
                    >
                      <option value="">Seçiniz</option>
                      {provinces.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </Row>
                <Row id={FIELD_IDS.district} label="İlçe" error={shown("district")}>
                  <input
                    id={FIELD_IDS.district}
                    value={values.district}
                    onChange={(e) => set("district", e.target.value)}
                    onBlur={blur("district")}
                    placeholder="Ör. Çumra"
                    className={input}
                    {...describedBy(FIELD_IDS.district, shown("district"))}
                  />
                </Row>
              </div>
            </Section>

            <Section title="Fotoğraf">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {photos.length < MAX_PHOTOS && (
                  <label
                    htmlFor={FIELD_IDS.photos}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`flex min-h-24 cursor-pointer items-center gap-3 rounded-sm border-2 border-dashed px-6 py-4 transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring/30 sm:w-80 ${dragging ? "border-primary bg-secondary" : "border-input hover:border-primary hover:bg-secondary"}`}
                  >
                    <CameraIcon aria-hidden="true" weight="fill" className="size-10 shrink-0 text-primary" />
                    <span className="leading-tight">
                      <span className="block font-bold text-primary">Fotoğraf Ekle</span>
                      <span className="text-[13px] text-muted-foreground">veya sürükle bırak</span>
                    </span>
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
                )}
                <div className="min-w-0 flex-1 text-[13.5px]">
                  <p>
                    Eklediğiniz Fotoğraf Adedi{" "}
                    <b className="text-[17px] text-primary tabular-nums">
                      {done.length}/{MAX_PHOTOS}
                    </b>
                  </p>
                  <div className="mt-2 h-1.5 max-w-sm overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <div className="h-full bg-primary transition-[width]" style={{ width: `${(done.length / MAX_PHOTOS) * 100}%` }} />
                  </div>
                  <p className="mt-2 text-muted-foreground">İlk fotoğraf kapak olur. Gün ışığında, ürünün tamamını gösteren fotoğraflar daha çok ilgi görür.</p>
                </div>
              </div>
              {photos.length > 0 && (
                <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {photos.map((p, i) => (
                    <li key={p.key} className="relative aspect-[4/3] overflow-hidden rounded-sm border border-border bg-muted">
                      <Image src={p.preview} alt={`Fotoğraf ${i + 1}`} fill sizes="180px" className="object-cover" unoptimized={p.preview.startsWith("blob:")} />
                      {p.state === "uploading" && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                          <span aria-hidden="true" className="mr-2 size-4 rounded-full border-2 border-white border-t-transparent motion-safe:animate-spin" />
                          Yükleniyor
                        </span>
                      )}
                      {p.state === "error" && <span className="absolute inset-x-0 bottom-0 bg-destructive px-2 py-1 text-center text-xs font-semibold text-white">Yüklenemedi</span>}
                      {i === 0 && p.state === "done" && <span className="absolute left-1.5 top-1.5 rounded-sm bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">Kapak</span>}
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
                </ul>
              )}
              {photos.length === 0 && category && (
                <p className="mt-4 flex items-center gap-3 text-[13.5px] text-muted-foreground">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-sm">
                    <Image src={STOCK_PHOTOS[category]} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  Fotoğraf eklemezseniz kategorinin örnek görseli “Temsilî görsel” notuyla gösterilir.
                </p>
              )}
              {shown("photos") && (
                <div className="mt-2">
                  <FieldError id={`${FIELD_IDS.photos}-hata`}>{shown("photos")}</FieldError>
                </div>
              )}
            </Section>

            <Section title="İletişim Bilgileri">
              <p className="text-[15px] font-bold">Size nasıl ulaşılsın?</p>
              <p className="mt-3 flex items-center gap-2 text-[14px]">
                <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckIcon weight="bold" className="size-3" />
                </span>
                <ChatsCircleIcon aria-hidden="true" weight="duotone" className="size-5 text-primary" />
                Site içi mesaj ile
              </p>
              <p className="mt-2 text-[13.5px] text-muted-foreground">
                Telefon numaranız ilanda görünmez. Alıcılar size Mesajlar’dan yazar ve teklif verir; yeni mesajlar bildirim olarak gelir.
              </p>
            </Section>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div>
                <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-sm border border-border bg-card px-4 text-[14px]">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => {
                      setAccepted(e.target.checked);
                      setAcceptError(false);
                    }}
                    aria-describedby={acceptError ? "ilan-kurallar-hata" : undefined}
                    aria-invalid={acceptError || undefined}
                    className="size-5 accent-[var(--primary)]"
                  />
                  <span>
                    <Link href="/pazar/kurallar" target="_blank" className="text-primary hover:underline">
                      İlan verme kurallarını
                    </Link>{" "}
                    <b>okudum, kabul ediyorum</b>
                  </span>
                </label>
                {acceptError && (
                  <div className="mt-1.5">
                    <FieldError id="ilan-kurallar-hata">Devam etmek için kuralları kabul edin.</FieldError>
                  </div>
                )}
              </div>
              <Button type="submit" size="lg" className="rounded-sm px-10">
                Devam Et
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <Preview
            values={current}
            cover={done[0] ?? (category ? STOCK_PHOTOS[category] : "")}
            stockPhoto={done.length === 0}
            pending={pending}
            editing={Boolean(listingId)}
            onBack={() => goTo(2)}
            onPublish={publish}
          />
        )}
      </div>
    </div>
  );
}

/** The numbered steps across the top, pinned under the site header while you scroll. */
function Stepper({ step }: { step: Step }) {
  return (
    <nav aria-label="İlan verme adımları" className="sticky top-[57px] z-20 border-b border-border bg-card shadow-soft">
      <ol className="mx-auto flex max-w-5xl px-2 pb-2 pt-3 sm:px-4">
        {STEPS.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3 | 4;
          const state = n < step ? "done" : n === step ? "now" : "next";
          return (
            <li key={label} aria-current={state === "now" ? "step" : undefined} className="relative flex flex-1 flex-col items-center gap-1 text-center">
              {i > 0 && <span aria-hidden="true" className={`absolute right-1/2 top-[15px] h-1 w-full -translate-y-1/2 ${n <= step ? "bg-primary" : "bg-muted"}`} />}
              <span
                className={`relative z-10 flex size-[30px] items-center justify-center rounded-full text-[14px] font-bold sm:size-9 ${
                  state === "done" ? "bg-primary text-primary-foreground" : state === "now" ? "border-[3px] border-primary bg-card text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {n}
              </span>
              <span className={`text-[11.5px] sm:text-[13px] ${state === "now" ? "font-bold" : "text-muted-foreground"}`}>{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CategoryIcon({ id, size = "lg" }: { id: ListingCategory; size?: "sm" | "lg" }) {
  const { Icon, color } = CATEGORY_CARDS[id];
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full text-white ${size === "lg" ? "size-10" : "size-8"}`} style={{ backgroundColor: color }}>
      <Icon weight="fill" className={size === "lg" ? "size-6" : "size-5"} />
    </span>
  );
}

/** Step 1: "Adım Adım Kategori Seç" cards, or "Kelime ile Arayarak Kategori Seç". */
function CategoryStep({ chosen, onChoose }: { chosen: ListingCategory | null; onChoose: (id: ListingCategory) => void }) {
  const [words, setWords] = useState("");
  const q = fold(words.trim());
  const found = q.length >= 2 ? LISTING_CATEGORIES.filter((c) => fold(`${c.label} ${CATEGORY_CARDS[c.id].words}`).includes(q)) : [];
  return (
    <div className="rounded-sm border border-border bg-card px-4 py-5 sm:px-6">
      <h2 className="text-[18px] font-semibold">Adım Adım Kategori Seç</h2>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {LISTING_CATEGORIES.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onChoose(c.id)}
              aria-pressed={chosen === c.id}
              className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-sm border-t-4 bg-card px-2 text-[14.5px] font-bold shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_2px_10px_rgba(0,0,0,0.22)] aria-pressed:ring-2 aria-pressed:ring-primary"
              style={{ borderTopColor: CATEGORY_CARDS[c.id].color }}
            >
              <CategoryIcon id={c.id} />
              {c.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="my-7 flex items-center gap-4 text-[13px] font-bold">
        <span className="h-px flex-1 bg-border" />
        veya
        <span className="h-px flex-1 bg-border" />
      </div>

      <h2 className="flex items-center gap-2 text-[17px] font-semibold">
        <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="size-5 text-primary" />
        <label htmlFor="kategori-ara">Kelime ile Arayarak Kategori Seç</label>
      </h2>
      <input
        id="kategori-ara"
        value={words}
        onChange={(e) => setWords(e.target.value)}
        placeholder="Lütfen ilanınızı tanımlayan kelimelerle arama yapınız."
        autoComplete="off"
        className={`${input} mt-3 max-w-md`}
      />
      {q.length >= 2 ? (
        found.length > 0 ? (
          <ul className="mt-2 max-w-md divide-y divide-border rounded-sm border border-border" aria-label="Bulunan kategoriler">
            {found.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => onChoose(c.id)} className="flex min-h-11 w-full cursor-pointer items-center gap-2 px-3 text-left text-[14px] hover:bg-secondary">
                  <CategoryIcon id={c.id} size="sm" />
                  Pazar <CaretRightIcon aria-hidden="true" weight="bold" className="size-3 text-muted-foreground" />
                  <b>{c.label}</b>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[13.5px] text-muted-foreground">Bu kelimeyle bir kategori bulunamadı; yukarıdaki kartlardan seçin.</p>
        )
      ) : (
        <p className="mt-2 text-[13.5px] text-muted-foreground">Ör: traktör</p>
      )}
    </div>
  );
}

/** A section of step 2: a heading (with an optional link on the right) over a white box. */
function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-2.5 flex items-baseline justify-between gap-3 px-0.5">
        <h2 className="text-[17px] font-semibold">{title}</h2>
        {action}
      </div>
      <div className="rounded-sm border border-border bg-card px-4 py-5 sm:px-7">{children}</div>
    </section>
  );
}

/** A labelled field; `required` adds sahibinden's red star. */
function Row({ id, label, required = false, error, children }: { id: string; label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[13.5px] font-bold">
        {label}
        {required && (
          <span aria-hidden="true" className="text-create">
            {" "}
            *
          </span>
        )}
        {required && <span className="sr-only"> (zorunlu)</span>}
      </label>
      {children}
      {error && <FieldError id={`${id}-hata`}>{error}</FieldError>}
    </div>
  );
}

/** Step 3: the listing as buyers will see it, then Yayınla (or Geri Dön to change something). */
function Preview({
  values,
  cover,
  stockPhoto,
  pending,
  editing,
  onBack,
  onPublish,
}: {
  values: ListingInput;
  cover: string;
  stockPhoto: boolean;
  pending: boolean;
  editing: boolean;
  onBack: () => void;
  onPublish: () => void;
}) {
  const category = isListingCategory(values.category) ? values.category : null;
  const condition = conditionLabel((values.condition || undefined) as Condition | undefined);
  const price = parsePrice(values.price);
  const facts: [string, string][] = [
    ["Kategori", category ? categoryLabel(category) : ""],
    ...(condition ? [["Durumu", condition] as [string, string]] : []),
    ...(values.quantity ? [["Miktar", values.unit ? `${values.quantity} ${values.unit}` : values.quantity] as [string, string]] : []),
    ["Pazarlık", values.negotiable ? "Var" : "Yok"],
    ["Fotoğraf", stockPhoto ? "Yok (temsilî görsel)" : `${values.photos.length} adet`],
  ];
  return (
    <div className="space-y-5">
      <p className="rounded-sm border border-primary/30 bg-secondary px-4 py-3 text-[14px]">
        İlanınız alıcılara böyle görünecek. Her şey doğruysa <b>{editing ? "Değişiklikleri Kaydet" : "İlanı Yayınla"}</b> düğmesine basın; bir şeyi değiştirmek için <b>Geri Dön</b>.
      </p>
      <article className="rounded-sm border border-border bg-card">
        <h2 className="border-b border-border px-4 py-3 text-[19px] font-bold">{values.title.trim()}</h2>
        <div className="grid gap-5 p-4 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="relative aspect-[4/3] overflow-hidden border border-border bg-muted">
            {cover && <Image src={cover} alt="" fill sizes="352px" className={stockPhoto ? "object-cover" : "object-contain"} unoptimized={cover.startsWith("blob:")} />}
            {stockPhoto && <span className="absolute bottom-2 left-2 rounded-sm bg-black/65 px-2 py-0.5 text-[12px] text-white">Temsilî görsel</span>}
          </div>
          <div>
            <p className="text-[19px] font-bold text-primary">
              {price > 0 ? formatTL(price) : "—"}
              {values.unit && <span className="text-[14px] font-semibold"> / {values.unit}</span>}
            </p>
            <p className="mt-2 text-[13.5px] font-semibold text-primary">
              {values.province}
              {values.district.trim() && ` / ${values.district.trim()}`}
            </p>
            <dl className="mt-2.5 border-t border-dotted border-input text-[13px]">
              {facts.map(([label, value]) => (
                <div key={label} className="flex gap-3 border-b border-dotted border-input py-[5px]">
                  <dt className="w-28 shrink-0 font-bold">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="border-t border-border px-4 py-3">
          <h3 className="text-[14px] font-bold">Açıklama</h3>
          <p className="mt-1.5 whitespace-pre-line text-[15px]">{values.description.trim() || <span className="text-muted-foreground">Açıklama eklemediniz.</span>}</p>
        </div>
      </article>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={pending} className="rounded-sm">
          Geri Dön
        </Button>
        <Button type="button" variant="create" size="lg" onClick={onPublish} disabled={pending} className="rounded-sm px-10">
          {pending && <span aria-hidden="true" className="size-5 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />}
          {pending ? "Kaydediliyor…" : editing ? "Değişiklikleri Kaydet" : "İlanı Yayınla"}
        </Button>
      </div>
    </div>
  );
}
