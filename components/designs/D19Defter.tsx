import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ArrowBendDownRightIcon, BellIcon, CalendarDotsIcon, ChatsCircleIcon, HouseIcon, MagnifyingGlassIcon, PencilSimpleIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { kalam, patrickHand } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

// Sketch Hand-Drawn (ui-ux-pro-max): warm paper, pencil black, red marker, blue ballpoint, post-it yellow; wobbly corners,
// 2-3 px pencil lines, hard offset shadows, cards a degree off straight, tape and scribbles. Kalam headings, Patrick Hand body.
const C = { paper: "#fdfbf7", pencil: "#2d2d2d", red: "#c92a2a", blue: "#2d5da1", postit: "#fff6a8", line: "#d6e1ef" };
const WOBBLY = "rounded-[15px_25px_20px_10px/10px_20px_25px_15px]";
const WOBBLY2 = "rounded-[25px_12px_18px_22px/14px_24px_12px_20px]";
const INK = "border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0_#2d2d2d]";
const RULED = { backgroundColor: C.paper, backgroundImage: `linear-gradient(90deg, transparent 30px, #f2b8b8 30px, #f2b8b8 32px, transparent 32px), repeating-linear-gradient(transparent 0 31px, ${C.line} 31px 32px)` };

function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 14" preserveAspectRatio="none" className={className}>
      <path d="M2 9 C 30 3, 60 13, 95 7 S 160 3, 198 8" fill="none" stroke={C.red} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

