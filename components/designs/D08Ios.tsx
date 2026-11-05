import Image from "next/image";
import { siteConfig } from "@/config/site";
import { BellIcon, CalendarDotsIcon, CaretRightIcon, ChatsCircleIcon, DropIcon, HouseIcon, MagnifyingGlassIcon, MegaphoneIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { inter } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

const TINT = "#1f7a3a";
const sys = { fontFamily: `-apple-system, "SF Pro Text", "SF Pro Display", var(--font-inter), system-ui, sans-serif` };

/** 8 · iOS (Apple): a large title, grouped inset lists, widgets, a segmented control and a translucent tab bar. */
export function D08Ios() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  return (
    <div id="tasarim-onizleme" style={sys} className={`${inter.variable} min-h-dvh bg-[#f2f2f7] pb-24 text-black`}>
      <header className="sticky top-0 z-10 flex h-11 items-center gap-1 bg-[#f2f2f7]/90 px-4 backdrop-blur-xl" style={{ color: TINT }}>
        <Image src="/brand/logo.webp" alt="" width={56} height={56} className="size-7" />
        <span className="flex-1 text-[15px] font-semibold text-black">{siteConfig.name}</span>
        <span className="relative p-1.5"><BellIcon weight="regular" className="size-6" /><span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-[#ff3b30] text-[10px] font-semibold text-white">{BADGES.notifications}</span></span>
        <span className="relative p-1.5"><ChatsCircleIcon weight="regular" className="size-6" /><span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-[#ff3b30] text-[10px] font-semibold text-white">{BADGES.messages}</span></span>
        <span className="ml-1 flex size-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#a7a7ad,#86868c)] text-[12px] font-semibold text-white">{USER.initials}</span>
      </header>
      <div className="px-4">
        <h1 className="pb-2 pt-1 text-[34px] font-bold tracking-tight">Ana Sayfa</h1>
        <div className="flex h-9 items-center gap-1.5 rounded-[10px] bg-[#e3e3e8] px-2 text-[17px] text-[#8e8e93]">
          <MagnifyingGlassIcon weight="bold" className="size-4" /> Ara
        </div>

        <p className="mt-5 px-4 text-[13px] uppercase text-[#6d6d72]">Sponsorlu · örnek</p>
        <div className="mt-1.5 overflow-hidden rounded-[10px] bg-white">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex size-12 items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,#1d4ed8,#059669)] text-white"><DropIcon weight="fill" className="size-6" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-semibold">{SPONSOR.name}</p>
              <p className="truncate text-[13px] text-[#8e8e93]">{SPONSOR.tagline}</p>
            </div>
            <span className="rounded-full bg-[#eef0f3] px-4 py-1 text-[15px] font-bold" style={{ color: TINT }}>AÇ</span>
          </div>
          <div className="ml-[72px] h-px bg-[#c6c6c8]" />
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span className="flex size-[29px] items-center justify-center rounded-[7px] bg-[#ff9500] text-white"><MegaphoneIcon weight="fill" className="size-4" /></span>
            <span className="flex-1 text-[17px]">Reklam vermek için</span>
            <span className="text-[17px] text-[#8e8e93]">İletişim</span>
            <CaretRightIcon weight="bold" className="size-4 text-[#c4c4c6]" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="aspect-square rounded-[22px] bg-[linear-gradient(180deg,#4aa3ff,#2b6fd6)] p-3.5 text-white shadow-sm">
            <p className="text-[15px] font-semibold">{WEATHER.place}</p>
            <p className="text-[42px] font-light leading-none">{WEATHER.temp}°</p>
            <SunIcon weight="fill" className="mt-3 size-5 text-[#ffd60a]" />
            <p className="text-[13px] font-semibold">{WEATHER.sky}</p>
            <p className="text-[13px] text-white/85">Y:{WEATHER.max}° D:{WEATHER.min}°</p>
          </div>
          <div className="flex aspect-square flex-col rounded-[22px] bg-white p-3.5 shadow-sm">
            <span className="flex size-8 items-center justify-center rounded-[8px] bg-[#ff2d55] text-white"><StorefrontIcon weight="fill" className="size-5" /></span>
            <p className="mt-auto text-[13px] font-semibold text-[#8e8e93]">PAZAR</p>
            <p className="text-[34px] font-bold leading-none">{MARKET.count}</p>
            <p className="text-[13px] text-[#8e8e93]">ilan · {MARKET.today} yeni</p>
          </div>
        </div>

        <div className="mt-7 flex items-end justify-between">
          <h2 className="text-[22px] font-bold">Forum</h2>
          <span className="text-[17px]" style={{ color: TINT }}>Konu Aç</span>
        </div>
        <div className="mt-2 grid grid-cols-3 rounded-[9px] bg-[#e3e3e8] p-0.5 text-center text-[13px] font-medium">
          <span className="rounded-[7px] bg-white py-1 shadow-[0_3px_8px_rgba(0,0,0,0.12)]">Son Konular</span>
          <span className="py-1">Son Yanıtlar</span>
          <span className="py-1">Popüler</span>
        </div>
        <ul className="mt-3 overflow-hidden rounded-[10px] bg-white">
          {TOPICS.slice(0, 7).map((t, i) => (
            <li key={t.title}>
              {i > 0 && <div className="ml-[64px] h-px bg-[#c6c6c8]" />}
              <div className="flex items-center gap-3 px-4 py-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#a7a7ad,#86868c)] text-[13px] font-semibold text-white">{t.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[16px] font-semibold leading-snug">{t.title}</p>
                  <p className="text-[13px] text-[#8e8e93]">{t.section} · {t.ago}</p>
                </div>
                <span className="text-[15px] text-[#8e8e93]">{t.replies}</span>
                <CaretRightIcon weight="bold" className="size-4 shrink-0 text-[#c4c4c6]" />
              </div>
            </li>
          ))}
          <li>
            <div className="h-px bg-[#c6c6c8]" />
            <p className="py-3 text-center text-[17px]" style={{ color: TINT }}>Daha Fazla Göster</p>
          </li>
        </ul>
      </div>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t border-black/15 bg-[#f9f9f9]/90 pb-5 pt-1.5 backdrop-blur-xl">
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className="flex flex-col items-center gap-0.5 text-[10px] font-medium" style={{ color: i === 0 ? TINT : "#8e8e93" }}>
              <Icon weight={i === 0 ? "fill" : "regular"} className="size-7" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
