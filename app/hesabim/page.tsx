import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChatsCircleIcon, NotebookIcon, PlantIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { ProfileForm } from "@/components/account/ProfileForm";
import { DeleteAccount, SecurityControls } from "@/components/account/AccountControls";
import { ensureProfile, isAdmin, requireUserId } from "@/lib/auth";
import { safeReturnPath } from "@/lib/sign-in-href";

export const metadata: Metadata = { title: "Hesabım", robots: { index: false } };

const shortcuts = [
  { href: "/pazar?gorunum=ilanlarim", label: "İlanlarım", Icon: StorefrontIcon },
  { href: "/mesajlar", label: "Mesajlar", Icon: ChatsCircleIcon },
  { href: "/tarlalarim", label: "Tarlalarım", Icon: PlantIcon },
  { href: "/takvim", label: "Tarım takvimi", Icon: NotebookIcon },
];

export default function AccountPage({ searchParams }: PageProps<"/hesabim">) {
  return (
    <>
      <ToolHeader eyebrow="Hesap" title="Hesabım" />
      <div className="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-6">
        <Suspense fallback={<div aria-hidden="true" className="h-96 rounded-lg bg-muted motion-safe:animate-pulse" />}>
          <Account searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Account({ searchParams }: { searchParams: PageProps<"/hesabim">["searchParams"] }) {
  const sp = await searchParams;
  const next = safeReturnPath(sp.devam, "");
  const userId = await requireUserId("/hesabim");
  const profile = await ensureProfile(userId);

  return (
    <div className="space-y-3 sm:space-y-4">
      {next && !profile.name && (
        <p role="status" className="rounded-md border border-gold/30 bg-gold-soft px-3 py-2.5 text-[0.9375rem] font-medium">
          Devam etmeden önce adınızı yazın: ilanlarınızda ve mesajlarda bu ad görünecek.
        </p>
      )}
      <section aria-labelledby="profil" className="overflow-hidden rounded-md border border-border bg-card">
        <h2 id="profil" className="border-b border-border px-4 py-2.5 text-[15px] font-bold">
          Profil
        </h2>
        <div className="p-4">
          <ProfileForm name={profile.name} province={profile.province} handle={profile.handle ?? ""} next={next} />
        </div>
      </section>

      <nav aria-label="Kısayollar">
        <ul className="grid gap-2 sm:grid-cols-2">
          {shortcuts.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link href={href} className="flex min-h-12 items-center gap-2.5 rounded-md border border-border bg-card px-3 text-[0.9375rem] font-semibold transition-colors hover:border-primary/40 hover:bg-secondary">
                <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-md bg-secondary text-primary">
                  <Icon weight="fill" className="size-4" />
                </span>
                {label}
              </Link>
            </li>
          ))}
          {(await isAdmin(userId)) && (
            <li>
              <Link href="/yonetim" className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-card px-3 text-[0.9375rem] font-semibold hover:bg-secondary">
                Yönetim paneli: haberler ve şikâyetler
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <section aria-labelledby="guvenlik" className="overflow-hidden rounded-md border border-border bg-card">
        <h2 id="guvenlik" className="border-b border-border px-4 py-2.5 text-[15px] font-bold">
          Giriş ve güvenlik
        </h2>
        <div className="p-4">
          <SecurityControls />
        </div>
      </section>

      <section aria-labelledby="sil" className="rounded-md border border-destructive/30 bg-card p-4">
        <h2 id="sil" className="text-[15px] font-bold">
          Hesabı sil
        </h2>
        <p className="mt-1 text-[0.9375rem] text-muted-foreground">Bu işlem geri alınamaz. Alıcılar ve satıcılarla olan sohbetleriniz de silinir.</p>
        <div className="mt-3">
          <DeleteAccount />
        </div>
      </section>
    </div>
  );
}
