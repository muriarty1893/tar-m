import type { Metadata } from "next";
import { Suspense } from "react";
import { EnvelopeSimpleIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { AdminShell, AdminSkeleton } from "@/components/admin/AdminShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { listSubmissions, sourceSummary, type Submission } from "@/lib/services/submissions";
import { PARTNER_TYPES } from "@/lib/partner-types";
import { WELCOME_SOURCES } from "@/lib/welcome";
import { agoLabel } from "@/lib/tr-time";
import { requestNow } from "@/lib/now";
import { siteConfig } from "@/config/site";
import { markSubmission, removeSubmission } from "../actions";

export const metadata: Metadata = { title: "Başvurular · Yönetim", robots: { index: false } };

export default function SubmissionsPage() {
  return (
    <AdminShell
      section="basvurular"
      title="Başvurular"
      intro="Sitedeki formlardan gelenler: İş birliği formu, “Sorunuz mu var?” soruları ve ilk ziyaretteki “Bizi nereden duydunuz?” cevapları. Okunmamışlar üstte."
    >
      <Suspense fallback={<AdminSkeleton />}>
        <h2 className="mb-2 text-[15px] font-bold">İş birliği</h2>
        <Messages kind="partner" />
        <h2 id="sorular" className="mb-2 mt-5 scroll-mt-24 text-[15px] font-bold">Sorular</h2>
        <Messages kind="question" />
        <h2 id="kaynak" className="mb-2 mt-5 scroll-mt-24 text-[15px] font-bold">Bizi nereden duydunuz?</h2>
        <Sources />
      </Suspense>
    </AdminShell>
  );
}

const empty = "rounded-md border border-border bg-card px-4 py-3 text-[0.9375rem] text-muted-foreground";

async function Messages({ kind }: { kind: "partner" | "question" }) {
  await requireAdmin("/yonetim/basvurular");
  const [rows, now] = await Promise.all([listSubmissions(kind), requestNow()]);
  if (!rows.length) return <p className={empty}>Henüz {kind === "partner" ? "iş birliği mesajı" : "soru"} yok.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((s) => (
        <MessageCard key={s.id} s={s} now={now} />
      ))}
    </ul>
  );
}

function MessageCard({ s, now }: { s: Submission; now: Date }) {
  const d = s.data;
  const partner = s.kind === "partner";
  const text = partner ? d.message : d.question;
  const subject = partner ? `${siteConfig.name} iş birliği` : `${siteConfig.name}: sorunuz hakkında`;
  return (
    <li className={`rounded-lg border bg-card p-4 ${s.read ? "border-border" : "border-primary/50 shadow-[inset_3px_0_0_var(--primary)]"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-base font-bold">
          {!s.read && <span className="mr-2 rounded bg-primary px-1.5 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wide text-primary-foreground">Yeni</span>}
          {d.name || "Adsız"}
          {partner && d.organization && <span className="font-normal text-muted-foreground"> · {d.organization}</span>}
        </p>
        <time dateTime={s.createdAt} className="text-muted-foreground">
          {agoLabel(new Date(s.createdAt), now)}
        </time>
      </div>
      {partner && d.type && <p className="mt-0.5 text-muted-foreground">{PARTNER_TYPES[d.type as keyof typeof PARTNER_TYPES] ?? d.type}</p>}
      {text && <p className="mt-3 whitespace-pre-line">{text}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.9375rem]">
        {d.email && (
          <a href={`mailto:${d.email}`} className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline">
            <EnvelopeSimpleIcon aria-hidden="true" weight="duotone" className="size-4" />
            {d.email}
          </a>
        )}
        {d.phone && (
          <a href={`tel:${d.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline">
            <PhoneIcon aria-hidden="true" weight="duotone" className="size-4" />
            {d.phone}
          </a>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {d.email && (
          <a href={`mailto:${d.email}?subject=${encodeURIComponent(subject)}`} className={buttonVariants()}>
            E-postayla yanıtla
          </a>
        )}
        <form action={markSubmission.bind(null, s.id, !s.read)}>
          <Button type="submit" variant="outline">
            {s.read ? "Okunmadı yap" : "Okundu"}
          </Button>
        </form>
        <form action={removeSubmission.bind(null, s.id)}>
          <Button type="submit" variant="outline" className="text-destructive">
            Sil
          </Button>
        </form>
      </div>
    </li>
  );
}

async function Sources() {
  await requireAdmin("/yonetim/basvurular");
  const [{ counts, others, total }, now] = await Promise.all([sourceSummary(), requestNow()]);
  if (!total) return <p className={empty}>Henüz cevap yok.</p>;
  const rows = WELCOME_SOURCES.map((s) => ({ label: s.label, n: counts[s.id] ?? 0 })).sort((a, b) => b.n - a.n);
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="mb-3 text-muted-foreground">{total.toLocaleString("tr-TR")} cevap</p>
      <ul className="space-y-2">
        {rows.map(({ label, n }) => (
          <li key={label} className="grid grid-cols-[minmax(0,11rem)_1fr_3.5rem] items-center gap-3">
            <span>{label}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.round((n / total) * 100)}%` }} />
            </span>
            <span className="text-right font-borsa-mono tabular-nums">
              {n} <span className="text-muted-foreground">%{Math.round((n / total) * 100)}</span>
            </span>
          </li>
        ))}
      </ul>
      {others.length > 0 && (
        <>
          <h3 className="mb-1 mt-4 font-bold">“Diğer” diyenler</h3>
          <ul className="space-y-1">
            {others.map((o, i) => (
              <li key={i}>
                “{o.text}” <span className="text-muted-foreground">· {agoLabel(new Date(o.createdAt), now)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
