import Image from "next/image";
import { ArrowRightIcon, BellIcon, CalendarDotsIcon, ChatsCircleIcon, HouseIcon, MagnifyingGlassIcon, SquaresFourIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { outfit } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER, type SectionId } from "./sample";

// Bauhaus (ui-ux-pro-max): primary red, blue and yellow on off-white, stark black, 2 px rules, square blocks and pill buttons,
// circles and triangles as the only ornament, Outfit 900 in capitals for headlines.
const C = { red: "#D02020", blue: "#1040C0", yellow: "#F0C020", bg: "#F0F0F0", fg: "#121212" };
const SHAPE: Record<SectionId, "circle" | "square" | "triangle"> = { bitki: "circle", hayvan: "square", makine: "triangle", destek: "circle", pazar: "square", genel: "triangle" };
const SHAPE_COLOR: Record<SectionId, string> = { bitki: C.red, hayvan: C.blue, makine: C.yellow, destek: C.blue, pazar: C.yellow, genel: C.red };

function Shape({ kind, color, className = "size-4" }: { kind: "circle" | "square" | "triangle"; color: string; className?: string }) {
  if (kind === "triangle") return <span aria-hidden="true" className={`${className} shrink-0 [clip-path:polygon(50%_0,100%_100%,0_100%)]`} style={{ background: color }} />;
  return <span aria-hidden="true" className={`${className} shrink-0 ${kind === "circle" ? "rounded-full" : ""}`} style={{ background: color }} />;
}

