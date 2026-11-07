"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";

/** Where to go after sign-in: the `redirect_url` the site put there (a path on this site), else home. */
function returnTarget() {
  const asked = new URLSearchParams(window.location.search).get("redirect_url") ?? "";
  return asked.startsWith("/") && !asked.startsWith("//") ? asked : "/";
}

/** How far the computer's clock is from the site's, in whole minutes (positive: ahead). */
async function clockSkewMinutes(): Promise<number | null> {
  try {
    const res = await fetch("/robots.txt", { method: "HEAD", cache: "no-store" });
    const server = Date.parse(res.headers.get("date") ?? "");
    return Number.isNaN(server) ? null : Math.round((Date.now() - server) / 60_000);
  } catch {
    return null;
  }
}

type Stuck = { target: string; skew: number | null };

/**
 * On the sign-in and sign-up pages. Someone already signed in lands here when a page asked the
 * server and the server didn't see the sign-in yet (an out-of-date session token). Clerk's own form
 * would then send them to the home page, which looks like the button "did nothing". Instead: renew
 * the token and go back to where they were going, with a full page load. If that bounces straight
 * back, say so, and check the computer's clock (a clock that's behind makes every token look expired).
 */
export function SignedInRedirect({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const [stuck, setStuck] = useState<Stuck | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    void (async () => {
      const target = returnTarget();
      const key = `giris-yonlendirme:${target}`;
      const last = Number(sessionStorage.getItem(key) ?? 0);
      if (Date.now() - last < 30_000) {
        // Sent back within 30 s: renewing didn't help this time.
        sessionStorage.removeItem(key);
        const skew = await clockSkewMinutes();
        if (!cancelled) setStuck({ target, skew });
        return;
      }
      sessionStorage.setItem(key, String(Date.now()));
      await getToken({ skipCache: true }).catch(() => null);
      if (!cancelled) window.location.replace(target);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  // Clerk's form waits for Clerk anyway; holding it back until then keeps it from sending a
  // signed-in visitor home before this can step in.
  if (!isLoaded) return <div aria-hidden="true" className="h-[28rem] w-full max-w-[25rem] rounded-lg bg-muted motion-safe:animate-pulse" />;
  if (!isSignedIn) return <>{children}</>;
  if (!stuck) {
    return (
      <p role="status" className="w-full max-w-[25rem] rounded-lg border border-border bg-card p-6 text-lg">
        Giriş yapılmış; sayfanıza dönüyorsunuz…
      </p>
    );
  }

  const off = stuck.skew !== null && Math.abs(stuck.skew) >= 2 ? stuck.skew : null;
  return (
    <div role="alert" className="w-full max-w-[25rem] space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-xl font-bold">Oturumunuz doğrulanamadı</h2>
      {off !== null ? (
        <p className="text-lg">
          Bilgisayarınızın saati yaklaşık {Math.abs(off)} dakika {off > 0 ? "ileri" : "geri"}. Bu yüzden giriş bilginiz süresi dolmuş görünüyor. Windows’ta{" "}
          <strong>Ayarlar › Saat ve dil › Tarih ve saat</strong> bölümünde “Saati otomatik olarak ayarla”yı açın, sonra yeniden deneyin.
        </p>
      ) : (
        <p className="text-lg">Sayfayı yeniden deneyin. Sorun sürerse çıkış yapıp yeniden giriş yapın.</p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonVariants()} onClick={() => window.location.replace(stuck.target)}>
          Yeniden dene
        </button>
        <button type="button" className={buttonVariants({ variant: "outline" })} onClick={() => void signOut({ redirectUrl: `/giris?redirect_url=${encodeURIComponent(stuck.target)}` })}>
          Çıkış yap ve yeniden gir
        </button>
        <Link href="/" className={buttonVariants({ variant: "ghost" })}>
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
