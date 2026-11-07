import Link from "next/link";
import type { ReactNode } from "react";
import { LockKeyIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { signInHref } from "@/lib/sign-in-href";

/** What a signed-out visitor sees on a page that keeps their own data (Takvim, Tarlalarım). */
export function SignInPrompt({ returnTo, title, children }: { returnTo: string; title: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 sm:p-5">
      <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-md bg-secondary text-primary">
        <LockKeyIcon weight="fill" className="size-5" />
      </span>
      <h2 className="mt-3 text-lg font-bold">{title}</h2>
      <div className="mt-1 max-w-xl text-[0.9375rem] text-muted-foreground">{children}</div>
      <div className="mt-4 flex flex-wrap gap-2">
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