/** 15 · Bauhaus: colour blocks in primary red, blue and yellow, circles and triangles, black rules and heavy capitals. */
export function D15Bauhaus() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  return (
    <div id="tasarim-onizleme" className={`${outfit.className} min-h-dvh pb-20`} style={{ background: C.bg, color: C.fg }}>
      <header className="flex h-16 items-center gap-2.5 border-b-2 bg-white px-3" style={{ borderColor: C.fg }}>
        <span className="flex size-11 items-center justify-center rounded-full" style={{ background: C.yellow }}>
          <Image src="/brand/logo.webp" alt="" width={56} height={56} className="size-8" />
        </span>
        <p className="flex-1 text-[19px] font-black uppercase leading-[0.9] tracking-tighter">Çiftçi<br />Destek</p>
        {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
          <span key={i} className="relative flex size-11 items-center justify-center border-2" style={{ borderColor: C.fg }}>
            <Icon weight="bold" className="size-5" />
            <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full text-[10.5px] font-bold text-white" style={{ background: C.red }}>{i ? BADGES.messages : BADGES.notifications}</span>
          </span>
        ))}
        <span className="flex size-11 items-center justify-center rounded-full text-[14px] font-bold text-white" style={{ background: C.blue }}>{USER.initials}</span>
      </header>

      <div className="border-b-2 bg-[radial-gradient(#12121226_1.2px,transparent_1.2px)] p-3 [background-size:16px_16px]" style={{ borderColor: C.fg }}>
        <div className="flex h-12 items-stretch border-2 bg-white" style={{ borderColor: C.fg }}>
          <span className="flex flex-1 items-center gap-2 px-3 text-[15px] text-[#555]"><MagnifyingGlassIcon weight="bold" className="size-5" style={{ color: C.fg }} />Forumda ve Pazar’da ara</span>
          <span className="flex items-center border-l-2 px-4 text-[14px] font-bold uppercase text-white" style={{ background: C.red, borderColor: C.fg }}>Ara</span>
        </div>
      </div>

      {/* The composition: colour blocks in the live page's order, each with a shape. */}
      <div className="relative h-[124px] overflow-hidden border-b-2 p-4" style={{ background: C.yellow, borderColor: C.fg }}>
        <span aria-hidden="true" className="absolute -bottom-10 -right-6 size-28 rounded-full border-[12px]" style={{ borderColor: C.fg }} />
        <span aria-hidden="true" className="absolute right-4 top-4 size-10" style={{ background: C.blue }} />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Sponsor · örnek</p>
        <p className="mt-1 text-[30px] font-black uppercase leading-none tracking-tighter">{SPONSOR.name}</p>
        <p className="mt-1 max-w-[220px] text-[14px] font-medium leading-snug">{SPONSOR.tagline}</p>
      </div>

      <div className="flex items-center justify-between gap-3 border-b-2 px-4 py-3 text-white" style={{ background: C.fg, borderColor: C.fg }}>
        <span className="text-[14px] font-bold uppercase tracking-wide">Reklam vermek için</span>
        <span className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold uppercase" style={{ background: C.yellow, color: C.fg }}>İletişim <ArrowRightIcon weight="bold" className="size-4" /></span>
      </div>

      <div className="grid grid-cols-2 border-b-2" style={{ borderColor: C.fg }}>
        <div className="relative h-[168px] overflow-hidden border-r-2 p-4 text-white" style={{ background: C.blue, borderColor: C.fg }}>
          <span aria-hidden="true" className="absolute -right-8 -top-8 size-24 rounded-full" style={{ background: C.yellow }} />
          <p className="relative text-[12px] font-bold uppercase tracking-[0.2em]">{WEATHER.place}</p>
          <p className="relative text-[64px] font-black leading-[0.9] tracking-tighter">{WEATHER.temp}°</p>
          <p className="relative text-[13px] font-semibold uppercase leading-tight">{WEATHER.sky}<br />{WEATHER.hint}</p>
        </div>
        <div className="relative h-[168px] overflow-hidden p-4 text-white" style={{ background: C.red }}>
          <span aria-hidden="true" className="absolute -bottom-6 -right-6 size-24 bg-white/25 [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
          <p className="text-[12px] font-bold uppercase tracking-[0.2em]">Pazar</p>
          <p className="text-[56px] font-black leading-[0.95] tracking-tighter">{MARKET.count}</p>
          <p className="text-[13px] font-semibold uppercase">ilan · +{MARKET.today} bugün</p>
        </div>
      </div>

      <div className="space-y-5 bg-[radial-gradient(#12121226_1.2px,transparent_1.2px)] p-4 [background-size:16px_16px]">
        <section className="border-2 bg-white" style={{ borderColor: C.fg }}>
          <div className="flex items-center gap-2 border-b-2 p-3" style={{ borderColor: C.fg }}>
            <Shape kind="circle" color={C.red} className="size-5" />
            <Shape kind="square" color={C.blue} className="size-5" />
            <Shape kind="triangle" color={C.yellow} className="size-5" />
            <h2 className="ml-1 flex-1 text-[30px] font-black uppercase leading-none tracking-tighter">Forum</h2>
            <span className="rounded-full border-2 px-4 py-2 text-[13px] font-bold uppercase shadow-[3px_3px_0_#121212]" style={{ borderColor: C.fg, background: C.yellow }}>Konu aç</span>
          </div>
          <div className="flex gap-1.5 whitespace-nowrap border-b-2 p-3 text-[12px] font-bold uppercase" style={{ borderColor: C.fg }}>
            <span className="rounded-full px-3 py-2 text-white" style={{ background: C.fg }}>Son konular</span>
            <span className="rounded-full border-2 px-3 py-1.5" style={{ borderColor: C.fg }}>Yanıtlar</span>
            <span className="rounded-full border-2 px-3 py-1.5" style={{ borderColor: C.fg }}>Popüler</span>
          </div>
          <ul>
            {TOPICS.slice(0, 7).map((t) => (
              <li key={t.title} className="flex gap-3 border-b-2 p-3 last:border-0" style={{ borderColor: C.fg }}>
                <span className="pt-1"><Shape kind={SHAPE[t.sectionId]} color={SHAPE_COLOR[t.sectionId]} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] font-semibold leading-snug">{t.title}</p>
                  <p className="mt-1 text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#4a4a4a]">{t.section} · {t.ago} · {t.replies} yanıt</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <p className="flex min-h-12 items-center justify-center rounded-full border-2 bg-white text-[14px] font-bold uppercase shadow-[4px_4px_0_#121212]" style={{ borderColor: C.fg }}>Daha fazla göster</p>
      </div>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t-2 bg-white" style={{ borderColor: C.fg }}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className="flex flex-col items-center gap-0.5 border-r-2 py-2 text-[10.5px] font-bold uppercase last:border-0" style={{ borderColor: C.fg, background: i === 0 ? C.red : undefined, color: i === 0 ? "#fff" : C.fg }}>
              <Icon weight={i === 0 ? "fill" : "bold"} className="size-6" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
