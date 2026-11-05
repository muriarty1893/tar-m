import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ArrowRightIcon, BellIcon, CalendarDotsIcon, ChatsCircleIcon, DropIcon, HouseIcon, MagnifyingGlassIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { cabin, fraunces } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

// Nature Distilled (ui-ux-pro-max): terracotta, sand, warm clay, soft cream, olive; humanist sans, grain texture, soft shadows.
const C = { cream: "#f5f0e1", sand: "#e8dcc4", sandDeep: "#d4c4a8", terracotta: "#c67b5c", terraText: "#97462a", clay: "#b5651d", olive: "#56632b", earth: "#3b2a1e", muted: "#6b5a4a" };
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.23 0 0 0 0 0.16 0 0 0 0 0.12 0 0 0 0.10 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`;

/** 13 · Toprak (earthy): soft cream, terracotta and olive, a grain texture, arch-shaped windows and a serif with character. */
export function D13Toprak() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  const serif = fraunces.className;
  return (
    <div id="tasarim-onizleme" className={`${cabin.className} min-h-dvh pb-24`} style={{ backgroundColor: C.cream, backgroundImage: GRAIN, color: C.earth }}>
      <header className="flex items-center gap-2 px-5 pb-1 pt-4 text-[12.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.muted }}>
        <span className="flex-1">Perşembe · 5 Kasım</span>
        {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
          <span key={i} className="relative flex size-11 items-center justify-center rounded-full border" style={{ borderColor: C.sandDeep }}>
            <Icon weight="light" className="size-[22px]" style={{ color: C.earth }} />
            <span className="absolute right-1 top-1 flex size-[18px] items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: C.terraText }}>{i ? BADGES.messages : BADGES.notifications}</span>
          </span>
        ))}
        <span className="flex size-11 items-center justify-center rounded-full text-[13px] font-bold tracking-normal text-white" style={{ background: C.olive }}>{USER.initials}</span>
      </header>

      <div className="px-5">
        <h1 className={`${serif} flex items-center gap-2.5 pt-2 text-[34px] font-semibold leading-none tracking-tight`}>
          <Image src="/brand/logo.webp" alt="" width={72} height={72} className="size-9" />
          {siteConfig.name}
        </h1>
        <p className={`${serif} mt-1.5 text-[17px] italic`} style={{ color: C.terraText }}>Topraktan sofraya, çiftçiden çiftçiye.</p>

        <div className="mt-4 flex h-12 items-center gap-2.5 rounded-full border bg-[#fbf8f0] px-5 text-[15px]" style={{ borderColor: C.sandDeep, color: C.muted }}>
          <MagnifyingGlassIcon weight="regular" className="size-5" />
          Forumda ve Pazar’da ara…
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-[20px] p-4 text-white" style={{ background: C.terraText }}>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-80">Sponsor · örnek</p>
            <p className={`${serif} text-[21px] font-semibold leading-tight`}>{SPONSOR.name}</p>
            <p className="text-[13.5px] opacity-90">{SPONSOR.tagline}</p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fbf3e3]" style={{ color: C.terraText }}><ArrowRightIcon weight="bold" className="size-5" /></span>
        </div>

        <p className="mt-3 flex items-center justify-between border-y py-3 text-[14px] font-semibold" style={{ borderColor: C.sandDeep }}>
          <span>Bu alanda reklam vermek için</span>
          <span className="flex items-center gap-1" style={{ color: C.terraText }}>İletişim <ArrowRightIcon weight="bold" className="size-4" /></span>
        </p>

        {/* Arch window: the season's photo with today's weather. */}
        <div className="mt-4 grid grid-cols-[1.35fr_1fr] gap-3">
          <div className="relative h-[270px] overflow-hidden rounded-t-full rounded-b-[20px] shadow-[0_10px_30px_-10px_rgba(59,42,30,0.35)]">
            <Image src="/demo/sahne-balyalar.webp" alt="Balyalar ve hasat edilmiş tarla" fill sizes="220px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3b2a1e]/85 via-[#3b2a1e]/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3.5 text-[#fbf3e3]">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] opacity-90">{WEATHER.place}</p>
              <p className={`${serif} text-[48px] font-semibold leading-none`}>{WEATHER.temp}°</p>
              <p className="flex items-center gap-1.5 text-[13.5px]"><SunIcon weight="fill" className="size-4 text-[#f3c26b]" />{WEATHER.sky}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex-1 rounded-[20px] p-3.5" style={{ background: C.sand }}>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: C.olive }}>Bugün</p>
              <p className={`${serif} mt-1 text-[18px] font-semibold leading-tight`}>{WEATHER.hint}</p>
              <p className="mt-1.5 flex items-center gap-1 text-[13px]" style={{ color: C.muted }}><DropIcon weight="fill" className="size-3.5" /> Yağış %{WEATHER.rain}</p>
              <p className="text-[13px]" style={{ color: C.muted }}>{WEATHER.min}° / {WEATHER.max}°</p>
            </div>
            <div className="flex-1 rounded-t-full rounded-b-[20px] p-3.5 pt-6 text-center text-white" style={{ background: C.olive }}>
              <p className={`${serif} text-[32px] font-semibold leading-none`}>{MARKET.count}</p>
              <p className="text-[13px] font-semibold">ilan</p>
              <p className="text-[12px] opacity-85">+{MARKET.today} bugün</p>
            </div>
          </div>
        </div>

        <section className="mt-6">
          <div className="flex items-end justify-between">
            <h2 className={`${serif} text-[30px] font-semibold leading-none`}>Forum</h2>
            <span className="rounded-full px-4 py-2.5 text-[13.5px] font-bold text-white" style={{ background: C.earth }}>Konu aç</span>
          </div>
          <div className="mt-3 flex gap-5 border-b text-[14.5px] font-semibold" style={{ borderColor: C.sandDeep }}>
            <span className="border-b-2 pb-2" style={{ borderColor: C.terracotta }}>Son konular</span>
            <span className="pb-2" style={{ color: C.muted }}>Son yanıtlar</span>
            <span className="pb-2" style={{ color: C.muted }}>Popüler</span>
          </div>
          <ul>
            {TOPICS.slice(0, 7).map((t, i) => (
              <li key={t.title} className="flex gap-3.5 border-b py-3.5" style={{ borderColor: C.sandDeep }}>
                <span className={`${serif} w-7 shrink-0 pt-0.5 text-[20px] font-semibold italic`} style={{ color: C.terracotta }}>{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] font-bold leading-snug">{t.title}</p>
                  <p className="mt-1 text-[13px]" style={{ color: C.muted }}>{t.section} · {t.author} · {t.ago} · {t.replies} yanıt</p>
                </div>
                {t.photo && <Image src={t.photo} alt="" width={96} height={120} className="h-14 w-12 shrink-0 rounded-t-full rounded-b-md object-cover" />}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex min-h-12 items-center justify-center rounded-full border-2 text-[14.5px] font-bold" style={{ borderColor: C.earth }}>Daha fazla göster</p>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t" style={{ background: "#efe6d2", borderColor: C.sandDeep }}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className="flex flex-col items-center gap-0.5 pb-2 pt-2 text-[11px] font-semibold" style={{ color: i === 0 ? C.terraText : C.muted }}>
              <Icon weight={i === 0 ? "fill" : "light"} className="size-6" />
              {label}
              <span className="size-1 rounded-full" style={{ background: i === 0 ? C.terraText : "transparent" }} />
            </span>
          );
        })}
      </nav>
    </div>
  );
}
