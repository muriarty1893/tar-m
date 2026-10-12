import type { ReactNode } from "react";
import { CaretDownIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/** Native select styled like the shadcn Input: native keeps the phone's own picker (best on mobile). */
export const selectClass =
  "min-h-12 w-full cursor-pointer appearance-none rounded-2xl border-2 border-input bg-card py-2 pl-4 pr-11 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 aria-invalid:border-destructive";

export function SelectChevron() {
  return (
    <CaretDownIcon
      aria-hidden="true"
      weight="bold"
      className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
    />
  );
}

// UI UX Pro Max (shadcn stack): visible label tied to the control, error right below the field.
export function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {optional && <span className="font-normal text-muted-foreground"> (isteğe bağlı)</span>}
      </Label>
      {children}
      {error && <FieldError id={`${id}-hata`}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-center gap-1.5 text-base font-semibold text-destructive">
      <WarningCircleIcon aria-hidden="true" weight="fill" className="size-5 shrink-0" />
      {children}
    </p>
  );
}

/** Invisible to people, tempting to bots; any value marks the submission as spam. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="website">Web sitesi</label>
      <input
        id="website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function FormError({ rateLimited = false }: { rateLimited?: boolean }) {
  return (
    <div role="alert" className="flex gap-3 rounded-2xl border-l-4 border-destructive bg-destructive/10 p-4">
      <WarningCircleIcon aria-hidden="true" weight="duotone" className="mt-0.5 size-6 shrink-0 text-destructive" />
      <div>
        <p className="font-semibold">
          {rateLimited
            ? "Çok fazla deneme yapıldı, lütfen birkaç dakika sonra tekrar deneyin."
            : "Bir sorun oluştu, lütfen tekrar deneyin."}
        </p>
        <p className="mt-1">
          Sorun devam ederse bize{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="font-semibold text-primary underline underline-offset-4">
            {siteConfig.contactEmail}
          </a>{" "}
          adresinden yazabilirsiniz.
        </p>
      </div>
    </div>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
      {busy && (
        <span aria-hidden="true" className="size-5 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />
      )}
      {busy ? "Gönderiliyor…" : children}
    </Button>
  );
}

export const describedBy = (id: string, error?: string) =>
  error ? { "aria-invalid": true as const, "aria-describedby": `${id}-hata` } : {};
