"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  GrainsIcon,
  HeartIcon,
  MapPinIcon,
  PlantIcon,
  SealCheckIcon,
  ShieldCheckIcon,
  ShovelIcon,
  StarIcon,
  StorefrontIcon,
  TractorIcon,
  WarningIcon,
  WarningOctagonIcon,
  WrenchIcon,
} from "@phosphor-icons/react/dist/ssr";
import { HEALTH, type Health } from "@/data/demo-fields";
import { ME, conditionLabel, formatPrice, type CategoryId, type Listing, type ListingStatus, type Seller } from "@/data/demo-market";
import { agoLabel } from "@/lib/demo-clock";

/** Shared pieces of the demo phone's screens, drawn like the mobile app's (mobile/src/components). */

export type PhosphorIcon = typeof HeartIcon;

export const scroll = "h-full overflow-y-auto overscroll-contain [scrollbar-width:none]";
export const enter = "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500";
export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const CATEGORY_ICONS: Record<CategoryId, PhosphorIcon> = {
  tumu: StorefrontIcon,
  urun: GrainsIcon,
  tohum: PlantIcon,
  alet: ShovelIcon,
  ekipman: WrenchIcon,
  arac: TractorIcon,
};

/** A stack screen's top row: back, the title (with a line under it), and an optional action. */
export function BackBar({ title, subtitle, onBack, backLabel = "Geri", right }: { title: string; subtitle?: string; onBack: () => void; backLabel?: string; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-card transition-colors duration-150 hover:bg-secondary ${focusRing}`}
      >
        <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-5" />
      </button>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-[20px] font-extrabold leading-tight">{title}</span>
        {subtitle && <span className="block truncate text-[12px] text-muted-foreground">{subtitle}</span>}
      </span>
      {right}
    </div>
  );
}

const AVATAR_TONES = ["bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-800", "bg-sky-100 text-sky-800", "bg-violet-100 text-violet-800", "bg-orange-100 text-orange-800"];

/** A person's initials in a tinted circle (no photos of real people). */
export function Avatar({ seller, size = 40 }: { seller: Pick<Seller, "id" | "name">; size?: number }) {
  const tone = AVATAR_TONES[[...seller.id].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  const initials = seller.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full font-heading font-extrabold ${tone}`} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </span>
  );
}

/** "★ 4,8 (31)" */
export function Rating({ seller }: { seller: Pick<Seller, "rating" | "reviews"> }) {
  const r = seller.rating.toFixed(1).replace(".", ",");
  return (
    <span className="flex items-center gap-1 text-[12px]" aria-label={`5 üzerinden ${r} puan, ${seller.reviews} değerlendirme`}>
      <StarIcon aria-hidden="true" weight="fill" className="size-3.5 text-gold" />
      <span aria-hidden="true" className="font-semibold">{r}</span>
      <span aria-hidden="true" className="text-muted-foreground">({seller.reviews})</span>
    </span>
  );
}

/** The market's standing safety reminder. */
export function SafetyStrip() {
  return (
    <p className="flex items-center gap-2 rounded-[16px] bg-gold-soft px-3 py-2.5 text-[12.5px] leading-snug">
      <ShieldCheckIcon aria-hidden="true" weight="duotone" className="size-5 shrink-0 text-gold" />
      <span>
        <b>Güvenli alışveriş:</b> Ürünü görmeden kapora ya da ödeme göndermeyin.
      </span>
    </p>
  );
}

/** A listing in the grid: photo with a heart, price, title, and place · time. */
export function ListingCard({ listing: l, favorite, status, now, onOpen, onFavorite }: { listing: Listing; favorite: boolean; status?: ListingStatus; now: Date; onOpen: () => void; onFavorite: () => void }) {
  const when = agoLabel(new Date(l.postedAt), now);
  const condition = conditionLabel(l.condition);
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-border bg-card shadow-soft">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${l.title}. ${formatPrice(l.price)}${l.unit ? ` ${l.unit} başına` : ""}. ${l.location}, ${when}${status === "sold" ? ". Satıldı" : ""}`}
        className={`block w-full cursor-pointer text-left transition-opacity duration-150 hover:opacity-90 ${focusRing}`}
      >
        <span className="relative block aspect-[4/3] bg-muted">
          <Image src={l.photos[0]} alt="" fill sizes="160px" className="object-cover" />
          {condition && <span className="absolute left-1.5 top-1.5 rounded-full bg-white/95 px-1.5 py-px text-[10.5px] font-semibold">{condition}</span>}
          {l.stockPhoto && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-1.5 py-px text-[10px] font-medium text-white">Temsilî görsel</span>}
          {status === "sold" && <span className="absolute inset-0 flex items-center justify-center bg-black/45 font-heading text-[14px] font-extrabold tracking-[0.15em] text-white">SATILDI</span>}
        </span>
        <span className="block px-2 pb-2 pt-1.5">
          <span className="block truncate font-heading text-[14px] font-extrabold">
            {formatPrice(l.price)}
            {l.unit && <span className="text-[11px] font-medium text-muted-foreground"> / {l.unit}</span>}
          </span>
          <span className="line-clamp-2 min-h-[2lh] text-[12px] font-medium leading-snug">{l.title}</span>
          <span className="mt-0.5 flex items-center gap-0.5 text-[10.5px] text-muted-foreground">
            <MapPinIcon aria-hidden="true" weight="fill" className="size-3 shrink-0" />
            <span className="truncate">
              {l.location.split(",")[0]} · {when}
            </span>
          </span>
        </span>
      </button>
      {l.sellerId !== ME.id && (
        <button
          type="button"
          onClick={onFavorite}
          aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          aria-pressed={favorite}
          className={`absolute right-1 top-1 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/95 transition-transform duration-150 active:scale-90 ${focusRing}`}
        >
          <HeartIcon aria-hidden="true" weight={favorite ? "fill" : "bold"} className={`size-4 ${favorite ? "text-destructive" : "text-foreground"}`} />
        </button>
      )}
    </div>
  );
}

