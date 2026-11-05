"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { siteConfig } from "@/config/site";
import { Logo } from "./Logo";
import { PillNav } from "./ui/pill-nav";
import { AccountButton, MessagesLink } from "./account/HeaderAccount";

/** Desktop navigation: React Bits PillNav in the site's green. The current page gets a dot. */
function DesktopNav() {
  const pathname = usePathname();
  const items = siteConfig.nav.map((item) => ({ ...item, active: !item.href.includes("#") && pathname.startsWith(item.href) }));
  return <PillNav label="Ana menü" items={items} className="hidden xl:block" />;
}

/**
 * The top bar. On phones and tablets (below 1280 px), the app's bar: the logo and the name on the
 * left; Bildirimler, Mesajlar and the profile photo (or "Giriş yap") on the right. Navigation is the
 * bottom tab bar (BottomNav). On wide screens the menu sits in the middle, as before.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--header-line)] bg-[var(--header-bg)] text-[var(--header-fg)] backdrop-blur-md">
      {/* On wide screens a three-column grid keeps the menu centred: the account button, which
          appears once sign-in has loaded, can't push it sideways. */}
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 min-[400px]:px-4 xl:grid xl:h-18 xl:grid-cols-[1fr_auto_1fr] xl:gap-4">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 justify-self-start rounded-xl">
          {/* Phones: a compact mark and the name; wide screens: the full logo. */}
          <span className="flex min-w-0 items-center gap-2 xl:hidden">
            <Image src="/brand/logo.webp" alt="" width={192} height={192} loading="eager" className="size-9 shrink-0" />
            <span className="truncate font-heading text-lg font-extrabold leading-tight tracking-tight">{siteConfig.name}</span>
          </span>
          <span className="hidden xl:block">
            <Logo className="text-xl" />
          </span>
        </Link>

        {/* The current page is URL data: on dynamic pages it streams in, the plain menu shows first. */}
        <Suspense fallback={<PillNav label="Ana menü" items={siteConfig.nav} className="hidden xl:block" />}>
          <DesktopNav />
        </Suspense>

        <div className="flex shrink-0 items-center gap-1.5 justify-self-end min-[400px]:gap-2">
          <Suspense>
            <MessagesLink />
          </Suspense>
          <Suspense fallback={<span aria-hidden="true" className="block size-10 xl:size-12" />}>
            <AccountButton />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
