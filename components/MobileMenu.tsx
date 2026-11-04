"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { RefObject } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { BellIcon, CaretRightIcon, ChatsCircleIcon, EnvelopeSimpleIcon, SignOutIcon, UserCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CtaLink } from "./CtaLink";
import { Logo } from "./Logo";
import { navExtras } from "./nav-items";
import { useUnreadCounts } from "./account/HeaderAccount";

/**
 * Full-screen menu (Base UI Dialog via the shadcn Sheet: focus trap, Escape, focus return).
 * Big icon rows with a one-line hint, a staggered entrance, and the CTAs within thumb reach.
 * Loaded on the first tap of the menu button, not with the page.
 */
export default function MobileMenu({
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
  const { messages: unread, notifications } = useUnreadCounts();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="mobil-menu"
        side="top"
        finalFocus={returnFocusTo}
        data-lenis-prevent
        className="h-[100dvh] gap-0 overflow-y-auto overscroll-contain data-[side=top]:h-[100dvh] border-0 bg-background px-4 pb-8 pt-0 [&>[data-slot=sheet-close]]:right-4 [&>[data-slot=sheet-close]]:top-3.5 [&>[data-slot=sheet-close]]:size-12 [&>[data-slot=sheet-close]]:rounded-full [&>[data-slot=sheet-close]]:border-2 [&>[data-slot=sheet-close]]:border-primary"
      >
        <div className="flex h-18 items-center">
          <Logo className="text-xl" />
        </div>
        <SheetTitle className="eyebrow mt-4">Menü</SheetTitle>
        <nav aria-label="Mobil menü" className="mt-3">
          <ul className="space-y-2">
            {siteConfig.nav.map((item, i) => {
              const extra = navExtras[item.href];
              const Icon = extra?.icon;
              const current = !item.href.includes("#") && pathname.startsWith(item.href);
              return (
                <li
                  key={item.href}
                  className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:fill-mode-both motion-safe:duration-400"
                  style={{ animationDelay: `${60 + i * 45}ms` }}
                >
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={current ? "page" : undefined}
                    className="group flex min-h-16 items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft transition-colors duration-200 hover:border-primary/40 hover:bg-secondary aria-[current=page]:border-primary aria-[current=page]:bg-secondary"
                  >
                    {Icon && (
                      <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon weight="duotone" className="size-6" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-semibold text-foreground">{item.label}</span>
                      {extra && <span className="block truncate text-sm text-muted-foreground">{extra.hint}</span>}
                    </span>
                    <CaretRightIcon aria-hidden="true" weight="bold" className="size-5 text-primary transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <nav aria-label="Diğer sayfalar" className="mt-6">
          <ul className="grid grid-cols-2 gap-2">
            {siteConfig.moreNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="flex min-h-12 items-center rounded-2xl border border-border px-4 font-semibold transition-colors hover:border-primary/40 hover:bg-secondary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 grid gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both motion-safe:duration-500" style={{ animationDelay: "340ms" }}>
          {isSignedIn ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/mesajlar" onClick={close} className={buttonVariants({ size: "lg", className: "w-full" })}>
                  <ChatsCircleIcon aria-hidden="true" weight="duotone" />
                  Mesajlar
                  {unread > 0 && <span className="rounded-full bg-white px-2 text-sm font-bold text-primary">{unread}</span>}
                </Link>
                <Link href="/bildirimler" onClick={close} className={buttonVariants({ size: "lg", variant: "outline", className: "w-full" })}>
                  <BellIcon aria-hidden="true" weight="duotone" />
                  Bildirimler
                  {notifications > 0 && <span className="rounded-full bg-destructive px-2 text-sm font-bold text-white">{notifications}</span>}
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/hesabim" onClick={close} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                  <UserCircleIcon aria-hidden="true" weight="duotone" />
                  Hesabım
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    clerk.signOut({ redirectUrl: "/" });
                  }}
                  className={buttonVariants({ variant: "ghost", className: "w-full" })}
                >
                  <SignOutIcon aria-hidden="true" weight="bold" />
                  Çıkış yap
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/giris?redirect_url=${encodeURIComponent(pathname)}`} onClick={close} className={buttonVariants({ size: "lg", className: "w-full" })}>
                Giriş yap
              </Link>
              <Link href="/kayit" onClick={close} className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}>
                Hesap aç
              </Link>
            </div>
          )}
          <CtaLink size="lg" variant="gold" className="w-full" onClick={close} />
          <a href={`mailto:${siteConfig.contactEmail}`} className="inline-flex min-h-11 items-center justify-center gap-2 text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
            <EnvelopeSimpleIcon aria-hidden="true" weight="duotone" className="size-5" />
            {siteConfig.contactEmail}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