/** Each health level has its own icon and word, so it never rests on colour alone. */
export const HEALTH_STYLE: Record<Health, { Icon: PhosphorIcon; badge: string; fill: string; line: string; bar: string }> = {
  saglikli: { Icon: SealCheckIcon, badge: "bg-secondary text-primary", fill: "rgb(34 197 94 / 0.28)", line: "#86efac", bar: "bg-primary" },
  izlenmeli: { Icon: WarningIcon, badge: "bg-gold-soft text-gold", fill: "rgb(250 204 21 / 0.32)", line: "#facc15", bar: "bg-gold" },
  riskli: { Icon: WarningOctagonIcon, badge: "bg-destructive/10 text-destructive", fill: "rgb(239 68 68 / 0.32)", line: "#f87171", bar: "bg-destructive" },
};

export function HealthBadge({ health }: { health: Health }) {
  const { Icon, badge } = HEALTH_STYLE[health];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[11px] font-bold ${badge}`}>
      <Icon aria-hidden="true" weight="fill" className="size-3.5" />
      {HEALTH[health].label}
    </span>
  );
}

const toneClass = (change: number) => (change > 0 ? "text-primary" : change < 0 ? "text-destructive" : "text-muted-foreground");

/** A price's last six weeks as a tiny line (decorative: the pill says it in words). */
export function Sparkline({ line, change }: { line: number[]; change: number }) {
  const step = 40 / (line.length - 1);
  return (
    <svg viewBox="0 0 40 16" aria-hidden="true" className={`h-4 w-10 shrink-0 ${toneClass(change)}`}>
      <polyline points={line.map((y, i) => `${i * step},${y}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "+%2,1" with an arrow; "%0,0" with no arrow when the price didn't move. */
export function ChangePill({ change }: { change: number }) {
  const bg = change > 0 ? "bg-secondary" : change < 0 ? "bg-destructive/10" : "bg-muted";
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${bg} ${toneClass(change)}`}>
      {change > 0 ? <ArrowUpIcon aria-hidden="true" weight="bold" className="size-3" /> : change < 0 ? <ArrowDownIcon aria-hidden="true" weight="bold" className="size-3" /> : null}
      {change > 0 ? "+" : change < 0 ? "−" : ""}%{Math.abs(change).toFixed(1).replace(".", ",")}
    </span>
  );
}

/** A segmented switch ("Keşfet / Favoriler / İlanlarım"). */
export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string; badge?: number }[]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          aria-label={o.badge ? `${o.label}, ${o.badge} okunmamış` : undefined}
          onClick={() => onChange(o.id)}
          className={`flex h-8 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full text-[12.5px] font-semibold transition-colors duration-150 ${focusRing} ${value === o.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {o.label}
          {o.badge ? (
            <span aria-hidden="true" className={`min-w-4 rounded-full px-1 text-[10px] font-bold leading-4 ${value === o.id ? "bg-white text-primary" : "bg-destructive text-white"}`}>
              {o.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/** A sheet over the phone's screen (the app's dialogs): a scrim, then a card from the bottom. */
export function Sheet({ title, description, onClose, children }: { title: string; description?: ReactNode; onClose: () => void; children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button type="button" aria-label="Kapat" onClick={onClose} className="absolute inset-0 cursor-default bg-black/40 motion-safe:animate-in motion-safe:fade-in" />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative rounded-t-[26px] bg-card px-4 pb-9 pt-4 shadow-lift motion-safe:animate-in motion-safe:slide-in-from-bottom-8 motion-safe:duration-300">
        <p className="font-heading text-[19px] font-extrabold">{title}</p>
        {description && <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{description}</p>}
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
