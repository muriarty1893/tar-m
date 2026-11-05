import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ArrowRightIcon, BellIcon, CalendarDotsIcon, CaretDownIcon, ChatCircleTextIcon, ChatsCircleIcon, DropIcon, HouseIcon, MagnifyingGlassIcon, MegaphoneIcon, NotePencilIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { dmSans } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

const glass = "border border-white/70 bg-white/55 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(6,78,59,0.18)]";

/** 4 · Cam (glassmorphism): a soft aurora of greens and blues behind frosted, translucent panels. */
export function D04Cam() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  return (
    <div id="tasarim-onizleme" className={`${dmSans.className} relative min-h-dvh overflow-hidden pb-28 text-[#0b2b22]`}>
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-[#e9f7f1] bg-[radial-gradient(circle_at_10%_0%,#6ee7b7_0,transparent_45%),radial-gradient(circle_at_100%_20%,#93c5fd_0,transparent_40%),radial-gradient(circle_at_30%_70%,#bef264_0,transparent_40%),radial-gradient(circle_at_90%_95%,#5eead4_0,transparent_45%)]" />
      <header className={`sticky top-3 z-10 mx-3 mt-3 flex h-14 items-center gap-2 rounded-2xl px-3 ${glass}`}>
        <Image src="/brand/logo.webp" alt="" width={56} height={56} className="size-8" />
        <span className="flex-1 text-[17px] font-bold">{siteConfig.name}</span>
        <span className="relative flex size-9 items-center justify-center rounded-full bg-white/60">
          <BellIcon weight="duotone" className="size-5" />
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#059669] text-[9px] font-bold text-white">{BADGES.notifications}</span>
        </span>
        <span className="relative flex size-9 items-center justify-center rounded-full bg-white/60">
          <ChatsCircleIcon weight="duotone" className="size-5" />
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#059669] text-[9px] font-bold text-white">{BADGES.messages}</span>
        </span>
        <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#10b981] to-[#0ea5e9] text-[12px] font-bold text-white">{USER.initials}</span>
      </header>

      <div className="space-y-3 px-3 pt-3">
        <div className={`flex h-12 items-center gap-2.5 rounded-2xl px-4 text-[15px] text-[#0b2b22]/50 ${glass}`}>
          <MagnifyingGlassIcon weight="bold" className="size-5" /> Forumda ve Pazar’da ara…
        </div>

        <div className={`flex items-center gap-3 rounded-3xl p-4 ${glass}`}>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#059669] text-white shadow-lg">
            <DropIcon weight="fill" className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#047857]">Sponsor · örnek</p>
            <p className="text-[18px] font-bold leading-tight">{SPONSOR.name}</p>
            <p className="truncate text-[13px] text-[#0b2b22]/70">{SPONSOR.tagline}</p>
          </div>
          <ArrowRightIcon weight="bold" className="size-5 text-[#047857]" />
        </div>

        <div className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 ${glass}`}>
          <MegaphoneIcon weight="duotone" className="size-5 text-[#b45309]" />
          <span className="flex-1 text-[14px] font-semibold">Reklam vermek için</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-[12.5px] font-bold text-[#b45309]">İletişim</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-3xl p-4 ${glass}`}>
            <p className="flex items-center justify-between text-[13px] font-semibold text-[#0b2b22]/70">
              {WEATHER.place} <SunIcon weight="fill" className="size-6 text-[#f59e0b]" />
            </p>
            <p className="mt-1 text-[40px] font-bold leading-none">{WEATHER.temp}°</p>
            <p className="mt-1.5 text-[12.5px] font-semibold text-[#047857]">{WEATHER.hint}</p>
          </div>
          <div className={`rounded-3xl p-4 ${glass}`}>
            <p className="flex items-center justify-between text-[13px] font-semibold text-[#0b2b22]/70">
              Pazar <StorefrontIcon weight="duotone" className="size-6 text-[#be123c]" />
            </p>
            <p className="mt-1 text-[40px] font-bold leading-none">{MARKET.count}</p>
            <p className="mt-1.5 text-[12.5px] font-semibold text-[#0b2b22]/70">ilan · +{MARKET.today} bugün</p>
          </div>
        </div>

        <section className={`rounded-3xl p-4 ${glass}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-bold">Forum</h2>
            <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#059669] to-[#0d9488] px-3.5 py-2 text-[13px] font-bold text-white shadow-md">
              <NotePencilIcon weight="bold" className="size-4" /> Konu aç
            </span>
          </div>
          <div className="mt-3 flex gap-2 text-[13px] font-semibold">
            <span className="rounded-full bg-[#0b2b22] px-3 py-1.5 text-white">Son konular</span>
            <span className="rounded-full bg-white/60 px-3 py-1.5">Son yanıtlar</span>
            <span className="rounded-full bg-white/60 px-3 py-1.5">Popüler</span>
          </div>
          <ul className="mt-2 divide-y divide-white/80">
            {TOPICS.slice(0, 6).map((t) => (
              <li key={t.title} className="flex gap-3 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-[12px] font-bold text-[#047857]">{t.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-snug">{t.title}</p>
                  <p className="mt-0.5 text-[12px] text-[#0b2b22]/60">{t.section} · {t.author} · {t.ago}</p>
                </div>
                <span className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-white/80 px-2 text-[12px] font-bold">
                  <ChatCircleTextIcon weight="bold" className="size-3.5" />
                  {t.replies}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-1 flex items-center justify-center gap-1.5 rounded-2xl bg-white/70 py-3 text-[14px] font-bold">
            Daha fazla göster <CaretDownIcon weight="bold" className="size-4" />
          </p>
        </section>
      </div>

      <nav className={`fixed inset-x-3 bottom-3 grid grid-cols-4 rounded-3xl p-1.5 ${glass}`}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className={`flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10.5px] font-semibold ${i === 0 ? "bg-white/90 text-[#047857] shadow-sm" : "text-[#0b2b22]/60"}`}>
              <Icon weight={i === 0 ? "fill" : "duotone"} className="size-6" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
