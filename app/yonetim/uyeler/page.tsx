import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MagnifyingGlassIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { MemberActions } from "@/components/admin/MemberActions";
import { Avatar } from "@/components/market/Avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth";
import { MEMBERS_PAGE, listMembers, type MemberFilter } from "@/lib/services/members";
import { monthYear } from "@/lib/tr-time";

export const metadata: Metadata = { title: "Üyeler · Yönetim", robots: { index: false } };

const FILTERS: { id: MemberFilter; label: string }[] = [
  { id: "tumu", label: "Tümü" },
  { id: "gercek", label: "Örnekler hariç" },
  { id: "askida", label: "Askıda" },
];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default function MembersPage({ searchParams }: PageProps<"/yonetim/uyeler">) {
  return (
    <AdminShell section="uyeler" title="Üyeler" intro="Üyeleri arayın; askıya alınan üye okuyabilir ama paylaşım yapamaz. Silme, üyenin her şeyini kalıcı olarak kaldırır.">
      <Suspense fallback={<AdminSkeleton />}>
        <Members searchParams={searchParams} />
      </Suspense>
    </AdminShell>
  );
}

async function Members({ searchParams }: { searchParams: PageProps<"/yonetim/uyeler">["searchParams"] }) {
  const sp = await searchParams;
  const me = await requireAdmin("/yonetim/uyeler");
  const q = one(sp.q).slice(0, 60);
  const filter = (FILTERS.find((f) => f.id === one(sp.durum))?.id ?? "tumu") as MemberFilter;
  const page = Math.min(Math.max(1, Number.parseInt(one(sp.sayfa), 10) || 1), 200);
  const { items, total } = await listMembers(q, filter, page);
  const pages = Math.max(1, Math.ceil(total / MEMBERS_PAGE));
  const href = (over: Record<string, string | number>) => {
    const p = new URLSearchParams({ ...(q && { q }), ...(filter !== "tumu" && { durum: filter }), ...Object.fromEntries(Object.entries(over).map(([k, v]) => [k, String(v)])) });
    if (p.get("sayfa") === "1") p.delete("sayfa");
    return `/yonetim/uyeler${p.size ? `?${p}` : ""}`;
  };

  return (
    <div className="space-y-3 text-[13px]">
      <form role="search" className="flex flex-wrap items-center gap-2">
        <label htmlFor="uye-ara" className="sr-only">
          Üye ara
        </label>
        <div className="relative min-w-0 flex-1 basis-60">
          <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="uye-ara" name="q" defaultValue={q} placeholder="Ad ya da kullanıcı adı" className="h-10 pl-8" />
        </div>
        {filter !== "tumu" && <input type="hidden" name="durum" value={filter} />}
        <Button type="submit" variant="outline">
          Ara
        </Button>
      </form>

      <nav aria-label="Üye süzgeci" className="flex flex-wrap items-center gap-1">
        {FILTERS.map((f) => (
          <Link
            key={f.id}
            href={`/yonetim/uyeler${f.id === "tumu" && !q ? "" : `?${new URLSearchParams({ ...(q && { q }), ...(f.id !== "tumu" && { durum: f.id }) })}`}`}
            aria-current={filter === f.id ? "page" : undefined}
            className="rounded-md border border-border bg-card px-2.5 py-1.5 font-medium text-muted-foreground hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:bg-secondary aria-[current=page]:text-primary"
          >
            {f.label}
          </Link>
        ))}
        <span className="ml-auto font-borsa-mono text-muted-foreground">{total.toLocaleString("tr-TR")} üye</span>
      </nav>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-input bg-card px-4 py-6 text-center">
          <UsersIcon aria-hidden="true" weight="duotone" className="mx-auto size-10 text-primary" />
          <p className="mt-2 text-[15px]">{q ? `“${q}” ile eşleşen üye yok.` : "Bu süzgeçte üye yok."}</p>
          <p className="text-muted-foreground">Adın bir kısmını ya da kullanıcı adını deneyin; Türkçe harfler fark etmez.</p>
          {(q || filter !== "tumu") && (
            <Link href="/yonetim/uyeler" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}>
              Tüm üyeleri göster
            </Link>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
          {items.map((m) => (
            <li key={m.userId} className={`grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start ${m.suspendedAt ? "bg-destructive/5" : ""}`}>
              <div className="flex min-w-0 items-start gap-3">
                <Avatar id={m.userId} name={m.name} photo={m.photo} size={40} />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {m.handle ? (
                      <Link href={`/forum/kisi/${m.handle}`} className="truncate text-[14px] font-semibold text-foreground hover:text-primary hover:underline">
                        {m.name}
                      </Link>
                    ) : (
                      <span className="truncate text-[14px] font-semibold">{m.name}</span>
                    )}
                    {m.handle && <span className="text-muted-foreground">@{m.handle}</span>}
                    {m.userId === me && <span className="rounded bg-secondary px-1.5 text-[11px] font-semibold leading-5 text-primary">Siz</span>}
                    {m.demo && <span className="rounded bg-muted px-1.5 text-[11px] font-semibold leading-5 text-muted-foreground">Örnek</span>}
                    {m.suspendedAt && <span className="rounded bg-destructive px-1.5 text-[11px] font-semibold leading-5 text-white">Askıda</span>}
                  </p>
                  <p className="text-muted-foreground">
                    {monthYear(new Date(m.joinedAt))} üyesi{m.province && ` · ${m.province}`} ·{" "}
                    <span className="font-borsa-mono">
                      {m.topics} konu · {m.replies} yanıt · {m.listings} ilan
                    </span>
                  </p>
                  {m.suspendedAt && m.suspendedReason && <p className="mt-0.5 text-[12px] text-destructive">Neden: {m.suspendedReason}</p>}
                </div>
              </div>
              <div className="sm:w-80 sm:justify-self-end">
                <MemberActions userId={m.userId} name={m.name} suspended={Boolean(m.suspendedAt)} protectedAccount={m.admin || m.userId === me} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Sayfalar" className="flex items-center justify-between">
          {page > 1 ? (
            <Link href={href({ sayfa: page - 1 })} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Önceki
            </Link>
          ) : (
            <span />
          )}
          <span className="font-borsa-mono text-muted-foreground">
            {page} / {pages}
          </span>
          {page < pages ? (
            <Link href={href({ sayfa: page + 1 })} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Sonraki
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
