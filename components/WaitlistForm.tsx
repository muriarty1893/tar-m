"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircleIcon, GrainsIcon, SealCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { provinces } from "@/data/provinces";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CircularText } from "@/components/ui/circular-text";
import { useFormSubmit } from "./forms/useFormSubmit";
import { Field, FieldError, FormError, Honeypot, SubmitButton, describedBy } from "./forms/fields";

const initial = { name: "", email: "", city: "", crop: "", consent: false, website: "" };

const perks = ["Uygulamayı herkesten önce deneyin", "Geri bildiriminizle şekillendirin", "Tamamen ücretsiz, istediğiniz an çıkın"];

export function WaitlistForm() {
  const [values, setValues] = useState(initial);
  const { status, errors, submit } = useFormSubmit<typeof initial>("waitlist");
  const set = <K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) => setValues((s) => ({ ...s, [k]: v }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(values);
  };

  return (
    <div id="kayit" className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-border bg-card shadow-lift">
      <div className="grid md:grid-cols-[0.9fr_1.4fr]">
        <div className="relative flex flex-col overflow-hidden bg-primary p-7 text-primary-foreground sm:p-9">
          <h2 className="relative text-3xl font-bold tracking-tight">Erken erişim listesine katılın</h2>
          <p className="relative mt-3 text-lg">Uygulama hazır olduğunda ilk siz haberdar olun. Kayıt ücretsizdir.</p>
          <ul className="relative mt-7 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5">
                <CheckCircleIcon aria-hidden="true" weight="fill" className="mt-0.5 size-6 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
          {/* React Bits CircularText as a stamp (its words repeat "Kayıt ücretsizdir" above). Tablet and up:
              on phones the panel stacks above the form and the stamp would push the form off screen. */}
          <CircularText text="ÜCRETSİZ • ERKEN ERİŞİM • " spinDuration={18} size={132} fontSize={14} className="mt-auto hidden self-end pt-8 text-primary-foreground/85 md:block">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary-foreground text-primary">
              <GrainsIcon weight="duotone" className="size-8" />
            </span>
          </CircularText>
        </div>

        <div className="p-7 sm:p-9">
          {status === "success" ? (
            <div role="status" className="flex h-full flex-col items-start justify-center gap-4">
              <span className="blob flex size-16 items-center justify-center bg-secondary text-primary">
                <SealCheckIcon aria-hidden="true" weight="duotone" className="size-9" />
              </span>
              <p className="font-heading text-2xl font-bold">Teşekkürler! Sizi bilgilendireceğiz.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="relative space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="wl-name" label="Ad soyad" error={errors.name}>
                  <Input
                    id="wl-name"
                    name="name"
                    autoComplete="name"
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                    {...describedBy("wl-name", errors.name)}
                  />
                </Field>
                <Field id="wl-email" label="E-posta" error={errors.email}>
                  <Input
                    id="wl-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                    {...describedBy("wl-email", errors.email)}
                  />
                </Field>
                <Field id="wl-city" label="İl" optional error={errors.city}>
                  <Input
                    id="wl-city"
                    name="city"
                    list="wl-iller"
                    value={values.city}
                    onChange={(e) => set("city", e.target.value)}
                    {...describedBy("wl-city", errors.city)}
                  />
                  <datalist id="wl-iller">
                    {provinces.map((p) => (
                      <option key={p.name} value={p.name} />
                    ))}
                  </datalist>
                </Field>
                <Field id="wl-crop" label="Yetiştirdiğiniz ürün" optional error={errors.crop}>
                  <Input
                    id="wl-crop"
                    name="crop"
                    placeholder="Örn. buğday, mısır, zeytin"
                    value={values.crop}
                    onChange={(e) => set("crop", e.target.value)}
                    {...describedBy("wl-crop", errors.crop)}
                  />
                </Field>
              </div>

              <div className="space-y-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-secondary/50 p-4 text-base">
                  <Checkbox
                    name="consent"
                    checked={values.consent}
                    onCheckedChange={(checked) => set("consent", checked === true)}
                    className="mt-0.5"
                    aria-labelledby="wl-consent-label"
                    {...describedBy("wl-consent", errors.consent)}
                  />
                  <span id="wl-consent-label">
                    Kişisel verilerimin{" "}
                    <Link href="/gizlilik" className="font-semibold text-primary underline underline-offset-4">
                      KVKK Aydınlatma Metni
                    </Link>{" "}
                    kapsamında, erken erişim bilgilendirmesi için işlenmesini kabul ediyorum.
                  </span>
                </label>
                {errors.consent && <FieldError id="wl-consent-hata">{errors.consent}</FieldError>}
              </div>

              <Honeypot value={values.website} onChange={(v) => set("website", v)} />
              {(status === "error" || status === "rate") && <FormError rateLimited={status === "rate"} />}
              <SubmitButton busy={status === "submitting"}>Kaydol</SubmitButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
