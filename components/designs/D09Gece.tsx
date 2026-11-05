import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ArrowUpRightIcon, BellIcon, CalendarDotsIcon, CaretDownIcon, ChatCircleTextIcon, ChatsCircleIcon, HouseIcon, MagnifyingGlassIcon, MegaphoneIcon, NotePencilIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { manrope } from "./fonts";
import { MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

const LIME = "#b8f34a";

/** 9 · Gece (dark): deep black, raised graphite panels, one bright lime accent; easy on the eyes at night. */
export function D09Gece() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  return (
    <div id="tasarim-onizleme" className={`${manrope.className} min-h-dvh bg-[#07080a] pb-24 text-[#f4f4f5]`}>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-white/[0.06] bg-[#07080a]/90 px-4 backdrop-blur">
        <Image src="/brand/logo.webp" alt="" width={56} height={56} className="size-8" />
        <span className="flex-1 text-[17px] font-extrabold">{siteConfig.name}</span>
        {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
          <span key={i} className="relative flex size-10 items-center justify-center rounded-full bg-white/[0.06]">
            <Icon weight="regular" className="size-5 text-[#d4d4d8]" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full" style={{ background: LIME }} />
          </span>
        ))}
        <span className="flex size-10 items-center justify-center rounded-full bg-[#18181b] text-[13px] font-bold ring-2" style={{ color: LIME, ["--tw-ring-color" as string]: LIME }}>{USER.initials}</span>
      </header>

      <div className="space-y-3 px-4 pt-4">
        <div className="flex h-12 items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-[#111214] px-4 text-[15px] text-[#71717a]">
          <MagnifyingGlassIcon weight="bold" className="size-5" /> Forumda ve Pazar’da ara
        </div>

        <div className="rounded-3xl bg-[linear-gradient(135deg,#2563eb,#10b981)] p-px">
          <div className="flex items-center gap-3 rounded-[23px] bg-[#0d1210] p-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#34d399]">Sponsor · örnek</p>
              <p className="mt-0.5 text-[20px] font-extrabold">{SPONSOR.name}</p>
              <p className="text-[13.5px] text-[#a1a1aa]">{SPONSOR.tagline}</p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-full bg-white text-black"><ArrowUpRightIcon weight="bold" className="size-5" /></span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-dashed px-4 py-3" style={{ borderColor: `${LIME}66` }}>
          <MegaphoneIcon weight="duotone" className="size-5" style={{ color: LIME }} />
          <span className="flex-1 text-[14.5px] font-bold">Reklam vermek için</span>
          <span className="text-[13px] font-bold" style={{ color: LIME }}>İletişim →</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-[#121316] p-4">
            <p className="flex items-center justify-between text-[13px] font-semibold text-[#a1a1aa]">{WEATHER.place}<SunIcon weight="fill" className="size-5 text-[#facc15]" /></p>
            <p className="mt-2 text-[42px] font-extrabold leading-none">{WEATHER.temp}°</p>
            <p className="mt-2 text-[12.5px] font-bold" style={{ color: LIME }}>{WEATHER.hint}</p>
          </div>
          <div className="rounded-3xl bg-[#121316] p-4">
            <p className="flex items-center justify-between text-[13px] font-semibold text-[#a1a1aa]">Pazar<StorefrontIcon weight="duotone" className="size-5 text-[#fb7185]" /></p>
            <p className="mt-2 text-[42px] font-extrabold leading-none">{MARKET.count}</p>
            <p className="mt-2 text-[12.5px] font-bold text-[#a1a1aa]">ilan · +{MARKET.today} bugün</p>
          </div>
        </div>

        <section className="pt-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-extrabold">Forum</h2>
            <span className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-extrabold text-black" style={{ background: LIME }}>
              <NotePencilIcon weight="bold" className="size-4" /> Konu aç
            </span>
          </div>
          <div className="mt-3 flex gap-2 text-[13px] font-bold">
            <span className="rounded-full px-3.5 py-1.5 text-black" style={{ background: LIME }}>Son konular</span>
            <span className="rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[#d4d4d8]">Son yanıtlar</span>
            <span className="rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[#d4d4d8]">Popüler</span>
          </div>
          <ul className="mt-3 overflow-hidden rounded-3xl bg-[#121316]">
            {TOPICS.slice(0, 7).map((t) => (
              <li key={t.title} className="flex gap-3 border-b border-white/[0.06] px-4 py-3.5 last:border-0">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[12px] font-bold text-[#d4d4d8]">{t.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold leading-snug">{t.title}</p>
                  <p className="mt-1 text-[12px] text-[#71717a]">{t.section} · {t.author} · {t.ago}</p>
                </div>
                <span className="flex h-7 shrink-0 items-center gap-1 rounded-full border px-2 text-[12px] font-bold" style={{ borderColor: `${LIME}55`, color: LIME }}>
                  <ChatCircleTextIcon weight="bold" className="size-3.5" />{t.replies}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl border border-white/[0.1] py-3 text-[14px] font-bold">
            Daha fazla göster <CaretDownIcon weight="bold" className="size-4" />
          </p>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t border-white/[0.06] bg-[#07080a]/95 pb-3 pt-2 backdrop-blur">
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className="flex flex-col items-center gap-0.5 text-[10.5px] font-bold" style={{ color: i === 0 ? LIME : "#71717a" }}>
              <Icon weight={i === 0 ? "fill" : "regular"} className="size-6" />
              {label}
              <span className="size-1 rounded-full" style={{ background: i === 0 ? LIME : "transparent" }} />
            </span>
          );
        })}
      </nav>
    </div>
  );
}
