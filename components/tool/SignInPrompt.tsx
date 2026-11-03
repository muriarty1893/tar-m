import Link from "next/link";
import type { ReactNode } from "react";
import { LockKeyIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { signInHref } from "@/lib/sign-in-href";

/** What a signed-out visitor sees on a page that keeps their own data (Takvim, Tarlalarım). */
export function SignInPrompt({ returnTo, title, children }: { returnTo: string; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
        <LockKeyIcon weight="duotone" className="size-7" />
      </span>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-2 max-w-xl text-lg text-muted-foreground">{children}</div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={signInHref(returnTo)} className={buttonVariants()}>
          Giriş yap
        </Link>
        <Link href={`/kayit?redirect_url=${encodeURIComponent(returnTo)}`} className={buttonVariants({ variant: "outline" })}>
          Ücretsiz hesap aç
        </Link>
      </div>
    </div>
  );
}
