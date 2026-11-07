"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type RefObject } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { CaretRightIcon, EnvelopeSimpleIcon, ShieldCheckIcon, SignOutIcon, UserCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useUnreadCounts } from "@/components/account/HeaderAccount";
import { QUICK_ITEMS, QUICK_LINKS, TILE } from "./quick-menu-items";

/**
 * "Hızlı menü": a sheet from the bottom with the site's other tools as bright tiles (as on the
 * app's home screen), the account, and the info pages. Base UI Dialog: focus trap, Escape, focus
 * back on the tab. Loaded on the first tap.
 */
export default function QuickMenu({
  open,
  onOpenChange,
  returnFocusTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusTo: RefObject<HTMLButtonElement | null>;
}) {
  const close = () => onOpenChange(false);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const { messages, notifications } = useUnreadCounts();
  const admin = useIsAdmin(Boolean(isSignedIn) && open);
  const badge: Record<string, number> = { "/mesajlar": messages, "/bildirimler": notifications };
  const items = QUICK_ITEMS.filter((i) => !i.signedIn || isSignedIn);
  const back = encodeURIComponent(pathname.startsWith("/giris") || pathname.startsWith("/kayit") ? "/" : pathname);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        finalFocus={returnFocusTo}
        data-lenis-prevent
        className="max-h-[88dvh] gap-0 overflow-y-auto overscroll-contain rounded-t-lg border-0 bg-background px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 [&>[data-slot=sheet-close]]:right-3 [&>[data-slot=sheet-close]]:top-3 [&>[data-slot=sheet-close]]:size-11 [&>[data-slot=sheet-close]]:rounded-full"
      >
        <SheetTitle className="pr-12 text-lg font-bold">Hızlı menü</SheetTitle>

        <nav aria-label="Kısayollar" className="mt-3">
          <ul className="grid grid-cols-4 gap-2">
            {items.map(({ href, label, Icon, tone }) => {
              const n = badge[href] ?? 0;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={close}
                    className={`relative flex h-full flex-col items-center gap-1.5 rounded-lg border px-1 pb-2 pt-2.5 transition-transform duration-150 active:scale-[0.97] motion-reduce:active:scale-100 ${TILE[tone]}`}
                  >
                    <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-[14px] bg-[var(--solid)] text-white shadow-[0_6px_14px_-6px_var(--solid)]">
                      <Icon weight="bold" className="size-5" />
                    </span>
                    <span className="flex min-h-[2lh] items-center text-center text-xs font-bold leading-tight text-foreground">{label}</span>
                    {n > 0 && (
                      <span className="absolute right-1.5 top-1.5 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[0.6875rem] font-bold leading-5 text-white">
                        {n > 9 ? "9+" : n}
                        <span className="sr-only"> yeni</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {isSignedIn ? (
            <>
              <Link href="/hesabim" onClick={close} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                <UserCircleIcon aria-hidden="true" weight="duotone" />
                Hesabım
              </Link>
              {admin ? (
                <Link href="/yonetim" onClick={close} className={buttonVariants({ variant: "outline", className: "w-full border-gold/40 text-gold hover:bg-gold-soft" })}>
                  <ShieldCheckIcon aria-hidden="true" weight="fill" />
                  Yönetim
                </Link>
              ) : (
                <SignOut onDone={close} signOut={() => clerk.signOut({ redirectUrl: "/" })} />
              )}
            </>
          ) : (
            <>
              <Link href={`/giris?redirect_url=${back}`} onClick={close} className={buttonVariants({ className: "w-full" })}>
                Giriş yap
              </Link>
              <Link href="/kayit" onClick={close} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                Hesap aç
              </Link>
            </>
          )}
        </div>

        <nav aria-label="Diğer sayfalar" className="mt-5">
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className="flex min-h-11 items-center justify-between gap-3 px-4 font-medium transition-colors hover:bg-secondary">
                  {l.label}
                  <CaretRightIcon aria-hidden="true" weight="bold" className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <a href={`mailto:${siteConfig.contactEmail}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
            <EnvelopeSimpleIcon aria-hidden="true" weight="duotone" className="size-5" />
            {siteConfig.contactEmail}
          </a>
          {isSignedIn && admin && <SignOut onDone={close} signOut={() => clerk.signOut({ redirectUrl: "/" })} compact />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SignOut({ onDone, signOut, compact = false }: { onDone: () => void; signOut: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => {
        onDone();
        signOut();
      }}
      className={buttonVariants({ variant: "ghost", size: compact ? "sm" : "default", className: compact ? "text-muted-foreground" : "w-full" })}
    >
      <SignOutIcon aria-hidden="true" weight="bold" />
      Çıkış yap
    </button>
  );
}

/** Asks once per sheet opening whether the signed-in person is an admin. */
function useIsAdmin(ask: boolean) {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    if (!ask) return;
    let live = true;
    fetch("/api/yonetici", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((d: { admin?: boolean }) => live && setAdmin(d.admin === true))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [ask]);
  return admin;
}
