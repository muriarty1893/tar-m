import Image from "next/image";
import { siteConfig } from "@/config/site";
import { BellIcon, CalendarDotsIcon, CaretDownIcon, ChatCircleTextIcon, ChatsCircleIcon, DropIcon, HouseIcon, MagnifyingGlassIcon, MegaphoneIcon, PlusIcon, SquaresFourIcon, StorefrontIcon, SunIcon, WindIcon } from "@phosphor-icons/react/dist/ssr";
import { nunitoSans, varelaRound } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

// Soft UI Evolution (ui-ux-pro-max): one soft surface, light from the top left; raised and pressed shapes, with clearer contrast
// than classic neumorphism (dark slate text, a thin white rim, one green accent).
const C = { bg: "#e6ebf1", text: "#243040", muted: "#4e5c6c", green: "#0d7a52", greenSoft: "#d3eee2" };
const RAISED = "bg-[#e6ebf1] shadow-[7px_7px_14px_#c3cad3,-7px_-7px_14px_#ffffff] ring-1 ring-white/60";
const RAISED_SM = "bg-[#e6ebf1] shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] ring-1 ring-white/60";
const PRESSED = "bg-[#e6ebf1] shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff]";

/** 14 · Yumuşak (soft UI): everything on one soft grey surface, raised or pressed in; calm, tactile, one green accent. */
export function D14Yumusak() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  const round = varelaRound.className;
  // The dial: where today's temperature sits between the day's low and high.
  const pct = Math.round(((WEATHER.temp - WEATHER.min) / (WEATHER.max - WEATHER.min)) * 100);
  return (
    <div id="tasarim-onizleme" className={`${nunitoSans.className} min-h-dvh px-4 pb-28`} style={{ background: C.bg, color: C.text }}>
      <header className="flex items-center gap-3 pb-4 pt-5">
        <span className={`flex size-12 items-center justify-center rounded-2xl ${RAISED_SM}`}>
          <Image src="/brand/logo.webp" alt="" width={64} height={64} className="size-8" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className={`${round} text-[19px]`}>{siteConfig.name}</p>
          <p className="text-[13px]" style={{ color: C.muted }}>Merhaba {USER.first}</p>
        </div>
        {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
          <span key={i} className={`relative flex size-11 items-center justify-center rounded-full ${RAISED_SM}`}>
            <Icon weight="bold" className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: C.green }}>{i ? BADGES.messages : BADGES.notifications}</span>
          </span>
        ))}
      </header>

      <div className={`flex h-12 items-center gap-2.5 rounded-full px-5 text-[15px] ${PRESSED}`} style={{ color: C.muted }}>
        <MagnifyingGlassIcon weight="bold" className="size-5" />
        Forumda ve Pazar’da ara…
      </div>

      <div className={`mt-5 flex items-center gap-3 rounded-[24px] p-4 ${PRESSED}`}>
        <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${RAISED_SM}`}><DropIcon weight="fill" className="size-6 text-[#1f6fb2]" /></span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Sponsor · örnek</p>
          <p className={`${round} text-[18px]`}>{SPONSOR.name}</p>
          <p className="text-[13px]" style={{ color: C.muted }}>{SPONSOR.tagline}</p>
        </div>
      </div>

      <div className={`mt-5 flex items-center gap-3 rounded-[22px] px-4 py-3 ${RAISED}`}>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${PRESSED}`}><MegaphoneIcon weight="duotone" className="size-5 text-[#b45309]" /></span>
        <p className="flex-1 text-[15px] font-bold">Reklam vermek için</p>
        <p className="text-[13px] font-semibold text-[#9a4a06]">İletişim →</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className={`flex flex-col items-center rounded-[24px] p-4 text-center ${RAISED}`}>
          <div className={`relative flex size-[96px] shrink-0 items-center justify-center rounded-full ${RAISED_SM}`}>
            <div className="absolute inset-1.5 rounded-full" style={{ background: `conic-gradient(${C.green} 0 ${pct}%, #cfd6df ${pct}% 100%)` }} />
            <div className={`relative flex size-[66px] flex-col items-center justify-center rounded-full ${PRESSED}`}>
              <span className={`${round} text-[25px] leading-none`}>{WEATHER.temp}°</span>
              <span className="text-[10.5px] font-semibold" style={{ color: C.muted }}>{WEATHER.min}°–{WEATHER.max}°</span>
            </div>
          </div>
          <p className="mt-2.5 flex items-center gap-1 text-[12.5px] font-bold uppercase tracking-wider" style={{ color: C.muted }}><SunIcon weight="fill" className="size-4 text-[#e39a00]" /> {WEATHER.place}</p>
          <p className={`${round} text-[16px]`}>{WEATHER.sky}</p>
          <p className="mt-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={{ background: C.greenSoft, color: C.green }}>{WEATHER.hint}</p>
          <p className="mt-1.5 flex gap-2.5 text-[12px] font-semibold" style={{ color: C.muted }}>
            <span className="flex items-center gap-0.5"><DropIcon weight="fill" className="size-3.5" />%{WEATHER.rain}</span>
            <span className="flex items-center gap-0.5"><WindIcon weight="bold" className="size-3.5" />{WEATHER.wind} km/s</span>
          </p>
        </div>
        <div className={`flex flex-col rounded-[24px] p-4 ${RAISED}`}>
          <span className={`flex size-11 items-center justify-center rounded-2xl ${PRESSED}`}><StorefrontIcon weight="duotone" className="size-6" style={{ color: C.green }} /></span>
          <p className="mt-3 text-[13px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>Pazar</p>
          <p className={`${round} text-[34px] leading-none`}>{MARKET.count}</p>
          <p className="mt-1 text-[13px] font-semibold" style={{ color: C.muted }}>ilan · +{MARKET.today} bugün</p>
          <p className={`mt-auto rounded-xl px-2.5 py-2 text-[12px] font-semibold leading-snug ${PRESSED}`} style={{ color: C.muted }}>
            Yeni: <span style={{ color: C.text }}>{MARKET.newest.title}</span>
          </p>
        </div>
      </div>

      <section className="mt-7">
        <div className="flex items-center justify-between">
          <h2 className={`${round} text-[22px]`}>Forum</h2>
          <span className={`flex size-11 items-center justify-center rounded-full ${RAISED_SM}`} style={{ color: C.green }}><PlusIcon weight="bold" className="size-5" /></span>
        </div>
        <div className={`mt-3 grid grid-cols-3 rounded-full p-1.5 text-center text-[13px] font-bold ${PRESSED}`}>
          <span className={`rounded-full py-2 ${RAISED_SM}`} style={{ color: C.green }}>Son konular</span>
          <span className="py-2" style={{ color: C.muted }}>Son yanıtlar</span>
          <span className="py-2" style={{ color: C.muted }}>Popüler</span>
        </div>
        <ul className="mt-4 space-y-3.5">
          {TOPICS.slice(0, 6).map((t) => (
            <li key={t.title} className={`flex items-center gap-3 rounded-[20px] p-3 ${RAISED}`}>
              {t.photo ? (
                <span className={`shrink-0 rounded-2xl p-1 ${PRESSED}`}><Image src={t.photo} alt="" width={96} height={96} className="size-12 rounded-xl object-cover" /></span>
              ) : (
                <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl text-[14px] font-bold ${PRESSED}`} style={{ color: C.green }}>{t.initials}</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[14.5px] font-bold leading-snug">{t.title}</p>
                <p className="mt-0.5 text-[12.5px]" style={{ color: C.muted }}>{t.section} · {t.ago}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-[12.5px] font-bold" style={{ color: C.muted }}><ChatCircleTextIcon weight="bold" className="size-4" />{t.replies}</span>
            </li>
          ))}
        </ul>
        <p className={`mt-5 flex min-h-12 items-center justify-center gap-1.5 rounded-full text-[14.5px] font-bold ${RAISED}`}>
          Daha fazla göster <CaretDownIcon weight="bold" className="size-4" />
        </p>
      </section>

      <nav className={`fixed inset-x-4 bottom-4 grid grid-cols-4 gap-1 rounded-[26px] p-2 ${RAISED}`}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className={`flex flex-col items-center gap-0.5 rounded-[18px] py-1.5 text-[10.5px] font-bold ${i === 0 ? PRESSED : ""}`} style={{ color: i === 0 ? C.green : C.muted }}>
              <Icon weight={i === 0 ? "fill" : "bold"} className="size-5" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
