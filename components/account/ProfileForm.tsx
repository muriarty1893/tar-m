"use client";

import { useState, useTransition } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { provinces } from "@/data/provinces";
import { updateProfile, type ProfileResult } from "@/app/hesabim/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, SelectChevron, describedBy, selectClass } from "@/components/forms/fields";

export function ProfileForm({ name, province, handle, next }: { name: string; province: string; handle: string; next: string }) {
  const [values, setValues] = useState({ name, province, handle });
  const [result, setResult] = useState<ProfileResult>({ errors: {} });
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setResult(await updateProfile(values.name, values.province, values.handle, next)));
      }}
      className="space-y-6"
    >
      <Field id="profil-ad" label="Adınız ve soyadınız" error={result.errors.name}>
        <Input
          id="profil-ad"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          {...describedBy("profil-ad", result.errors.name)}
        />
      </Field>
      <p className="-mt-3 text-muted-foreground">İlanlarınızda ve mesajlarda bu ad görünür. E-posta adresiniz kimseye gösterilmez.</p>
      <Field id="profil-kullanici" label="Kullanıcı adı" optional error={result.errors.handle}>
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
            @
          </span>
          <Input
            id="profil-kullanici"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={21}
            value={values.handle}
            placeholder={handle ? undefined : "adınızdan yapılır"}
            onChange={(e) => setValues((v) => ({ ...v, handle: e.target.value.replace(/^@+/, "").toLowerCase() }))}
            className="pl-9"
            {...describedBy("profil-kullanici", result.errors.handle)}
          />
        </div>
      </Field>
      <p className="-mt-3 text-muted-foreground">Forumda sizden bahsetmek için yazılır: @{values.handle || "kullaniciadi"}. Küçük harf (Türkçe harfler olmadan), rakam ve alt çizgi; 3–20 karakter.</p>
      <Field id="profil-il" label="İliniz" optional error={result.errors.province}>
        <div className="relative">
          <select
            id="profil-il"
            value={values.province}
            onChange={(e) => setValues((v) => ({ ...v, province: e.target.value }))}
            className={selectClass}
            {...describedBy("profil-il", result.errors.province)}
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
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Kaydediliyor…" : next ? "Kaydet ve devam et" : "Kaydet"}
        </Button>
        {result.saved && (
          <p role="status" className="flex items-center gap-2 font-semibold text-primary">
            <CheckCircleIcon aria-hidden="true" weight="fill" className="size-5" />
            Kaydedildi
          </p>
        )}
      </div>
    </form>
  );
}
