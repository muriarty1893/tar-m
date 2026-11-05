import Image from "next/image";
import { ArrowRightIcon, BellIcon, CalendarDotsIcon, ChatsCircleIcon, HouseIcon, MagnifyingGlassIcon, MegaphoneIcon, PlusIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { spaceGrotesk } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

const box = "border-[3px] border-black shadow-[4px_4px_0_#000]";
const TAG: Record<string, string> = { bitki: "bg-[#7ae582]", hayvan: "bg-[#ffb35c]", makine: "bg-[#8ecae6]", destek: "bg-[#ff90e8]", pazar: "bg-[#ffde59]", genel: "bg-white" };

/** 3 · Neubrutal: cream paper, thick black outlines, hard offset shadows, flat loud colours, capitals. */
export function D03Brutal() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  return (
    <div id="tasarim-onizleme" className={`${spaceGrotesk.className} min-h-dvh bg-[#fff8e1] pb-24 text-black`}>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b-[3px] border-black bg-[#ffde59] px-3">
        <span className="flex size-10 items-center justify-center border-[3px] border-black bg-white">
          <Image src="/brand/logo.webp" alt="" width={56} height={56} className="size-7" />
        </span>
        <span className="flex-1 text-[17px] font-bold uppercase leading-none tracking-tight">Çiftçi<br />Destek</span>
        {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
          <span key={i} className={`relative flex size-10 items-center justify-center bg-white ${box} shadow-[3px_3px_0_#000]`}>
            <Icon weight="bold" className="size-5" />
            <span className="absolute -right-2 -top-2 border-2 border-black bg-[#ff5252] px-1 text-[11px] font-bold text-white">{i ? BADGES.messages : BADGES.notifications}</span>
          </span>
        ))}
        <span className={`flex size-10 items-center justify-center bg-[#7ae582] text-[14px] font-bold ${box} shadow-[3px_3px_0_#000]`}>{USER.initials}</span>
      </header>

      <div className="space-y-4 p-3.5">
        <div className={`flex h-12 items-center gap-2 bg-white px-3 text-[14px] font-bold uppercase text-black/50 ${box}`}>
          <MagnifyingGlassIcon weight="bold" className="size-5 text-black" />
          Forumda, Pazar’da ara
        </div>

        <div className={`relative bg-[#4d7cfe] p-4 text-white ${box}`}>
          <span className="absolute -top-3 right-4 rotate-[4deg] border-2 border-black bg-[#ffde59] px-2 text-[12px] font-bold text-black">ÖRNEK SPONSOR</span>
          <p className="text-[24px] font-bold uppercase leading-none">{SPONSOR.name}</p>
          <p className="mt-1 text-[15px] font-medium">{SPONSOR.tagline}</p>
          <span className="mt-3 inline-flex items-center gap-1 border-[3px] border-black bg-white px-3 py-1 text-[14px] font-bold uppercase text-black">
            İncele <ArrowRightIcon weight="bold" className="size-4" />
          </span>
        </div>

        <div className={`flex items-center gap-3 bg-[#ff90e8] p-3 ${box}`}>
          <MegaphoneIcon weight="fill" className="size-7" />
          <span className="flex-1 text-[15px] font-bold uppercase leading-tight">Reklam vermek için</span>
          <span className="border-2 border-black bg-white px-2 py-0.5 text-[13px] font-bold uppercase">İletişim</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`bg-[#7ae582] p-3 ${box}`}>
            <p className="flex items-center justify-between text-[13px] font-bold uppercase">
              {WEATHER.place} <SunIcon weight="fill" className="size-6" />
            </p>
            <p className="text-[42px] font-bold leading-none">{WEATHER.temp}°</p>
            <p className="mt-1 text-[12.5px] font-bold uppercase">{WEATHER.hint}</p>
          </div>
          <div className={`bg-[#ffb35c] p-3 ${box}`}>
            <p className="flex items-center justify-between text-[13px] font-bold uppercase">
              Pazar <StorefrontIcon weight="fill" className="size-6" />
            </p>
            <p className="text-[42px] font-bold leading-none">{MARKET.count}</p>
            <p className="mt-1 text-[12.5px] font-bold uppercase">ilan · +{MARKET.today} bugün</p>
          </div>
        </div>

        <section>
          <div className={`flex items-center justify-between bg-black px-3 py-2.5 text-white ${box}`}>
            <h2 className="text-[22px] font-bold uppercase">Forum</h2>
            <span className="flex items-center gap-1 border-2 border-white bg-[#ffde59] px-2 py-1 text-[13px] font-bold uppercase text-black">
              <PlusIcon weight="bold" className="size-4" /> Konu aç
            </span>
          </div>
          <div className="mt-3 flex gap-2 text-[13px] font-bold uppercase">
            <span className={`bg-black px-3 py-1.5 text-white ${box} shadow-[3px_3px_0_#000]`}>Son</span>
            <span className={`bg-white px-3 py-1.5 ${box} shadow-[3px_3px_0_#000]`}>Yanıtlanan</span>
            <span className={`bg-white px-3 py-1.5 ${box} shadow-[3px_3px_0_#000]`}>Popüler</span>
          </div>
          <ul className="mt-4 space-y-3.5">
            {TOPICS.slice(0, 6).map((t) => (
              <li key={t.title} className={`relative bg-white p-3 pr-14 ${box}`}>
                <span className={`border-2 border-black px-1.5 text-[11px] font-bold uppercase ${TAG[t.sectionId]}`}>{t.section}</span>
                <p className="mt-2 text-[16px] font-bold leading-snug">{t.title}</p>
                <p className="mt-1 text-[12.5px] font-medium text-black/60">{t.author} · {t.ago}</p>
                <span className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full border-[3px] border-black bg-[#ffde59] text-[14px] font-bold">{t.replies}</span>
              </li>
            ))}
          </ul>
          <p className={`mt-5 bg-[#ffde59] py-3 text-center text-[16px] font-bold uppercase ${box}`}>Daha fazla göster ↓</p>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t-[3px] border-black bg-white">
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className={`flex flex-col items-center gap-0.5 border-black py-2 text-[10.5px] font-bold uppercase ${i === 0 ? "bg-[#ffde59]" : ""} ${i < 3 ? "border-r-[3px]" : ""}`}>
              <Icon weight={i === 0 ? "fill" : "bold"} className="size-6" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
