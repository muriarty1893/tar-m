"use client";

import { useState, type FormEvent } from "react";
import { PARTNER_TYPES } from "@/lib/partner-types";
import { useFormSubmit } from "./forms/useFormSubmit";
import { Field, FormError, Honeypot, SubmitButton, describedBy, inputClass } from "./forms/fields";

const initial = { name: "", organization: "", email: "", phone: "", type: "", message: "", website: "" };

export function PartnerForm() {
  const [values, setValues] = useState(initial);
  const { status, errors, submit } = useFormSubmit<typeof initial>("partner");
  const set = (k: keyof typeof initial, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(values);
  };

  if (status === "success") {
    return (
      <p role="status" className="rounded-xl border-l-4 border-primary bg-primary/10 p-4 text-lg font-semibold">
        Teşekkürler! Mesajınızı aldık, en kısa sürede size dönüş yapacağız.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="p-name" label="Ad soyad" error={errors.name}>
          <input id="p-name" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} className={inputClass} {...describedBy("p-name", errors.name)} />
        </Field>
        <Field id="p-org" label="Kurum adı" error={errors.organization}>
          <input id="p-org" autoComplete="organization" value={values.organization} onChange={(e) => set("organization", e.target.value)} className={inputClass} {...describedBy("p-org", errors.organization)} />
        </Field>
        <Field id="p-email" label="E-posta" error={errors.email}>
          <input id="p-email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} className={inputClass} {...describedBy("p-email", errors.email)} />
        </Field>
        <Field id="p-phone" label="Telefon" optional error={errors.phone}>
          <input id="p-phone" type="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} {...describedBy("p-phone", errors.phone)} />
        </Field>
      </div>
      <Field id="p-type" label="Kurum türü" error={errors.type}>
        <select id="p-type" value={values.type} onChange={(e) => set("type", e.target.value)} className={inputClass} {...describedBy("p-type", errors.type)}>
          <option value="">Seçiniz</option>
          {Object.entries(PARTNER_TYPES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field id="p-message" label="Mesajınız" error={errors.message}>
        <textarea id="p-message" rows={5} maxLength={2000} value={values.message} onChange={(e) => set("message", e.target.value)} className={inputClass} {...describedBy("p-message", errors.message)} />
      </Field>
      <Honeypot value={values.website} onChange={(v) => set("website", v)} />
      {status === "error" && <FormError />}
      <SubmitButton busy={status === "submitting"}>Mesajı gönder</SubmitButton>
    </form>
  );
}
