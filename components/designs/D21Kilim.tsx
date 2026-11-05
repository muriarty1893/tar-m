import Image from "next/image";
import { siteConfig } from "@/config/site";
import { BellIcon, CalendarDotsIcon, CaretDownIcon, ChatCircleTextIcon, ChatsCircleIcon, HouseIcon, MagnifyingGlassIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { alegreya, alegreyaSans } from "./fonts";
import { BADGES, MARKET, NAV, SECTIONS, SPONSOR, TOPICS, USER, WEATHER, type SectionId } from "./sample";

// Anatolian kilim. No style in the ui-ux-pro-max data matched, so this one is built on its Flat Design + Vibrant & Block-based
// rules (flat colour, geometric ornament, no gradients) with a kilim palette: madder red, indigo, saffron, walnut, wool cream.
// Alegreya + Alegreya Sans (calligraphic, warm, full Turkish support).
const C = { wool: "#f6eedf", wool2: "#efe2cb", red: "#9b2226", indigo: "#1d3557", saffron: "#e9a23b", walnut: "#3d2418", muted: "#6a4f3f", olive: "#5f6b2f" };
const DOT: Record<SectionId, string> = { bitki: C.olive, hayvan: C.red, makine: C.indigo, destek: C.saffron, pazar: C.red, genel: C.indigo };

// One kilim band tile (24 x 16): indigo ground, a red diamond with a saffron eye, cream teeth top and bottom.
const BAND = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16"><rect width="24" height="16" fill="${C.indigo}"/><path d="M0 0h24L18 3 12 0 6 3z" fill="${C.wool}"/><path d="M0 16h24l-6-3-6 3-6-3z" fill="${C.wool}"/><path d="M12 2l6 6-6 6-6-6z" fill="${C.red}"/><path d="M12 5.5l2.5 2.5L12 10.5 9.5 8z" fill="${C.saffron}"/></svg>`,
)}")`;
// A small all-over motif for frames: alternating red and saffron diamonds on walnut.
const FRAME = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><rect width="12" height="12" fill="${C.walnut}"/><path d="M6 1l5 5-5 5-5-5z" fill="${C.red}"/><path d="M6 4l2 2-2 2-2-2z" fill="${C.saffron}"/></svg>`,
)}")`;

function Band({ h = 16 }: { h?: number }) {
  return <div aria-hidden="true" style={{ height: h, backgroundImage: BAND, backgroundSize: `${(h / 16) * 24}px ${h}px` }} />;
}

/** Göz (eye) motif: a diamond in a diamond, the kilim's charm against the evil eye. */
function Goz({ color = C.red, size = 18 }: { color?: string; size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width={size} height={size} className="shrink-0">
      <path d="M10 1l9 9-9 9-9-9z" fill={color} />
      <path d="M10 5l5 5-5 5-5-5z" fill={C.wool} />
      <path d="M10 8l2 2-2 2-2-2z" fill={color} />
    </svg>
  );
}

