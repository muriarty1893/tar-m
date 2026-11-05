"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { BellIcon, ChatsCircleIcon, HeartIcon, PlantIcon, SignInIcon, StorefrontIcon, UserCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";

/** How often the header asks for the unread count while the tab is visible. */
const POLL_MS = 30_000;

/** Sent when something marks notifications or chats as read, so the badges update at once. */
export const UNREAD_EVENT = "ciftci:okunmamis";

/** Unread chats (`messages`) and unseen notifications for the signed-in person (0 when signed out). */
export function useUnreadCounts() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const [counts, setCounts] = useState({ messages: 0, notifications: 0 });
  useEffect(() => {
    if (!isSignedIn) return;
    let stop = false;
    const load = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/mesajlar/okunmamis", { cache: "no-store" });
        if (!res.ok || stop) return;
        const data = (await res.json()) as { count: number; notifications?: number };
        setCounts({ messages: data.count, notifications: data.notifications ?? 0 });
      } catch {
        // Offline: keep the last counts.
      }
    };
    load();
    const timer = setInterval(load, POLL_MS);
    document.addEventListener("visibilitychange", load);
    window.addEventListener(UNREAD_EVENT, load);
    return () => {
      stop = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
      window.removeEventListener(UNREAD_EVENT, load);
    };
  }, [isSignedIn, pathname]);
  return isSignedIn ? counts : { messages: 0, notifications: 0 };
}

/** The number of chats with unread messages. */
export const useUnreadCount = () => useUnreadCounts().messages;

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[0.6875rem] font-bold leading-5 text-white ring-2 ring-background xl:-right-1 xl:-top-1 xl:min-w-6 xl:px-1.5 xl:text-xs xl:leading-6">
      {count > 9 ? "9+" : count}
    </span>
  );
}

// 44 px on phones (the touch minimum), 48 px with the desktop menu.
const roundButton =
  "relative flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[color-mix(in_oklab,currentColor_12%,transparent)] xl:size-12 xl:border-2 xl:border-border xl:hover:border-primary/50 xl:hover:bg-transparent";

/** Bildirimler (answers and mentions in the forum) and Mesajlar, each with its badge (signed in only). */
export function MessagesLink() {
  const { isSignedIn } = useAuth();
  const { messages, notifications } = useUnreadCounts();
  if (!isSignedIn) return null;
  return (
    <>
      <Link href="/bildirimler" aria-label={notifications ? `Bildirimler, ${notifications} yeni bildirim` : "Bildirimler"} className={roundButton}>
        <BellIcon aria-hidden="true" weight="regular" className="size-6" />
        <Badge count={notifications} />
      </Link>
      <Link href="/mesajlar" aria-label={messages ? `Mesajlar, ${messages} okunmamış sohbet` : "Mesajlar"} className={roundButton}>
        <ChatsCircleIcon aria-hidden="true" weight="regular" className="size-6" />
        <Badge count={messages} />
      </Link>
    </>
  );
}

/**
 * "Giriş yap", or the person's profile photo opening their menu (Clerk) with the site's own pages in
 * it. On phones the sign-in button is a compact pill beside the logo.
 */
export function AccountButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  if (!isLoaded) return <span aria-hidden="true" className="block size-10 xl:size-12" />;
  if (!isSignedIn) {
    const back = pathname.startsWith("/giris") || pathname.startsWith("/kayit") ? "/" : pathname;
    return (
      <Link
        href={`/giris?redirect_url=${encodeURIComponent(back)}`}
        className={buttonVariants({ variant: "outline", className: "whitespace-nowrap border-[var(--header-cta)]! text-[var(--header-cta)]! max-xl:h-10 max-xl:gap-1.5 max-xl:px-3 max-xl:text-base" })}
      >
        <SignInIcon aria-hidden="true" weight="bold" className="xl:hidden" />
        Giriş yap
      </Link>
    );
  }
  return (
    <span className="flex size-11 items-center justify-center xl:size-12">
      <UserButton appearance={{ elements: { avatarBox: { width: 36, height: 36 } } }}>
        <UserButton.MenuItems>
          <UserButton.Link label="Hesabım" labelIcon={<UserCircleIcon weight="duotone" className="size-4" />} href="/hesabim" />
          <UserButton.Link label="İlanlarım" labelIcon={<StorefrontIcon weight="duotone" className="size-4" />} href="/pazar?gorunum=ilanlarim" />
          <UserButton.Link label="Favorilerim" labelIcon={<HeartIcon weight="duotone" className="size-4" />} href="/pazar?gorunum=favoriler" />
          <UserButton.Link label="Mesajlar" labelIcon={<ChatsCircleIcon weight="duotone" className="size-4" />} href="/mesajlar" />
          <UserButton.Link label="Bildirimler" labelIcon={<BellIcon weight="duotone" className="size-4" />} href="/bildirimler" />
          <UserButton.Link label="Tarlalarım" labelIcon={<PlantIcon weight="duotone" className="size-4" />} href="/tarlalarim" />
        </UserButton.MenuItems>
      </UserButton>
    </span>
  );
}
