import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChatsCircleIcon, NotebookIcon, PlantIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { ProfileForm } from "@/components/account/ProfileForm";
import { DeleteAccount, SecurityControls } from "@/components/account/AccountControls";
import { ensureProfile, isAdmin, requireUserId } from "@/lib/auth";

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
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Suspense fallback={<div aria-hidden="true" className="h-96 rounded-2xl bg-muted motion-safe:animate-pulse" />}>
          <Account searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Account({ searchParams }: { searchParams: PageProps<"/hesabim">["searchParams"] }) {
  const sp = await searchParams;
  const next = typeof sp.devam === "string" && sp.devam.startsWith("/") && !sp.devam.startsWith("//") ? sp.devam : "";
  const userId = await requireUserId("/hesabim");
  const profile = await ensureProfile(userId);

  return (
    <div className="space-y-12">
      {next && !profile.name && (
        <p role="status" className="rounded-2xl border border-gold/30 bg-gold-soft px-4 py-3 text-lg">
          Devam etmeden önce adınızı yazın: ilanlarınızda ve mesajlarda bu ad görünecek.
        </p>
      )}
      <section aria-labelledby="profil">
        <h2 id="profil" className="text-2xl font-bold tracking-tight">
          Profil
        </h2>
        <div className="mt-5">
          <ProfileForm name={profile.name} province={profile.province} next={next} />
        </div>
      </section>

      <nav aria-label="Kısayollar">
        <ul className="grid gap-3 sm:grid-cols-2">
          {shortcuts.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link href={href} className="flex min-h-16 items-center gap-3 rounded-2xl border border-border px-4 font-semibold transition-colors hover:border-primary/40 hover:bg-secondary">
                <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon weight="duotone" className="size-6" />
                </span>
                {label}
              </Link>
            </li>
          ))}
          {(await isAdmin(userId)) && (
            <li>
              <Link href="/yonetim" className="flex min-h-16 items-center gap-3 rounded-2xl border border-border px-4 font-semibold hover:bg-secondary">
                Yönetim paneli: haberler ve şikâyetler
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <section aria-labelledby="guvenlik">
        <h2 id="guvenlik" className="text-2xl font-bold tracking-tight">
          Giriş ve güvenlik
        </h2>
        <div className="mt-5">
          <SecurityControls />
        </div>
      </section>

      <section aria-labelledby="sil" className="rounded-2xl border-2 border-destructive/30 p-5">
        <h2 id="sil" className="text-2xl font-bold tracking-tight">
          Hesabı sil
        </h2>
        <p className="mt-2 text-muted-foreground">Bu işlem geri alınamaz. Alıcılar ve satıcılarla olan sohbetleriniz de silinir.</p>
        <div className="mt-5">
          <DeleteAccount />
        </div>
      </section>
    </div>
  );
}
