import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChartLineUpIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { requestNow } from "@/lib/now";
import { siteStats, type SiteStats, type StatRow } from "@/lib/services/site-stats";
import { STAT_PERIODS, parsePeriod, type StatPeriod } from "@/lib/site-stats";

export const metadata: Metadata = { title: "İstatistikler · Yönetim", robots: { index: false } };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const fmt = (v: number) => v.toLocaleString("tr-TR");

export default function StatsPage({ searchParams }: PageProps<"/yonetim/istatistikler">) {
  return (
    <AdminShell
      section="istatistikler"
      title="İstatistikler"
      intro="Siteye kaç kişinin girdiği, hangi sayfalara baktıkları, nereden ve hangi cihazla geldikleri. Kişiler tanınmaz, çerez kullanılmaz."
    >
      <Suspense fallback={<AdminSkeleton />}>
        <Stats searchParams={searchParams} />
      </Suspense>
    </AdminShell>
  );
}

async function Stats({ searchParams }: { searchParams: PageProps<"/yonetim/istatistikler">["searchParams"] }) {
  const sp = await searchParams;
  await requireAdmin("/yonetim/istatistikler");
  const days = parsePeriod(one(sp.gun));
  const result = await siteStats(days, await requestNow());

  return (
    <div className="space-y-3 sm:space-y-4">
      <PeriodSwitch current={days} />
      {result.ok ? <Dashboard stats={result.stats} days={days} /> : <Unavailable reason={result.reason} />}
      <p className="text-[12.5px] leading-snug text-muted-foreground">
        Rakamlar Vercel Web Analytics’ten gelir ve yaklaşık bir dakika içinde güncellenir. Reklam engelleyici kullananlar sayılmaz. Bir “ziyaretçi”, o gün siteye giren tek bir
        tarayıcıdır; aynı kişi telefondan ve bilgisayardan girerse iki kez sayılır. Günler Türkiye saatiyle değil UTC ile bölünür (gece 00.00–03.00 arası önceki güne yazılır).
      </p>
    </div>
  );
}

function PeriodSwitch({ current }: { current: StatPeriod }) {
  return (
    <nav aria-label="Dönem" className="flex flex-wrap items-center gap-1">
      {STAT_PERIODS.map((d) => (
        <Link
          key={d}
          href={d === 7 ? "/yonetim/istatistikler" : `/yonetim/istatistikler?gun=${d}`}
          aria-current={d === current ? "page" : undefined}
          className="inline-flex min-h-10 items-center rounded-md border border-border bg-card px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:font-semibold aria-[current=page]:text-primary-foreground"
        >
          Son {d} gün
        </Link>
      ))}
    </nav>
  );
}

function Unavailable({ reason }: { reason: "no-token" | "error" }) {
  return (
    <div className="rounded-md border border-dashed border-input bg-card px-4 py-6 text-center">
      <WarningCircleIcon aria-hidden="true" weight="duotone" className="mx-auto size-10 text-primary" />
      {reason === "no-token" ? (
        <>
          <p className="mt-2 text-[15px] font-semibold">İstatistikler henüz bağlanmadı.</p>
          <p className="mx-auto max-w-prose text-[13px] text-muted-foreground">
            Vercel’de bir erişim anahtarı oluşturulup projenin ortam değişkenlerine <code className="font-borsa-mono">VERCEL_ANALYTICS_TOKEN</code> adıyla eklenmeli ve site yeniden
            yayınlanmalı.
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-[15px] font-semibold">İstatistikler şu anda alınamadı.</p>
          <p className="text-[13px] text-muted-foreground">Biraz sonra sayfayı yenileyin. Sürerse erişim anahtarının süresi dolmuş olabilir.</p>
        </>
      )}
    </div>
  );
}

function Dashboard({ stats, days }: { stats: SiteStats; days: StatPeriod }) {
  const perVisitor = stats.visitors ? stats.pageviews / stats.visitors : 0;
  const tiles = [
    { label: "Ziyaretçi", value: fmt(stats.visitors) },
    { label: "Sayfa görüntüleme", value: fmt(stats.pageviews) },
    { label: "Ziyaretçi başına sayfa", value: perVisitor.toLocaleString("tr-TR", { maximumFractionDigits: 1 }) },
  ];
  return (
    <>
      <ul className="grid grid-cols-3 gap-2">
        {tiles.map((t) => (
          <li key={t.label} className="rounded-md border border-border bg-card p-3">
            <span className="block font-borsa-mono text-[22px] font-semibold leading-tight sm:text-[26px]">{t.value}</span>
            <span className="block text-[12.5px] leading-snug text-muted-foreground">{t.label}</span>
          </li>
        ))}
      </ul>

      <DailyChart days={stats.days} period={days} />

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Ranked title="En çok bakılan sayfalar" rows={stats.pages} empty="Bu dönemde sayfa görüntülemesi yok." />
        <Ranked title="Nereden geldiler" rows={stats.referrers} empty="Bu dönemde ziyaret yok." />
        <Ranked title="Ülkeler" rows={stats.countries} empty="Bu dönemde ziyaret yok." />
        <div className="grid gap-3 sm:gap-4">
          <Ranked title="Cihaz" rows={stats.devices} empty="Bu dönemde ziyaret yok." />
          <Ranked title="İşletim sistemi" rows={stats.systems} empty="Bu dönemde ziyaret yok." />
        </div>
      </div>
    </>
  );
}

