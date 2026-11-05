import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ArrowUpRightIcon, BellIcon, CalendarDotsIcon, CaretDownIcon, ChatCircleTextIcon, ChatsCircleIcon, HouseIcon, MagnifyingGlassIcon, MegaphoneIcon, PlusIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

const font = { fontFamily: "var(--font-jakarta), system-ui, sans-serif" };

/** 2 · Bento: grey canvas, white tiles of different sizes (Apple-style), a floating pill tab bar. */
export function D02Bento() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  const badge = (n: number) => (
    <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full bg-[#ff3b30] text-[10px] font-bold text-white ring-2 ring-[#f2f3f5]">{n}</span>
  );
  return (
    <div id="tasarim-onizleme" style={font} className="min-h-dvh bg-[#f2f3f5] px-3.5 pb-28 text-[#16181d]">
      <header className="flex items-center gap-3 pb-3 pt-4">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#16181d] text-[14px] font-bold text-white">{USER.initials}</span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[12.5px] text-black/50">Günaydın, {USER.first}</p>
          <p className="flex items-center gap-1.5 text-[20px] font-extrabold tracking-tight">
            <Image src="/brand/logo.webp" alt="" width={44} height={44} className="size-6" />
            {siteConfig.name}
          </p>
        </div>
        <span className="relative flex size-11 items-center justify-center rounded-full bg-white shadow-sm">
          <BellIcon weight="bold" className="size-5" />
          {badge(BADGES.notifications)}
        </span>
        <span className="relative flex size-11 items-center justify-center rounded-full bg-white shadow-sm">
          <ChatsCircleIcon weight="bold" className="size-5" />
          {badge(BADGES.messages)}
        </span>
      </header>

      <div className="flex h-12 items-center gap-2.5 rounded-2xl bg-white px-4 text-[15px] text-black/40 shadow-sm">
        <MagnifyingGlassIcon weight="bold" className="size-5" />
        Forumda ve Pazar’da ara…
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="relative col-span-2 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#1d4ed8_0%,#0f766e_60%,#059669_100%)] p-5 text-white">
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold tracking-wide">SPONSOR · ÖRNEK</span>
          <p className="mt-4 text-[24px] font-extrabold tracking-tight">{SPONSOR.name}</p>
          <p className="text-[14px] text-white/85">{SPONSOR.tagline}</p>
          <span className="absolute bottom-4 right-4 flex size-11 items-center justify-center rounded-full bg-white text-[#0f766e]">
            <ArrowUpRightIcon weight="bold" className="size-5" />
          </span>
        </div>

        <div className="col-span-2 flex items-center gap-3 rounded-[28px] border-2 border-dashed border-[#f59e0b]/60 bg-[#fffbeb] px-4 py-3">
          <MegaphoneIcon weight="fill" className="size-6 shrink-0 text-[#b45309]" />
          <p className="flex-1 text-[14px] font-bold leading-tight text-[#78350f]">Reklam vermek için</p>
          <p className="text-[12.5px] font-semibold text-[#b45309]">İletişim →</p>
        </div>

        <div className="flex flex-col rounded-[28px] bg-[linear-gradient(180deg,#bfe3ff_0%,#e8f5ff_100%)] p-4">
          <p className="flex items-center justify-between text-[13px] font-semibold text-[#0c4a6e]">
            {WEATHER.place}
            <SunIcon weight="fill" className="size-8 text-[#f59e0b]" />
          </p>
          <p className="mt-2 text-[44px] font-extrabold leading-none tracking-tighter text-[#0c4a6e]">{WEATHER.temp}°</p>
          <p className="text-[13px] text-[#0c4a6e]/80">{WEATHER.sky}</p>
          <span className="mt-2 self-start rounded-full bg-white/80 px-2.5 py-1 text-[11.5px] font-bold text-[#047857]">{WEATHER.hint}</span>
        </div>
        <div className="flex flex-col rounded-[28px] bg-white p-4 shadow-sm">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#ffe4e6] text-[#be123c]">
            <StorefrontIcon weight="fill" className="size-5" />
          </span>
          <p className="mt-auto text-[38px] font-extrabold leading-none tracking-tight">{MARKET.count}</p>
          <p className="text-[13px] text-black/50">ilan · +{MARKET.today} bugün</p>
        </div>

        <section className="col-span-2 rounded-[28px] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-extrabold tracking-tight">Forum</h2>
            <span className="flex size-9 items-center justify-center rounded-full bg-[#16181d] text-white">
              <PlusIcon weight="bold" className="size-4" />
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 rounded-full bg-[#f2f3f5] p-1 text-center text-[12.5px] font-semibold">
            <span className="rounded-full bg-white py-1.5 shadow-sm">Son konular</span>
            <span className="py-1.5 text-black/50">Son yanıtlar</span>
            <span className="py-1.5 text-black/50">Popüler</span>
          </div>
          <ul className="mt-2">
            {TOPICS.slice(0, 6).map((t) => (
              <li key={t.title} className="flex items-center gap-3 border-b border-black/5 py-3 last:border-0">
                {t.photo ? (
                  <Image src={t.photo} alt="" width={96} height={96} className="size-12 shrink-0 rounded-2xl object-cover" />
                ) : (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[13px] font-bold text-[#4338ca]">{t.initials}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[14.5px] font-bold leading-snug">{t.title}</p>
                  <p className="mt-0.5 text-[12px] text-black/45">{t.section} · {t.ago}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#f2f3f5] px-2 py-1 text-[12px] font-bold">
                  <ChatCircleTextIcon weight="bold" className="size-3.5" />
                  {t.replies}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-[#f2f3f5] py-3 text-[14px] font-bold">
            Daha fazla göster <CaretDownIcon weight="bold" className="size-4" />
          </p>
        </section>
      </div>

      <nav className="fixed inset-x-4 bottom-4 grid grid-cols-4 gap-1 rounded-full bg-white p-1.5 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.25)]">
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className={`flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[10.5px] font-semibold ${i === 0 ? "bg-[#16181d] text-white" : "text-black/50"}`}>
              <Icon weight={i === 0 ? "fill" : "bold"} className="size-5" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
