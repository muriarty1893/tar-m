import Image from "next/image";
import { siteConfig } from "@/config/site";
import { BellIcon, CalendarDotsIcon, CheckIcon, ChatsCircleIcon, HouseIcon, MagnifyingGlassIcon, MegaphoneIcon, NotePencilIcon, SquaresFourIcon, StorefrontIcon, SunIcon, DropIcon } from "@phosphor-icons/react/dist/ssr";
import { roboto } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

// Material 3 tonal palette from a farm green seed.
const M = { primary: "#3b6939", onPrimary: "#ffffff", primaryC: "#bcf0b4", onPrimaryC: "#002204", secC: "#d7e8cd", onSecC: "#121f0e", terC: "#bcebee", onTerC: "#002022", surface: "#f7fbf1", surfC: "#ebefe6", surfCH: "#e5e9df", onSurf: "#181d17", onSurfV: "#424940", outline: "#72796f" };

/** 7 · Material 3 (Android): a search bar as the top app bar, tonal cards, filter chips, a FAB and a navigation bar. */
export function D07Material() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  return (
    <div id="tasarim-onizleme" className={`${roboto.className} min-h-dvh pb-28`} style={{ background: M.surface, color: M.onSurf }}>
      <header className="sticky top-0 z-10 px-4 pb-2 pt-3" style={{ background: M.surface }}>
        <div className="flex h-14 items-center gap-3 rounded-full pl-2 pr-1.5" style={{ background: M.surfCH }}>
          <Image src="/brand/logo.webp" alt="" width={64} height={64} className="size-10" />
          <span className="flex-1 truncate text-[16px]" style={{ color: M.onSurfV }}>{siteConfig.name}’te ara</span>
          <MagnifyingGlassIcon className="size-6" style={{ color: M.onSurfV }} />
          <span className="relative p-1.5">
            <BellIcon className="size-6" style={{ color: M.onSurfV }} />
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ba1a1a] px-1 text-[10px] font-medium text-white">{BADGES.notifications}</span>
          </span>
          <span className="flex size-10 items-center justify-center rounded-full text-[14px] font-medium" style={{ background: M.primary, color: M.onPrimary }}>{USER.initials}</span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 px-2 text-[14px] font-medium" style={{ color: M.onSurfV }}>
          <ChatsCircleIcon className="size-5" /> {BADGES.messages} okunmamış mesaj
        </p>
      </header>

      <div className="space-y-3 px-4">
        <div className="overflow-hidden rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.2),0_2px_6px_rgba(0,0,0,0.08)]" style={{ background: "#fff" }}>
          <div className="flex items-center gap-4 p-4">
            <span className="flex size-14 items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,#1d4ed8,#059669)] text-white"><DropIcon weight="fill" className="size-7" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium tracking-[0.05em]" style={{ color: M.onSurfV }}>Sponsorlu · örnek</p>
              <p className="text-[18px] font-medium">{SPONSOR.name}</p>
              <p className="text-[14px]" style={{ color: M.onSurfV }}>{SPONSOR.tagline}</p>
            </div>
          </div>
          <div className="flex justify-end px-2 pb-2">
            <span className="rounded-full px-3 py-2.5 text-[14px] font-medium" style={{ color: M.primary }}>İncele</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-[12px] border px-4 py-3" style={{ borderColor: M.outline }}>
          <MegaphoneIcon className="size-6" style={{ color: M.onSurfV }} />
          <span className="flex-1 text-[15px]">Reklam vermek için</span>
          <span className="rounded-full px-4 py-2 text-[14px] font-medium" style={{ background: M.secC, color: M.onSecC }}>İletişim</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[16px] p-4" style={{ background: M.primaryC, color: M.onPrimaryC }}>
            <p className="flex items-center justify-between text-[14px] font-medium">{WEATHER.place}<SunIcon weight="fill" className="size-6" /></p>
            <p className="mt-2 text-[45px] leading-none">{WEATHER.temp}°</p>
            <p className="mt-2 text-[13px]">{WEATHER.hint}</p>
          </div>
          <div className="rounded-[16px] p-4" style={{ background: M.terC, color: M.onTerC }}>
            <p className="flex items-center justify-between text-[14px] font-medium">Pazar<StorefrontIcon weight="fill" className="size-6" /></p>
            <p className="mt-2 text-[45px] leading-none">{MARKET.count}</p>
            <p className="mt-2 text-[13px]">ilan · +{MARKET.today} bugün</p>
          </div>
        </div>

        <section className="pt-2">
          <h2 className="text-[22px]">Forum</h2>
          <div className="mt-3 flex gap-2 overflow-hidden text-[14px] font-medium">
            <span className="flex h-8 items-center gap-1.5 rounded-[8px] px-3" style={{ background: M.secC, color: M.onSecC }}><CheckIcon weight="bold" className="size-4" />Son konular</span>
            <span className="flex h-8 items-center rounded-[8px] border px-3" style={{ borderColor: M.outline, color: M.onSurfV }}>Son yanıtlar</span>
            <span className="flex h-8 items-center rounded-[8px] border px-3" style={{ borderColor: M.outline, color: M.onSurfV }}>Popüler</span>
          </div>
          <ul className="mt-2">
            {TOPICS.slice(0, 7).map((t) => (
              <li key={t.title} className="flex items-center gap-4 border-b py-3" style={{ borderColor: M.surfCH }}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full text-[14px] font-medium" style={{ background: M.primaryC, color: M.onPrimaryC }}>{t.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[16px] leading-snug">{t.title}</p>
                  <p className="mt-0.5 text-[14px]" style={{ color: M.onSurfV }}>{t.section} · {t.ago}</p>
                </div>
                <span className="shrink-0 text-[12px] font-medium" style={{ color: M.onSurfV }}>{t.replies} yanıt</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-center py-4">
            <span className="rounded-full px-6 py-2.5 text-[14px] font-medium" style={{ background: M.secC, color: M.onSecC }}>Daha fazla göster</span>
          </div>
        </section>
      </div>

      <span className="fixed bottom-24 right-4 flex h-14 items-center gap-3 rounded-[16px] px-4 text-[15px] font-medium shadow-[0_4px_8px_rgba(0,0,0,0.25)]" style={{ background: M.primaryC, color: M.onPrimaryC }}>
        <NotePencilIcon weight="bold" className="size-6" /> Konu aç
      </span>
      <nav className="fixed inset-x-0 bottom-0 grid h-20 grid-cols-4" style={{ background: M.surfC }}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className="flex flex-col items-center justify-center gap-1 text-[12px] font-medium" style={{ color: i === 0 ? M.onSurf : M.onSurfV }}>
              <span className="flex h-8 w-16 items-center justify-center rounded-full" style={{ background: i === 0 ? M.secC : "transparent" }}>
                <Icon weight={i === 0 ? "fill" : "regular"} className="size-6" />
              </span>
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
