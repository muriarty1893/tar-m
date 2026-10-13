"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ChatCircleDotsIcon, SealCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormSubmit } from "./forms/useFormSubmit";
import { Field, FieldError, FormError, Honeypot, SubmitButton, describedBy } from "./forms/fields";

const initial = { name: "", email: "", question: "", consent: false, website: "" };
const MAX = 1000;

/** "Ask the team" form; rows land in the `question` tab of the Google Sheet. */
export function QuestionForm() {
  const [values, setValues] = useState(initial);
  const { status, errors, submit } = useFormSubmit<typeof initial>("question");
  const set = <K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) => setValues((s) => ({ ...s, [k]: v }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(values);
  };

  if (status === "success") {
    return (
      <div role="status" className="flex h-full flex-col items-start justify-center gap-4 rounded-[2rem] border border-border bg-card p-8 shadow-lift">
        <span className="blob flex size-16 items-center justify-center bg-secondary text-primary">
          <SealCheckIcon aria-hidden="true" weight="duotone" className="size-9" />
        </span>
        <p className="font-heading text-2xl font-bold">Teşekkürler! Sorunuzu aldık.</p>
        <p className="text-muted-foreground">En kısa sürede e-posta adresinize yanıt vereceğiz.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5 rounded-[2rem] border border-border bg-card p-6 shadow-lift sm:p-8">
      <p className="flex items-center gap-2 font-heading text-xl font-bold">
        <ChatCircleDotsIcon aria-hidden="true" weight="duotone" className="size-7 text-primary" />
        Ekibimize sorun
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="sr-name" label="Adınız" optional error={errors.name}>
          <Input id="sr-name" name="name" autoComplete="given-name" value={values.name} onChange={(e) => set("name", e.target.value)} {...describedBy("sr-name", errors.name)} />
        </Field>
        <Field id="sr-email" label="E-posta" error={errors.email}>
          <Input
            id="sr-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            {...describedBy("sr-email", errors.email)}
          />
        </Field>
      </div>
      <Field id="sr-question" label="Sorunuz" error={errors.question}>
        <Textarea
          id="sr-question"
          name="question"
          rows={4}
          maxLength={MAX}
          placeholder="Örn. Uygulama sera domatesinde de çalışacak mı?"
          value={values.question}
          onChange={(e) => set("question", e.target.value)}
          {...describedBy("sr-question", errors.question)}
        />
        <p className="text-right text-sm text-muted-foreground">
          {values.question.length}/{MAX}
        </p>
      </Field>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-secondary/50 p-4 text-base">
          <Checkbox
            name="consent"
            checked={values.consent}
            onCheckedChange={(checked) => set("consent", checked === true)}
            className="mt-0.5"
            aria-labelledby="sr-consent-label"
            {...describedBy("sr-consent", errors.consent)}
          />
          <span id="sr-consent-label">
            Sorumu yanıtlamanız için e-posta adresimin{" "}
            <Link href="/gizlilik" className="font-semibold text-primary underline underline-offset-4">
              KVKK Aydınlatma Metni
            </Link>{" "}
            kapsamında işlenmesini kabul ediyorum.
          </span>
        </label>
        {errors.consent && <FieldError id="sr-consent-hata">{errors.consent}</FieldError>}
      </div>

      <Honeypot value={values.website} onChange={(v) => set("website", v)} />
      {(status === "error" || status === "rate") && <FormError rateLimited={status === "rate"} />}
      <SubmitButton busy={status === "submitting"}>Soruyu gönder</SubmitButton>
    </form>
  );
}
