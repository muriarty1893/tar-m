import Image from "next/image";
import { siteConfig } from "@/config/site";
import {
  BellIcon,
  CalendarDotsIcon,
  CaretDownIcon,
  ChartLineUpIcon,
  ChatCircleIcon,
  ChatsCircleIcon,
  ChatsTeardropIcon,
  CowIcon,
  DropIcon,
  HandCoinsIcon,
  HeartIcon,
  HouseIcon,
  LeafIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  PlantIcon,
  PlusIcon,
  SquaresFourIcon,
  StorefrontIcon,
  SunIcon,
  TractorIcon,
  WindIcon,
} from "@phosphor-icons/react/dist/ssr";
import { lora, raleway } from "./fonts";
import { BADGES, MARKET, NAV, SECTIONS, SPONSOR, TOPICS, USER, WEATHER, type SectionId } from "./sample";

// Organic Biophilic (ui-ux-pro-max): cream, forest green, earth brown, sky blue; varied organic radii, soft natural shadows, blob shapes.
const C = { bg: "#f6f3e7", forest: "#1f6b35", deep: "#143d22", earth: "#7a3e12", sky: "#d9eef7", moss: "#e3ecd2", text: "#22301f", muted: "#55634f" };
const LEAF = "rounded-[28px_8px_28px_8px]";
const PEBBLE = ["rounded-[42%_58%_55%_45%/48%_42%_58%_52%]", "rounded-[58%_42%_45%_55%/52%_58%_42%_48%]", "rounded-[50%_50%_40%_60%/60%_40%_60%_40%]"];
const SHADOW = "shadow-[0_8px_32px_rgba(31,61,34,0.08)]";
const ICON: Record<SectionId, typeof PlantIcon> = { bitki: PlantIcon, hayvan: CowIcon, makine: TractorIcon, destek: HandCoinsIcon, pazar: ChartLineUpIcon, genel: ChatsTeardropIcon };
const BLOB = "M44.7,-58.2C57.3,-47.7,66.3,-33.4,70.6,-17.4C74.9,-1.4,74.5,16.3,67,30.4C59.5,44.5,44.9,55,28.8,62.4C12.7,69.8,-4.9,74.1,-21.4,70C-37.9,65.9,-53.3,53.4,-63.5,37.6C-73.7,21.8,-78.7,2.7,-74.5,-14C-70.3,-30.7,-56.9,-45,-42.1,-55.2C-27.3,-65.4,-11.1,-71.5,3.6,-75.8C18.3,-80.1,32.1,-68.7,44.7,-58.2Z";

