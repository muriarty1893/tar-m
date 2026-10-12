"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { provinces } from "@/data/provinces";
import { useFormSubmit } from "./forms/useFormSubmit";
import { Field, FormError, Honeypot, SubmitButton, describedBy, inputClass } from "./forms/fields";

const initial = { name: "", email: "", city: "", crop: "", consent: false, website: "" };

export function WaitlistForm() {
  const [values, setValues] = useState(initial);
  const { status, errors, submit } = useFormSubmit<typeof initial>("waitlist");
  const set = <K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) => setValues((s) => ({ ...s, [k]: v }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(values);
  };

  return (
    <div id="kayit" className="scroll-mt-24 rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
      <h2 className="text-3xl font-extrabold">Erken erişim listesine katılın</h2>
      <p className="mt-2 text-lg text-muted">
        Uygulama hazır olduğunda ilk siz haberdar olun. Kayıt ücretsizdir.
      </p>

      {status === "success" ? (
        <p role="status" className="mt-6 rounded-xl border-l-4 border-primary bg-primary/10 p-4 text-lg font-semibold">
          Teşekkürler! Sizi bilgilendireceğiz.
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="relative mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="wl-name" label="Ad soyad" error={errors.name}>
              <input
                id="wl-name"
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputClass}
                {...describedBy("wl-name", errors.name)}
              />
            </Field>
            <Field id="wl-email" label="E-posta" error={errors.email}>
              <input
                id="wl-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                className={inputClass}
                {...describedBy("wl-email", errors.email)}
              />
            </Field>
            <Field id="wl-city" label="İl" optional error={errors.city}>
              <input
                id="wl-city"
                name="city"
                list="wl-iller"
                value={values.city}
                onChange={(e) => set("city", e.target.value)}
                className={inputClass}
                {...describedBy("wl-city", errors.city)}
              />
              <datalist id="wl-iller">
                {provinces.map((p) => (
                  <option key={p.name} value={p.name} />
                ))}
              </datalist>
            </Field>
            <Field id="wl-crop" label="Yetiştirdiğiniz ürün" optional error={errors.crop}>
              <input
                id="wl-crop"
                name="crop"
                placeholder="Örn. buğday, mısır, zeytin"
                value={values.crop}
                onChange={(e) => set("crop", e.target.value)}
                className={inputClass}
                {...describedBy("wl-crop", errors.crop)}
              />
            </Field>
          </div>

          <div className="space-y-1">
            <label className="flex items-start gap-3 text-base">
              <input
                type="checkbox"
                name="consent"
                checked={values.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-1 h-6 w-6 shrink-0 accent-primary"
                {...describedBy("wl-consent", errors.consent)}
              />
              <span>
                Kişisel verilerimin{" "}
                <Link href="/gizlilik" className="font-semibold text-primary underline">
                  KVKK Aydınlatma Metni
                </Link>{" "}
                kapsamında, erken erişim bilgilendirmesi için işlenmesini kabul ediyorum.
              </span>
            </label>
            {errors.consent && (
              <p id="wl-consent-hata" className="text-base font-semibold text-red-700 dark:text-red-400">
                {errors.consent}
              </p>
            )}
          </div>

          <Honeypot value={values.website} onChange={(v) => set("website", v)} />
          {(status === "error" || status === "rate") && <FormError rateLimited={status === "rate"} />}
          <SubmitButton busy={status === "submitting"}>Kaydol</SubmitButton>
        </form>
      )}
    </div>
  );
}
