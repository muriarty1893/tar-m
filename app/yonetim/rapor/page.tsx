import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ChatCircleDotsIcon,
  ChatsTeardropIcon,
  CheckCircleIcon,
  DeviceMobileIcon,
  EyeIcon,
  FlagIcon,
  MinusIcon,
  SignInIcon,
  StorefrontIcon,
  UserPlusIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { requestNow } from "@/lib/now";
import { weeklyReport, type Pair } from "@/lib/services/weekly-report";
import { count, trend, weekLabel, type Trend } from "@/lib/weekly-report";

export const metadata: Metadata = { title: "Haftalık rapor · Yönetim", robots: { index: false } };

export default function WeeklyReportPage() {
  return (
    <AdminShell section="rapor" title="Haftalık rapor" intro="Son 7 günde sitede neler oldu, bir önceki haftayla karşılaştırmalı. Örnek içerik sayılmaz.">
      <Suspense fallback={<AdminSkeleton />}>
        <Report />
      </Suspense>
    </AdminShell>
  );
}

async function Report() {
  await requireAdmin("/yonetim/rapor");
  const r = await weeklyReport(await requestNow());
  const v = r.visits;

  return (
    <div className="mx-auto max-w-3xl space-y-3 sm:space-y-4">
      <p className="text-[13px] font-semibold text-muted-foreground">{weekLabel(r.week)}</p>

      <Block title="Ziyaretçiler">
        {v ? (
          <>
            <Line Icon={UsersIcon} main={`Siteye ${count(v.visitors.now, "kişi")} girdi.`} pair={v.visitors} />
            <Line Icon={EyeIcon} main={`Toplam ${count(v.pageviews.now, "sayfa")} açıldı.`} pair={v.pageviews} />
            {v.topReferrer && <Line Icon={SignInIcon} main={`En çok buradan geldiler: ${v.topReferrer.label}.`} />}
            {v.phoneShare !== null && <Line Icon={DeviceMobileIcon} main={`Ziyaretçilerin %${v.phoneShare}’i telefondan girdi.`} />}
            {v.topPage && <Line Icon={EyeIcon} main={`En çok bakılan sayfa: ${v.topPage.label}.`} />}
            {v.topTopic && v.topTopic.label !== v.topPage?.label && <Line Icon={ChatsTeardropIcon} main={`En çok okunan konu: ${v.topTopic.label.replace(/^Forum: /, "")}.`} />}
            <More href="/yonetim/istatistikler">Ayrıntılı istatistikler</More>
          </>
        ) : (
          <p className="px-3 py-3 text-[14px] text-muted-foreground">Ziyaretçi sayıları şu anda alınamadı. Aşağıdaki topluluk bilgileri yine günceldir.</p>
        )}
      </Block>

      <Block title="Topluluk">
        <Line Icon={UserPlusIcon} main={r.members.now ? `${count(r.members.now, "yeni üye")} katıldı.` : "Yeni üye katılmadı."} pair={r.members} />
        <Line Icon={ChatsTeardropIcon} main={r.topics.now ? `Forumda ${count(r.topics.now, "yeni konu")} açıldı.` : "Forumda yeni konu açılmadı."} pair={r.topics} />
        <Line Icon={ChatCircleDotsIcon} main={r.replies.now ? `Konulara ${count(r.replies.now, "yanıt")} yazıldı.` : "Konulara yanıt yazılmadı."} pair={r.replies} />
        <Line Icon={StorefrontIcon} main={r.listings.now ? `Pazar’a ${count(r.listings.now, "yeni ilan")} verildi.` : "Pazar’a yeni ilan verilmedi."} pair={r.listings} />
        <Line Icon={ChatCircleDotsIcon} main={r.chats.now ? `İlanlar için ${count(r.chats.now, "yeni mesajlaşma")} başladı.` : "İlanlar için yeni mesajlaşma başlamadı."} pair={r.chats} />
      </Block>

      <Block title="Yapılacaklar">
        {r.openReports ? (
          <>
            <Line Icon={FlagIcon} main={`${count(r.openReports, "şikâyet")} incelenmeyi bekliyor.`} />
            <More href="/yonetim/sikayetler">Şikâyetlere git</More>
          </>
        ) : (
          <Line Icon={CheckCircleIcon} main="Bekleyen şikâyet yok. Yapılacak bir şey yok." />
        )}
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  const id = `rapor-${title.toLocaleLowerCase("tr").replace(/[^a-zğüşıöç]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="overflow-hidden rounded-md border border-border bg-card">
      <h2 id={id} className="border-b border-border px-3 py-2 text-[15px] font-bold">
        {title}
      </h2>
      <ul className="divide-y divide-border">{children}</ul>
    </section>
  );
}

const TREND_ICON: Record<Trend["dir"], Icon> = { up: ArrowUpIcon, down: ArrowDownIcon, same: MinusIcon };

/** One sentence, and how it compares with last week in words (an arrow beside it, never color alone). */
function Line({ Icon, main, pair }: { Icon: Icon; main: string; pair?: Pair }) {
  const t = pair ? trend(pair.now, pair.prev) : null;
  const TrendIcon = t ? TREND_ICON[t.dir] : null;
  return (
    <li className="flex items-start gap-2.5 px-3 py-2.5">
      <Icon aria-hidden="true" weight="duotone" className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[15px] leading-snug">{main}</p>
        {t && TrendIcon && (
          <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted-foreground">
            <TrendIcon aria-hidden="true" weight="bold" className="size-3.5" />
            {t.text}
            {pair && pair.prev > 0 && t.dir !== "same" && <span>(geçen hafta {pair.prev.toLocaleString("tr-TR")})</span>}
          </p>
        )}
      </div>
    </li>
  );
}

function More({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex min-h-11 items-center gap-1.5 px-3 text-[14px] font-semibold text-primary hover:bg-muted/50">
        {children}
        <ArrowRightIcon aria-hidden="true" weight="bold" className="size-4" />
      </Link>
    </li>
  );
}