/** 19 · Defter (notebook): a farmer's ruled notebook, hand-drawn boxes, a taped post-it sponsor and marker notes. */
export function D19Defter() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  const hand = kalam.className;
  return (
    <div id="tasarim-onizleme" className={`${patrickHand.className} min-h-dvh pb-24 text-[17px]`} style={{ ...RULED, color: C.pencil }}>
      <header className="flex items-center gap-2 px-4 pb-1 pt-4">
        <span className={`flex size-12 items-center justify-center bg-white ${WOBBLY} border-[2.5px] border-[#2d2d2d]`}>
          <Image src="/brand/logo.webp" alt="" width={64} height={64} className="size-8" />
        </span>
        <div className="flex-1 pl-1">
          <p className={`${hand} text-[25px] font-bold leading-none`}>{siteConfig.name}</p>
          <Scribble className="mt-0.5 h-2.5 w-36" />
        </div>
        {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
          <span key={i} className={`relative flex size-11 items-center justify-center bg-white ${WOBBLY2} border-2 border-[#2d2d2d]`}>
            <Icon weight="regular" className="size-6" />
            <span className={`${hand} absolute -right-2.5 -top-2.5 flex size-6 items-center justify-center rounded-full border-2 bg-white text-[14px] font-bold`} style={{ borderColor: C.red, color: C.red }}>{i ? BADGES.messages : BADGES.notifications}</span>
          </span>
        ))}
      </header>

      <div className="space-y-5 px-4 pt-3">
        <p className={`${hand} text-[20px]`} style={{ color: C.blue }}>Merhaba {USER.first}! Bugünün notları:</p>

        <div className={`flex h-12 items-center gap-2 border-2 border-dashed bg-white/80 px-3.5 ${WOBBLY}`} style={{ borderColor: C.pencil, color: "#5c5c5c" }}>
          <MagnifyingGlassIcon weight="regular" className="size-5" style={{ color: C.pencil }} />
          Forumda, Pazar’da ara…
        </div>

        {/* The sponsor as a taped post-it. */}
        <div className="relative mx-2 rotate-[1.5deg] p-4 pt-5 shadow-[3px_5px_0_rgba(45,45,45,0.25)]" style={{ background: C.postit }}>
          <span aria-hidden="true" className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 bg-white/60 shadow-sm" />
          <p className="text-[13px] uppercase tracking-wider text-[#6b5a00]">Sponsor · örnek</p>
          <p className={`${hand} text-[24px] font-bold leading-tight`}>{SPONSOR.name}</p>
          <p className="text-[17px]">{SPONSOR.tagline}</p>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className={`-rotate-1 bg-white p-3 ${WOBBLY} ${INK}`}>
            <p className={`${hand} flex items-center gap-1 text-[16px] font-bold`}><SunIcon weight="light" className="size-6 text-[#d97706]" /> {WEATHER.place}</p>
            <p className={`${hand} text-[40px] font-bold leading-none`}>{WEATHER.temp}°</p>
            <p className="text-[16px]">{WEATHER.sky}, {WEATHER.min}°–{WEATHER.max}°</p>
            <p className="mt-1 flex items-start gap-1 text-[15.5px] leading-tight" style={{ color: C.blue }}>
              <ArrowBendDownRightIcon weight="bold" className="mt-0.5 size-4 shrink-0" /> {WEATHER.hint}!
            </p>
          </div>
          <div className={`rotate-1 bg-white p-3 ${WOBBLY2} ${INK}`}>
            <p className={`${hand} flex items-center gap-1 text-[16px] font-bold`}><StorefrontIcon weight="light" className="size-6" /> Pazar</p>
            <p className={`${hand} text-[40px] font-bold leading-none`}>
              <span className="relative inline-block">
                {MARKET.count}
                <span aria-hidden="true" className="absolute -inset-x-2 -inset-y-0.5 -rotate-6 rounded-[50%] border-2" style={{ borderColor: C.red }} />
              </span>
            </p>
            <p className="text-[16px]">ilan var</p>
            <p className="text-[15.5px]" style={{ color: C.blue }}>+{MARKET.today} yeni, bugün</p>
          </div>
        </div>

        <p className="flex items-center gap-2 text-[17px]">
          <span className={`${hand} font-bold`} style={{ color: C.red }}>Not:</span> Reklam vermek için
          <span className="underline decoration-wavy decoration-2 underline-offset-4" style={{ textDecorationColor: C.red }}>bize yazın</span>
        </p>

        <section>
          <div className="flex items-end justify-between">
            <h2 className={`${hand} relative text-[30px] font-bold leading-none`}>
              <span aria-hidden="true" className="absolute inset-x-[-4px] bottom-0.5 h-3.5 -rotate-1 bg-[#ffe066]/80" />
              <span className="relative">Forum notları</span>
            </h2>
            <span className={`flex items-center gap-1.5 bg-white px-3 py-2 text-[16px] ${WOBBLY} ${INK}`}>
              <PencilSimpleIcon weight="bold" className="size-4" /> Konu aç
            </span>
          </div>
          <p className="mt-3 flex gap-4 text-[17px]">
            <span className="relative font-bold">Son konular<Scribble className="absolute -bottom-1.5 left-0 h-2 w-full" /></span>
            <span className="text-[#5c5c5c]">Son yanıtlar</span>
            <span className="text-[#5c5c5c]">Popüler</span>
          </p>
          <ul className="mt-3 space-y-3.5">
            {TOPICS.slice(0, 6).map((t, i) => (
              <li key={t.title} className={`flex gap-3 bg-white/90 p-3 ${i % 2 ? WOBBLY2 : WOBBLY} border-2 border-[#2d2d2d] ${i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}>
                {t.photo ? (
                  <span className={`shrink-0 bg-white p-1 pb-3 shadow-[2px_2px_0_rgba(45,45,45,0.3)] ${i % 2 ? "-rotate-3" : "rotate-3"}`}>
                    <Image src={t.photo} alt="" width={96} height={96} className="size-12 object-cover" />
                  </span>
                ) : (
                  <span className={`${hand} flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed text-[17px] font-bold`} style={{ borderColor: C.blue, color: C.blue }}>{t.initials}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[18px] leading-snug">{t.title}</p>
                  <p className="mt-0.5 text-[15px]" style={{ color: C.blue }}>{t.section} · {t.ago} · {t.replies} yanıt</p>
                </div>
              </li>
            ))}
          </ul>
          <p className={`mt-5 flex min-h-12 items-center justify-center bg-white text-[18px] ${WOBBLY2} ${INK}`}>Daha fazla göster ↓</p>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t-[2.5px] border-dashed bg-[#fdfbf7]" style={{ borderColor: C.pencil }}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className="relative flex flex-col items-center py-1.5 text-[13.5px] leading-tight">
              {i === 0 && <span aria-hidden="true" className="absolute inset-x-2 inset-y-0.5 -rotate-2 rounded-[50%] border-2" style={{ borderColor: C.red }} />}
              <Icon weight={i === 0 ? "bold" : "light"} className="size-6" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
