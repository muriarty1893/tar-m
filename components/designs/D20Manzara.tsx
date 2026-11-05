import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ArrowUpRightIcon, BellIcon, CalendarDotsIcon, CaretDownIcon, ChatCircleTextIcon, ChatsCircleIcon, CloudIcon, CloudRainIcon, CloudSunIcon, HouseIcon, MagnifyingGlassIcon, MegaphoneIcon, PencilSimpleLineIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { bebasNeue, sourceSans } from "./fonts";
import { BADGES, FORECAST, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

// Dimensional Layering (ui-ux-pro-max): a full-bleed field photo at the back, a sheet sliding over it, cards on a 4-step
// elevation scale, a stacked "deck" for the market, a floating action button. Bebas Neue display + Source Sans 3 body.
const C = { sheet: "#f6f6f3", text: "#14181f", muted: "#545b66", green: "#166534", accent: "#b45309" };
const E = {
  1: "shadow-[0_1px_3px_rgba(0,0,0,0.10)]",
  2: "shadow-[0_4px_6px_rgba(0,0,0,0.10)]",
  3: "shadow-[0_10px_20px_rgba(0,0,0,0.10)]",
  4: "shadow-[0_20px_40px_rgba(0,0,0,0.18)]",
};
const SKY = { sun: SunIcon, cloudSun: CloudSunIcon, cloud: CloudIcon, rain: CloudRainIcon } as const;

/** 20 · Manzara (photo, layers): the field fills the top with today's weather on it; the page rises over it as a sheet of layered cards. */
export function D20Manzara() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  const display = bebasNeue.className;
  return (
    <div id="tasarim-onizleme" className={`${sourceSans.className} min-h-dvh pb-28`} style={{ background: C.sheet, color: C.text }}>
      <div className="relative h-[420px] overflow-hidden text-white">
        <Image src="/demo/sahne-surulmus-tarla.webp" alt="Sürülmüş tarla ve bulutlu gökyüzü" fill priority sizes="390px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/55" />
        <header className="relative flex items-center gap-2 px-4 pt-4">
          <Image src="/brand/logo.webp" alt="" width={64} height={64} className="size-9" />
          <p className="flex-1 text-[18px] font-bold drop-shadow">{siteConfig.name}</p>
          {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
            <span key={i} className="relative flex size-11 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 backdrop-blur-md">
              <Icon weight="bold" className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full bg-[#f59e0b] text-[10px] font-bold text-black">{i ? BADGES.messages : BADGES.notifications}</span>
            </span>
          ))}
          <span className="flex size-11 items-center justify-center rounded-full bg-white text-[13px] font-bold text-black">{USER.initials}</span>
        </header>
        <div className="relative px-5 pt-7">
          <p className="text-[14px] font-semibold uppercase tracking-[0.25em] drop-shadow">{WEATHER.place} · Bugün</p>
          <p className={`${display} text-[124px] leading-[0.85] drop-shadow-lg`}>{WEATHER.temp}°</p>
          <p className="text-[18px] font-semibold drop-shadow">{WEATHER.sky} · {WEATHER.hint}</p>
        </div>
        <div className="absolute inset-x-4 bottom-12 grid grid-cols-5 gap-1.5">
          {FORECAST.map((f) => {
            const Icon = SKY[f.sky];
            return (
              <div key={f.day} className="flex flex-col items-center rounded-2xl bg-white/20 py-2 ring-1 ring-white/25 backdrop-blur-md">
                <span className="text-[12px] font-semibold">{f.day}</span>
                <Icon weight="fill" className="my-0.5 size-5" />
                <span className="text-[13px] font-bold">{f.max}°</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* The sheet. */}
      <div className="relative z-10 -mt-7 rounded-t-[32px] px-4 pt-3" style={{ background: C.sheet }}>
        <span aria-hidden="true" className="mx-auto block h-1.5 w-12 rounded-full bg-black/15" />

        <div className={`relative mt-3 flex h-12 items-center gap-2.5 rounded-2xl bg-white px-4 text-[15.5px] ${E[3]}`} style={{ color: C.muted }}>
          <MagnifyingGlassIcon weight="bold" className="size-5" style={{ color: C.text }} />
          Forumda ve Pazar’da ara…
        </div>

        <div className="mt-6 grid grid-cols-[1.2fr_1fr] gap-3">
          {/* Market as a deck of cards. */}
          <div className="relative pt-3">
            <span aria-hidden="true" className={`absolute inset-x-4 top-0 h-full rounded-3xl bg-white/70 ${E[1]}`} />
            <span aria-hidden="true" className={`absolute inset-x-2 top-1.5 h-full rounded-3xl bg-white/90 ${E[1]}`} />
            <div className={`relative overflow-hidden rounded-3xl bg-white ${E[3]}`}>
              <Image src={MARKET.newest.photo} alt="" width={300} height={200} className="h-24 w-full object-cover" />
              <div className="p-3">
                <p className={`${display} text-[30px] leading-none`}>{MARKET.count} ilan</p>
                <p className="text-[13px]" style={{ color: C.muted }}>+{MARKET.today} bugün · Pazar</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-3">
            <div className={`flex-1 rounded-3xl bg-[#14181f] p-3.5 text-white ${E[2]}`}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">Sponsor · örnek</p>
              <p className={`${display} mt-1 text-[24px] leading-none`}>{SPONSOR.name}</p>
              <p className="mt-1 text-[12.5px] leading-snug text-white/85">{SPONSOR.tagline}</p>
            </div>
            <div className={`flex items-center gap-2 rounded-3xl bg-white p-3 ${E[1]}`}>
              <MegaphoneIcon weight="fill" className="size-6 shrink-0" style={{ color: C.accent }} />
              <p className="text-[13px] font-bold leading-tight">Reklam vermek için <span style={{ color: C.accent }}>yazın</span></p>
            </div>
          </div>
        </div>

        <section className="mt-7">
          <div className="flex items-end justify-between">
            <h2 className={`${display} text-[40px] leading-none`}>Forum</h2>
            <p className="flex gap-3 pb-1 text-[14px] font-semibold">
              <span style={{ color: C.green }}>Son</span>
              <span style={{ color: C.muted }}>Yanıtlar</span>
              <span style={{ color: C.muted }}>Popüler</span>
            </p>
          </div>
          <ul className="mt-3 space-y-3">
            {TOPICS.slice(0, 6).map((t, i) =>
              t.photo && i < 3 ? (
                <li key={t.title} className={`relative overflow-hidden rounded-3xl ${E[3]}`}>
                  <Image src={t.photo} alt="" width={720} height={400} className="h-40 w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-white/80">{t.section} · {t.ago}</p>
                    <p className="text-[17px] font-bold leading-snug">{t.title}</p>
                  </div>
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[12.5px] font-bold text-black"><ChatCircleTextIcon weight="bold" className="size-3.5" />{t.replies}</span>
                </li>
              ) : (
                <li key={t.title} className={`flex items-center gap-3 rounded-3xl bg-white p-3.5 ${E[2]}`}>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#ecfdf3] text-[13px] font-bold" style={{ color: C.green }}>{t.initials}</span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[15px] font-bold leading-snug">{t.title}</p>
                    <p className="text-[12.5px]" style={{ color: C.muted }}>{t.section} · {t.ago}</p>
                  </div>
                  <ArrowUpRightIcon weight="bold" className="size-5 shrink-0" style={{ color: C.muted }} />
                </li>
              ),
            )}
          </ul>
          <p className={`mt-4 flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-white text-[15px] font-bold ${E[1]}`}>
            Daha fazla göster <CaretDownIcon weight="bold" className="size-4" />
          </p>
        </section>
      </div>

      <span className={`fixed bottom-[92px] right-4 z-20 flex h-14 items-center gap-2 rounded-2xl px-5 text-[15px] font-bold text-white ${E[4]}`} style={{ background: C.green }}>
        <PencilSimpleLineIcon weight="bold" className="size-5" /> Konu aç
      </span>
      <nav className={`fixed inset-x-3 bottom-3 z-20 grid grid-cols-4 rounded-3xl bg-white p-1.5 ${E[4]}`}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className="flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10.5px] font-semibold" style={i === 0 ? { background: "#ecfdf3", color: C.green } : { color: C.muted }}>
              <Icon weight={i === 0 ? "fill" : "regular"} className="size-[22px]" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