/** 12 · Doğa (organic): cream and forest green, leaf-shaped cards, pebble photos, soft blobs; calm and natural. */
export function D12Doga() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  const serif = lora.className;
  return (
    <div id="tasarim-onizleme" className={`${raleway.className} relative min-h-dvh overflow-hidden pb-28`} style={{ background: C.bg, color: C.text }}>
      <svg aria-hidden="true" viewBox="0 0 200 200" className="pointer-events-none absolute -right-28 -top-24 size-80">
        <path fill="#e2ebcb" d={BLOB} transform="translate(100 100)" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 200 200" className="pointer-events-none absolute -left-32 top-[520px] size-80 rotate-45">
        <path fill="#ebe4cf" d={BLOB} transform="translate(100 100)" />
      </svg>

      <header className="relative flex items-center gap-2.5 px-4 pb-2 pt-4">
        <Image src="/brand/logo.webp" alt="" width={72} height={72} className="size-10" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className={`${serif} text-[20px] font-bold`} style={{ color: C.deep }}>{siteConfig.name}</p>
          <p className="text-[12.5px] font-medium" style={{ color: C.muted }}>Toprağın sesi, çiftçinin forumu</p>
        </div>
        {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
          <span key={i} className={`relative flex size-11 items-center justify-center bg-white/80 ${LEAF} ${SHADOW}`}>
            <Icon weight="duotone" className="size-[22px]" style={{ color: C.forest }} />
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full text-[10.5px] font-bold text-white" style={{ background: C.earth }}>{i ? BADGES.messages : BADGES.notifications}</span>
          </span>
        ))}
      </header>

      <div className="relative space-y-4 px-4">
        <p className={`${serif} pt-2 text-[26px] font-semibold leading-tight`} style={{ color: C.deep }}>
          Günaydın {USER.first}, <span className="italic" style={{ color: C.forest }}>bugün tarla nasıl?</span>
        </p>

        <div className={`flex h-12 items-center gap-2.5 rounded-full bg-white/85 px-5 text-[15px] ${SHADOW}`} style={{ color: C.muted }}>
          <MagnifyingGlassIcon weight="bold" className="size-5" style={{ color: C.forest }} />
          Forumda ve Pazar’da ara…
        </div>

        {/* Weather: a sky-blue leaf with the sun in a blob. */}
        <div className={`relative overflow-hidden rounded-[40px_14px_40px_14px] p-5 ${SHADOW}`} style={{ background: `linear-gradient(160deg, ${C.sky} 0%, #eef7e6 100%)` }}>
          <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -right-10 -top-10 size-44">
            <path fill="#fff4c9" d={BLOB} transform="translate(100 100)" />
          </svg>
          <SunIcon weight="fill" className="absolute right-6 top-6 size-14 text-[#e0a100]" />
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ color: C.muted }}>{WEATHER.place} · bugün</p>
          <p className={`${serif} mt-1 text-[56px] font-semibold leading-none`} style={{ color: C.deep }}>{WEATHER.temp}°</p>
          <p className="mt-1 text-[15px] font-medium">{WEATHER.sky} · {WEATHER.min}° / {WEATHER.max}°</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[13px] font-semibold">
            <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5" style={{ color: C.forest }}>
              <LeafIcon weight="fill" className="size-4" /> {WEATHER.hint}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/60 px-3 py-1.5"><DropIcon weight="fill" className="size-4 text-[#2b7bb9]" /> %{WEATHER.rain}</span>
            <span className="flex items-center gap-1 rounded-full bg-white/60 px-3 py-1.5"><WindIcon weight="bold" className="size-4" /> {WEATHER.wind} km/s</span>
          </div>
        </div>

        <div className="grid grid-cols-[1.25fr_1fr] gap-3">
          <div className={`bg-white/90 p-3.5 ${LEAF} ${SHADOW}`}>
            <div className="flex items-center gap-3">
              <Image src={MARKET.newest.photo} alt="" width={120} height={120} className={`size-14 shrink-0 object-cover ${PEBBLE[0]}`} />
              <div className="min-w-0">
                <p className={`${serif} text-[24px] font-bold leading-none`} style={{ color: C.earth }}>{MARKET.count}</p>
                <p className="text-[12.5px] font-semibold leading-tight" style={{ color: C.muted }}>ilan<br />+{MARKET.today} bugün</p>
              </div>
            </div>
            <p className="mt-2.5 line-clamp-1 text-[13.5px] font-semibold">{MARKET.newest.title}</p>
            <p className="text-[12.5px]" style={{ color: C.muted }}>{MARKET.newest.price} / {MARKET.newest.unit}</p>
          </div>
          <div className={`flex flex-col justify-between rounded-[8px_28px_8px_28px] border-2 border-dashed p-3.5`} style={{ borderColor: "#c9a77f", background: "#fbf3e4" }}>
            <MegaphoneIcon weight="duotone" className="size-7" style={{ color: C.earth }} />
            <p className="text-[14px] font-bold leading-snug" style={{ color: C.earth }}>Reklam vermek için</p>
            <p className="text-[12.5px] font-semibold underline underline-offset-2" style={{ color: C.earth }}>İletişime geçin</p>
          </div>
        </div>

        <div className={`relative flex items-center gap-3 overflow-hidden rounded-[14px_40px_14px_40px] p-4 text-white ${SHADOW}`} style={{ background: `linear-gradient(120deg, ${C.forest}, ${C.deep})` }}>
          <span className={`flex size-12 shrink-0 items-center justify-center bg-white/15 ${PEBBLE[1]}`}><DropIcon weight="fill" className="size-6 text-[#bfe6ff]" /></span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">Sponsor · örnek</p>
            <p className={`${serif} text-[19px] font-bold leading-tight`}>{SPONSOR.name}</p>
            <p className="text-[13px] text-white/85">{SPONSOR.tagline}</p>
          </div>
        </div>

        <section className={`rounded-[36px] bg-white/90 p-4 ${SHADOW}`}>
          <div className="flex items-center justify-between">
            <h2 className={`${serif} text-[24px] font-bold`} style={{ color: C.deep }}>Tarladan sohbetler</h2>
            <span className={`flex size-11 items-center justify-center text-white ${PEBBLE[2]}`} style={{ background: C.forest }}>
              <PlusIcon weight="bold" className="size-5" />
            </span>
          </div>
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
            {SECTIONS.map((s, i) => {
              const Icon = ICON[s.id];
              return (
                <span key={s.id} className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold" style={i === 0 ? { background: C.forest, color: "#fff" } : { background: C.moss, color: C.deep }}>
                  <Icon weight="duotone" className="size-4" /> {s.name}
                </span>
              );
            })}
          </div>
          <ul className="mt-2">
            {TOPICS.slice(0, 6).map((t, i) => (
              <li key={t.title} className="flex gap-3 border-b border-dashed py-3.5 last:border-0" style={{ borderColor: "#d9d3bd" }}>
                {t.photo ? (
                  <Image src={t.photo} alt="" width={120} height={120} className={`size-14 shrink-0 object-cover ${PEBBLE[i % 3]}`} />
                ) : (
                  <span className={`flex size-14 shrink-0 items-center justify-center text-[14px] font-bold ${PEBBLE[i % 3]}`} style={{ background: C.moss, color: C.forest }}>{t.initials}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold leading-snug">{t.title}</p>
                  <p className="mt-1 flex items-center gap-3 text-[12.5px] font-medium" style={{ color: C.muted }}>
                    <span>{t.section} · {t.ago}</span>
                    <span className="flex items-center gap-1"><ChatCircleIcon weight="bold" className="size-3.5" />{t.replies}</span>
                    <span className="flex items-center gap-1"><HeartIcon weight="bold" className="size-3.5" />{t.likes}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex min-h-12 items-center justify-center gap-1.5 rounded-full text-[14.5px] font-bold" style={{ background: C.moss, color: C.deep }}>
            Daha fazla göster <CaretDownIcon weight="bold" className="size-4" />
          </p>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0">
        <svg aria-hidden="true" viewBox="0 0 390 24" preserveAspectRatio="none" className="block h-6 w-full">
          <path d="M0 24 C 90 0, 300 0, 390 24 Z" fill="#fffdf6" />
        </svg>
        <div className="grid grid-cols-4 bg-[#fffdf6] pb-2">
          {NAV.map((label, i) => {
            const Icon = icons[i];
            return (
              <span key={label} className="flex flex-col items-center gap-1 text-[11px] font-semibold" style={{ color: i === 0 ? C.deep : C.muted }}>
                <span className={`flex h-9 w-14 items-center justify-center ${i === 0 ? PEBBLE[0] : ""}`} style={i === 0 ? { background: C.moss } : undefined}>
                  <Icon weight={i === 0 ? "fill" : "regular"} className="size-[22px]" style={i === 0 ? { color: C.forest } : undefined} />
                </span>
                {label}
              </span>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
