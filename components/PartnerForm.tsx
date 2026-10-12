"use client";

import { useState, type FormEvent } from "react";
import { SealCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { PARTNER_TYPES } from "@/lib/partner-types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormSubmit } from "./forms/useFormSubmit";
import { Field, FormError, Honeypot, SelectChevron, SubmitButton, describedBy, selectClass } from "./forms/fields";

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
      <div role="status" className="flex flex-col items-start gap-4 py-6">
        <span className="blob flex size-16 items-center justify-center bg-secondary text-primary">
          <SealCheckIcon aria-hidden="true" weight="duotone" className="size-9" />
        </span>
        <p className="font-heading text-2xl font-bold">Teşekkürler! Mesajınızı aldık, en kısa sürede size dönüş yapacağız.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="p-name" label="Ad soyad" error={errors.name}>
          <Input id="p-name" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} {...describedBy("p-name", errors.name)} />
        </Field>
        <Field id="p-org" label="Kurum adı" error={errors.organization}>
          <Input id="p-org" autoComplete="organization" value={values.organization} onChange={(e) => set("organization", e.target.value)} {...describedBy("p-org", errors.organization)} />
        </Field>
        <Field id="p-email" label="E-posta" error={errors.email}>
          <Input id="p-email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} {...describedBy("p-email", errors.email)} />
        </Field>
        <Field id="p-phone" label="Telefon" optional error={errors.phone}>
          <Input id="p-phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} {...describedBy("p-phone", errors.phone)} />
        </Field>
      </div>
      <Field id="p-type" label="Kurum türü" error={errors.type}>
        <div className="relative">
          <select id="p-type" value={values.type} onChange={(e) => set("type", e.target.value)} className={selectClass} {...describedBy("p-type", errors.type)}>
            <option value="">Seçiniz</option>
            {Object.entries(PARTNER_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </Field>
      <Field id="p-message" label="Mesajınız" error={errors.message}>
        <Textarea id="p-message" rows={5} maxLength={2000} value={values.message} onChange={(e) => set("message", e.target.value)} {...describedBy("p-message", errors.message)} />
      </Field>
      <Honeypot value={values.website} onChange={(v) => set("website", v)} />
      {(status === "error" || status === "rate") && <FormError rateLimited={status === "rate"} />}
      <SubmitButton busy={status === "submitting"}>Mesajı gönder</SubmitButton>
    </form>
  );
}
