"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { HeartIcon } from "@phosphor-icons/react/dist/ssr";
import { toggleFavorite } from "@/app/pazar/actions";

/**
 * The heart on a listing. Signed out, it goes to sign-in and back. Signed in but not seen by the
 * server (an out-of-date session token), it renews the token and tries once more first.
 */
export function FavoriteButton({ listingId, favorite, variant = "overlay" }: { listingId: string; favorite: boolean; variant?: "overlay" | "inline" }) {
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const [pending, start] = useTransition();
  const [shown, setShown] = useOptimistic(favorite);

  const onClick = () =>
    start(async () => {
      setShown(!shown);
      let r = await toggleFavorite(listingId);
      if ("signIn" in r && isSignedIn) {
        await getToken({ skipCache: true }).catch(() => null);
        r = await toggleFavorite(listingId);
      }
      if ("signIn" in r) window.location.assign(r.signIn);
      else router.refresh();
    });

  const label = shown ? "Favorilerden çıkar" : "Favorilere ekle";
  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={shown}
        disabled={pending}
        className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-[var(--btn-radius)] border-2 border-border px-4 font-semibold transition-colors hover:border-primary/50 hover:bg-secondary disabled:opacity-70"
      >
        <HeartIcon aria-hidden="true" weight={shown ? "fill" : "bold"} className={`size-5 ${shown ? "text-destructive" : ""}`} />
        {shown ? "Favorilerde" : "Favorilere ekle"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={shown}
      disabled={pending}
      className="absolute right-2 top-2 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-soft transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-80"
    >
      <HeartIcon aria-hidden="true" weight={shown ? "fill" : "bold"} className={`size-5 ${shown ? "text-destructive" : "text-foreground"}`} />
    </button>
  );
}
