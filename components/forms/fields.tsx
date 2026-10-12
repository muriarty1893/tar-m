import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

export const inputClass =
  "min-h-12 w-full rounded-xl border border-line bg-card px-4 py-2 text-lg aria-[invalid=true]:border-red-600";

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
    <div className="space-y-1">
      <label htmlFor={id} className="block font-semibold">
        {label}
        {optional && <span className="font-normal text-muted"> (isteğe bağlı)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-hata`} className="text-base font-semibold text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
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
    <div role="alert" className="rounded-xl border-l-4 border-red-600 bg-red-600/10 p-4">
      <p className="font-semibold">
        {rateLimited
          ? "Çok fazla deneme yapıldı, lütfen birkaç dakika sonra tekrar deneyin."
          : "Bir sorun oluştu, lütfen tekrar deneyin."}
      </p>
      <p className="mt-1">
        Sorun devam ederse bize{" "}
        <a href={`mailto:${siteConfig.contactEmail}`} className="font-semibold text-primary underline">
          {siteConfig.contactEmail}
        </a>{" "}
        adresinden yazabilirsiniz.
      </p>
    </div>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="min-h-12 w-full rounded-full bg-primary px-6 py-3 text-lg font-bold text-on-primary transition hover:bg-primary-strong disabled:opacity-60 sm:w-auto"
    >
      {busy ? "Gönderiliyor…" : children}
    </button>
  );
}

export const describedBy = (id: string, error?: string) =>
  error ? { "aria-invalid": true as const, "aria-describedby": `${id}-hata` } : {};