const dayLabel = (iso: string, long = false) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("tr-TR", { day: "numeric", month: long ? "long" : "short", timeZone: "UTC" });

/** One column per day; the hidden table below carries the same figures for screen readers. */
function DailyChart({ days, period }: { days: SiteStats["days"]; period: StatPeriod }) {
  const max = Math.max(1, ...days.map((d) => d.visitors));
  const best = days.reduce<SiteStats["days"][number] | null>((b, d) => (!b || d.visitors > b.visitors ? d : b), null);
  const mid = days[Math.floor(days.length / 2)];
  return (
    <section aria-labelledby="gunluk" className="rounded-md border border-border bg-card p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 id="gunluk" className="text-[15px] font-bold">
          Günlük ziyaretçi
        </h2>
        {best && best.visitors > 0 && (
          <p className="text-[12.5px] text-muted-foreground">
            En yoğun gün: {dayLabel(best.date, true)}, {fmt(best.visitors)} ziyaretçi
          </p>
        )}
      </div>
      <div aria-hidden="true" className="mt-3">
        <div className="flex h-36 items-end gap-px border-b border-border sm:h-44">
          {days.map((d) => (
            <div key={d.date} className="group relative flex h-full min-w-0 flex-1 items-end" title={`${dayLabel(d.date, true)}: ${fmt(d.visitors)} ziyaretçi, ${fmt(d.pageviews)} görüntüleme`}>
              <div className="w-full rounded-t-[2px] bg-primary/80 transition-colors group-hover:bg-primary" style={{ height: `${d.visitors ? Math.max(3, (d.visitors / max) * 100) : 0}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between font-borsa-mono text-[11.5px] text-muted-foreground">
          <span>{days[0] && dayLabel(days[0].date)}</span>
          {period > 7 && <span>{mid && dayLabel(mid.date)}</span>}
          <span>{days.at(-1) && dayLabel(days.at(-1)!.date)}</span>
        </div>
      </div>
      <table className="sr-only">
        <caption>Son {period} günün günlük ziyaretçi ve görüntüleme sayıları</caption>
        <thead>
          <tr>
            <th scope="col">Gün</th>
            <th scope="col">Ziyaretçi</th>
            <th scope="col">Görüntüleme</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <th scope="row">{dayLabel(d.date, true)}</th>
              <td>{d.visitors}</td>
              <td>{d.pageviews}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** A ranked list with a thin bar behind each row showing its share of the top row. */
function Ranked({ title, rows, empty }: { title: string; rows: StatRow[]; empty: string }) {
  const top = Math.max(1, ...rows.map((r) => r.visitors));
  const total = rows.reduce((s, r) => s + r.visitors, 0);
  const id = `liste-${title.toLocaleLowerCase("tr").replace(/[^a-z0-9ğüşıöç]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-baseline justify-between gap-3 border-b border-border px-3 py-2">
        <h2 id={id} className="text-[15px] font-bold">
          {title}
        </h2>
        <span className="text-[12px] text-muted-foreground">Ziyaretçi</span>
      </div>
      {rows.length ? (
        <ol className="text-[13px]">
          {rows.map((r) => (
            <li key={r.label} className="relative flex items-baseline gap-3 px-3 py-1.5">
              <span aria-hidden="true" className="absolute inset-y-0.5 left-0 rounded-r-[3px] bg-primary/10" style={{ width: `${(r.visitors / top) * 100}%` }} />
              <span className="relative min-w-0 flex-1 truncate" title={r.label}>
                {r.label}
              </span>
              <span className="relative font-borsa-mono text-[12.5px] font-semibold">{fmt(r.visitors)}</span>
              <span className="relative w-10 text-right font-borsa-mono text-[11.5px] text-muted-foreground">{total ? `%${Math.round((r.visitors / total) * 100)}` : ""}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="flex items-center gap-2 px-3 py-4 text-[13px] text-muted-foreground">
          <ChartLineUpIcon aria-hidden="true" className="size-4" />
          {empty}
        </p>
      )}
    </section>
  );
}
