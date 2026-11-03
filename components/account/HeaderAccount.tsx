"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { ChatsCircleIcon, PlantIcon, StorefrontIcon, UserCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";

/** How often the header asks for the unread count while the tab is visible. */
const POLL_MS = 30_000;

/** The number of chats with unread messages, for the signed-in person (0 when signed out). */
export function useUnreadCount() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isSignedIn) return;
    let stop = false;
    const load = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/mesajlar/okunmamis", { cache: "no-store" });
        if (res.ok && !stop) setCount(((await res.json()) as { count: number }).count);
      } catch {
        // Offline: keep the last count.
      }
    };
    load();
    const timer = setInterval(load, POLL_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      stop = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, [isSignedIn, pathname]);
  return isSignedIn ? count : 0;
}

/** The Mesajlar button with its unread badge (signed in only). */
export function MessagesLink() {
  const { isSignedIn } = useAuth();
  const count = useUnreadCount();
  if (!isSignedIn) return null;
  const label = count ? `Mesajlar, ${count} okunmamış sohbet` : "Mesajlar";
  return (
    <Link href="/mesajlar" aria-label={label} className="relative flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-border text-foreground transition-colors hover:border-primary/50 hover:text-primary">
      <ChatsCircleIcon aria-hidden="true" weight="duotone" className="size-6" />
      {count > 0 && (
        <span aria-hidden="true" className="absolute -right-1 -top-1 flex min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-bold leading-6 text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

/** "Giriş yap", or the person's menu (Clerk) with the site's own pages in it. */
export function AccountButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  if (!isLoaded) return <span aria-hidden="true" className="block size-12" />;
  if (!isSignedIn) {
    const back = pathname.startsWith("/giris") || pathname.startsWith("/kayit") ? "/" : pathname;
    return (
      <Link href={`/giris?redirect_url=${encodeURIComponent(back)}`} className={buttonVariants({ variant: "outline", className: "whitespace-nowrap" })}>
        Giriş yap
      </Link>
    );
  }
  return (
    <span className="flex size-12 items-center justify-center">
      <UserButton appearance={{ elements: { avatarBox: { width: 40, height: 40 } } }}>
        <UserButton.MenuItems>
          <UserButton.Link label="Hesabım" labelIcon={<UserCircleIcon weight="duotone" className="size-4" />} href="/hesabim" />
          <UserButton.Link label="İlanlarım" labelIcon={<StorefrontIcon weight="duotone" className="size-4" />} href="/pazar?gorunum=ilanlarim" />
          <UserButton.Link label="Mesajlar" labelIcon={<ChatsCircleIcon weight="duotone" className="size-4" />} href="/mesajlar" />
          <UserButton.Link label="Tarlalarım" labelIcon={<PlantIcon weight="duotone" className="size-4" />} href="/tarlalarim" />
        </UserButton.MenuItems>
      </UserButton>
    </span>
  );
}
