import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ArrowDownIcon, ArrowRightIcon, BellIcon, CalendarDotsIcon, ChatsCircleIcon, HouseIcon, MagnifyingGlassIcon, SquaresFourIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { inter } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

/** 1 · Sade (Swiss minimal): white, black type, one green; hairlines instead of boxes, numbers set large. */
export function D01Sade() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  return (
    <div id="tasarim-onizleme" className={`${inter.className} min-h-dvh bg-white pb-20 text-[#111]`}>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-black/10 bg-white/95 px-4 backdrop-blur">
        <Image src="/brand/logo.webp" alt="" width={56} height={56} className="size-7" />
        <span className="flex-1 text-[17px] font-semibold tracking-tight">{siteConfig.name}</span>
        <span className="relative p-2">
          <BellIcon weight="light" className="size-6" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#0b7a3b]" />
        </span>
        <span className="relative p-2">
          <ChatsCircleIcon weight="light" className="size-6" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#0b7a3b]" />
        </span>
        <span className="ml-1 flex size-8 items-center justify-center rounded-full bg-[#111] text-[12px] font-semibold text-white">{USER.initials}</span>
      </header>

      <div className="flex items-center gap-3 border-b border-black/10 px-4 py-3 text-[15px] text-black/45">
        <MagnifyingGlassIcon weight="light" className="size-5" />
        Forumda ve Pazar’da ara
      </div>

      <div className="flex items-center gap-3 border-b border-black/10 px-4 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/45">
            Sponsor <span className="ml-1 border border-black/30 px-1 tracking-[0.1em]">Örnek</span>
          </p>
          <p className="mt-1 text-[19px] font-semibold tracking-tight">{SPONSOR.name}</p>
          <p className="text-[14px] text-black/60">{SPONSOR.tagline}</p>
        </div>
        <ArrowRightIcon weight="light" className="size-6" />
      </div>
      <p className="border-b border-black/10 px-4 py-3 text-[14px] text-black/60">
        Bu alanda reklamınız olabilir. <span className="font-semibold text-[#111] underline underline-offset-4">İletişim</span>
      </p>

      <div className="grid grid-cols-2 border-b border-black/10">
        <div className="border-r border-black/10 px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/45">{WEATHER.place}</p>
          <p className="mt-1 text-[44px] font-light leading-none tracking-tighter">{WEATHER.temp}°</p>
          <p className="mt-2 text-[13px] text-black/60">{WEATHER.sky} · <span className="text-[#0b7a3b]">{WEATHER.hint}</span></p>
        </div>
        <div className="px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/45">Pazar</p>
          <p className="mt-1 text-[44px] font-light leading-none tracking-tighter">{MARKET.count}</p>
          <p className="mt-2 text-[13px] text-black/60">ilan · bugün +{MARKET.today}</p>
        </div>
      </div>

      <section className="px-4 pt-7">
        <div className="flex items-end justify-between">
          <h2 className="text-[30px] font-semibold leading-none tracking-tight">Forum</h2>
          <span className="rounded-full bg-[#0b7a3b] px-3.5 py-1.5 text-[13px] font-semibold text-white">Konu aç</span>
        </div>
        <div className="mt-5 flex gap-5 border-b border-black/10 text-[14px]">
          <span className="-mb-px border-b-2 border-[#111] pb-2 font-semibold">Son konular</span>
          <span className="pb-2 text-black/45">Son yanıtlar</span>
          <span className="pb-2 text-black/45">Popüler</span>
        </div>
        <ol>
          {TOPICS.slice(0, 7).map((t, i) => (
            <li key={t.title} className="flex gap-4 border-b border-black/10 py-4">
              <span className="w-6 shrink-0 pt-0.5 text-[13px] tabular-nums text-black/35">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-medium leading-snug">{t.title}</p>
                <p className="mt-1.5 text-[12.5px] text-black/45">
                  {t.section} — {t.author} — {t.ago}
                </p>
              </div>
              <span className="shrink-0 pt-0.5 text-[13px] tabular-nums text-black/60">{t.replies}</span>
            </li>
          ))}
        </ol>
        <p className="flex items-center justify-center gap-2 py-5 text-[14px] font-semibold">
          Daha fazla göster <ArrowDownIcon weight="bold" className="size-4" />
        </p>
      </section>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t border-black/10 bg-white">
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className={`relative flex flex-col items-center gap-1 pb-3 pt-2.5 text-[11px] ${i === 0 ? "font-semibold text-[#111]" : "text-black/40"}`}>
              {i === 0 && <span className="absolute inset-x-6 top-0 h-0.5 bg-[#0b7a3b]" />}
              <Icon weight="light" className="size-6" />
              {label}
            </span>
          );
        })}
      </nav>
      <span className="sr-only">{BADGES.notifications} bildirim</span>
    </div>
  );
}