/** 21 · Kilim: Anatolian kilim colours and motifs; woven bands, diamond eyes, a framed sponsor; warm and local. */
export function D21Kilim() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  const serif = alegreya.className;
  return (
    <div id="tasarim-onizleme" className={`${alegreyaSans.className} min-h-dvh pb-24 text-[16px]`} style={{ background: C.wool, color: C.walnut }}>
      <Band />
      <header className="flex items-center gap-2 px-4 py-3">
        <Image src="/brand/logo.webp" alt="" width={72} height={72} className="size-10" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className={`${serif} text-[23px] font-bold`}>{siteConfig.name}</p>
          <p className="text-[13px] font-medium" style={{ color: C.muted }}>Hoş geldin {USER.first}</p>
        </div>
        {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
          <span key={i} className="relative flex size-11 items-center justify-center rounded-md border-2" style={{ borderColor: C.walnut }}>
            <Icon weight="bold" className="size-5" />
            <span className="absolute -right-2 -top-2 flex size-5 rotate-45 items-center justify-center text-white" style={{ background: C.red }}>
              <span className="-rotate-45 text-[10.5px] font-bold">{i ? BADGES.messages : BADGES.notifications}</span>
            </span>
          </span>
        ))}
      </header>

      <div className="space-y-4 px-4">
        <div className="flex h-12 items-center gap-2.5 rounded-md border-2 bg-white/70 px-4 text-[15.5px] outline outline-1 outline-offset-2" style={{ borderColor: C.indigo, outlineColor: C.indigo, color: C.muted }}>
          <MagnifyingGlassIcon weight="bold" className="size-5" style={{ color: C.indigo }} />
          Forumda ve Pazar’da ara…
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="overflow-hidden rounded-md text-white" style={{ background: C.indigo }}>
            <div className="p-3.5">
              <p className="flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-white/80"><SunIcon weight="fill" className="size-4" style={{ color: C.saffron }} />{WEATHER.place}</p>
              <p className={`${serif} text-[46px] font-bold leading-none`}>{WEATHER.temp}°</p>
              <p className="text-[14px]">{WEATHER.sky}</p>
              <p className="mt-1 text-[13px] font-bold" style={{ color: C.saffron }}>{WEATHER.hint}</p>
            </div>
            <Band h={10} />
          </div>
          <div className="overflow-hidden rounded-md text-white" style={{ background: C.red }}>
            <div className="p-3.5">
              <p className="flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-white/80"><StorefrontIcon weight="fill" className="size-4" style={{ color: C.saffron }} />Pazar</p>
              <p className={`${serif} text-[46px] font-bold leading-none`}>{MARKET.count}</p>
              <p className="text-[14px]">ilan</p>
              <p className="mt-1 text-[13px] font-bold text-[#ffd79a]">+{MARKET.today} bugün</p>
            </div>
            <Band h={10} />
          </div>
        </div>

        {/* The sponsor in a woven frame. */}
        <div className="rounded-md p-[7px]" style={{ backgroundImage: FRAME, backgroundSize: "12px 12px" }}>
          <div className="flex items-center gap-3 rounded-sm p-3.5" style={{ background: C.wool }}>
            <Goz color={C.indigo} size={30} />
            <div className="min-w-0">
              <p className="text-[11.5px] font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>Sponsor · örnek</p>
              <p className={`${serif} text-[21px] font-bold leading-tight`}>{SPONSOR.name}</p>
              <p className="text-[14.5px]">{SPONSOR.tagline}</p>
            </div>
          </div>
        </div>

        <p className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed py-3 text-[15px] font-bold" style={{ borderColor: C.saffron, background: "#fbf1dc" }}>
          <Goz color={C.saffron} size={14} /> Reklam vermek için <span className="underline underline-offset-2" style={{ color: C.red }}>iletişime geçin</span>
        </p>

        <section className="overflow-hidden rounded-md border-2 bg-[#fbf6ec]" style={{ borderColor: C.walnut }}>
          <div className="flex items-center gap-2.5 px-3.5 pb-2 pt-3">
            <Goz />
            <h2 className={`${serif} flex-1 text-[26px] font-bold leading-none`}>Forum</h2>
            <span className="rounded-md px-3.5 py-2 text-[14px] font-bold text-white" style={{ background: C.red }}>Konu aç</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-3">
            {SECTIONS.map((s, i) => (
              <span key={s.id} className="shrink-0 rounded-md border-2 px-2.5 py-1.5 text-[13px] font-bold" style={i === 0 ? { background: C.indigo, borderColor: C.indigo, color: "#fff" } : { borderColor: C.wool2, background: C.wool }}>
                {s.name}
              </span>
            ))}
          </div>
          <Band h={8} />
          <ul>
            {TOPICS.slice(0, 7).map((t) => (
              <li key={t.title} className="flex gap-3 border-b px-3.5 py-3 last:border-0" style={{ borderColor: C.wool2 }}>
                <span className="pt-1"><Goz color={DOT[t.sectionId]} size={14} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-bold leading-snug">{t.title}</p>
                  <p className="mt-0.5 text-[13.5px]" style={{ color: C.muted }}>{t.section} · {t.author} · {t.ago}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 self-center text-[13.5px] font-bold" style={{ color: C.indigo }}><ChatCircleTextIcon weight="bold" className="size-4" />{t.replies}</span>
              </li>
            ))}
          </ul>
          <p className="flex min-h-12 items-center justify-center gap-1.5 border-t-2 text-[15px] font-bold" style={{ borderColor: C.walnut }}>
            Daha fazla göster <CaretDownIcon weight="bold" className="size-4" />
          </p>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0" style={{ background: C.indigo }}>
        <Band h={8} />
        <div className="grid grid-cols-4">
          {NAV.map((label, i) => {
            const Icon = icons[i];
            return (
              <span key={label} className="flex flex-col items-center gap-0.5 py-1.5 text-[11.5px] font-bold" style={{ color: i === 0 ? C.saffron : "#dfe6f0" }}>
                <Icon weight={i === 0 ? "fill" : "bold"} className="size-6" />
                {label}
              </span>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
