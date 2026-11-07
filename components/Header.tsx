"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { siteConfig } from "@/config/site";
import { AccountButton, MessagesLink } from "./account/HeaderAccount";

/** The wide-screen menu: plain links, the current page in blue with a line under it. */
function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Ana menü" className="hidden h-full xl:block">
      <ul className="flex h-full items-stretch">
        {siteConfig.nav.map((item) => {
          const active = Boolean(pathname) && pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="relative flex items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-offset-[-3px] aria-[current=page]:font-semibold aria-[current=page]:text-primary"
              >
                {item.label}
                <span aria-hidden="true" className={`absolute inset-x-3 bottom-0 h-0.5 ${active ? "bg-primary" : "bg-transparent"}`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function CurrentNav() {
  return <DesktopNav pathname={usePathname()} />;
}

/**
 * The top bar (Borsa): white with a hairline. The logo and the name on the left; Bildirimler, Mesajlar
 * and the profile photo (or "Giriş yap") on the right. Phones and tablets navigate with the bottom
 * tab bar (BottomNav); wide screens get a plain menu between the two.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--header-line)] bg-[var(--header-bg)] text-[var(--header-fg)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-2.5 sm:px-4">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 rounded-md xl:mr-4">
          <Image src="/brand/logo.webp" alt="" width={192} height={192} loading="eager" className="size-8 shrink-0" />
          <span className="truncate text-base font-bold leading-tight">{siteConfig.name}</span>
        </Link>

        {/* The current page is URL data: on dynamic pages it streams in, the plain menu shows first. */}
        <Suspense fallback={<DesktopNav pathname="" />}>
          <CurrentNav />
        </Suspense>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <Suspense>
            <MessagesLink />
          </Suspense>
          <Suspense fallback={<span aria-hidden="true" className="block size-9" />}>
            <AccountButton />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
