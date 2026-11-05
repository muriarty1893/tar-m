import Image from "next/image";
import { siteConfig } from "@/config/site";
import { BellIcon, CalendarDotsIcon, ChatsCircleIcon, HouseIcon, MagnifyingGlassIcon, SquaresFourIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { libreBodoni, publicSans } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

const serif = libreBodoni.className;

/** 6 · Gazete (editorial): newsprint, a serif masthead, rules and small capitals; the forum as the day's news. */
export function D06Gazete() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  const [lead, ...rest] = TOPICS;
  return (
    <div id="tasarim-onizleme" className={`${publicSans.className} min-h-dvh bg-[#f6f1e7] pb-20 text-[#1b1b18]`}>
      <div className="flex items-center justify-between border-b border-[#1b1b18]/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
        <span>Perşembe, 5 Kasım 2026</span>
        <span className="flex items-center gap-3">
          <span className="relative"><BellIcon weight="regular" className="size-5" /><span className="absolute -right-1.5 -top-1 text-[9px] font-bold text-[#9b1c1c]">{BADGES.notifications}</span></span>
          <span className="relative"><ChatsCircleIcon weight="regular" className="size-5" /><span className="absolute -right-1.5 -top-1 text-[9px] font-bold text-[#9b1c1c]">{BADGES.messages}</span></span>
          <span className="flex size-6 items-center justify-center rounded-full border border-[#1b1b18] text-[10px] font-bold">{USER.initials}</span>
        </span>
      </div>
      <header className="px-4 pb-2 pt-4 text-center">
        <p className={`${serif} flex items-center justify-center gap-2 text-[40px] font-bold leading-none tracking-tight`}>
          <Image src="/brand/logo.webp" alt="" width={72} height={72} className="size-9" />
          {siteConfig.name}
        </p>
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1b1b18]/60">Forum · Pazar · Hava · Takvim</p>
        <div className="mt-3 border-y-[3px] border-double border-[#1b1b18] py-0.5" />
      </header>

      <div className="mx-4 flex items-center gap-2 border-b border-[#1b1b18] py-2 text-[15px] italic text-[#1b1b18]/50">
        <MagnifyingGlassIcon weight="regular" className="size-4 not-italic" /> <span className={serif}>Forumda ve Pazar’da ara…</span>
      </div>

      <div className="mx-4 mt-4 border border-[#1b1b18] p-3 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1b1b18]/60">Sponsorlu ilan · örnek</p>
        <p className={`${serif} mt-1 text-[26px] font-bold leading-tight`}>{SPONSOR.name}</p>
        <p className={`${serif} text-[16px] italic`}>“{SPONSOR.tagline}”</p>
      </div>
      <p className={`${serif} mx-4 mt-2 text-center text-[14px] italic text-[#1b1b18]/70`}>
        Bu köşede sizin reklamınız olabilir — <span className="not-italic underline underline-offset-2">iletişim</span>
      </p>

      <div className="mx-4 mt-4 grid grid-cols-2 border-y border-[#1b1b18]">
        <div className="border-r border-[#1b1b18] py-3 pr-3">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#9b1c1c]">Hava raporu</p>
          <p className={`${serif} mt-1 text-[15px] leading-snug`}>
            <b className="text-[24px]">{WEATHER.temp}°</b> {WEATHER.place}’da {WEATHER.sky.toLocaleLowerCase("tr")}. {WEATHER.hint}.
          </p>
        </div>
        <div className="py-3 pl-3">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#9b1c1c]">Pazar</p>
          <p className={`${serif} mt-1 text-[15px] leading-snug`}>
            <b className="text-[24px]">{MARKET.count}</b> ilan, bugün {MARKET.today} yeni. Öne çıkan: {MARKET.newest.title.split(" (")[0]}.
          </p>
        </div>
      </div>

      <section className="px-4 pt-5">
        <div className="flex items-baseline justify-between border-b-2 border-[#1b1b18] pb-1">
          <h2 className={`${serif} text-[26px] font-bold`}>Gündem</h2>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] underline underline-offset-4">Konu aç</span>
        </div>
        <p className="mt-2 flex gap-3 text-[11px] font-bold uppercase tracking-[0.16em]">
          <span>Son</span><span className="text-[#1b1b18]/40">|</span><span className="text-[#1b1b18]/50">Yanıtlanan</span><span className="text-[#1b1b18]/40">|</span><span className="text-[#1b1b18]/50">Çok okunan</span>
        </p>
        <article className="mt-3 border-b border-[#1b1b18]/30 pb-4">
          {lead.photo && <Image src={lead.photo} alt="" width={720} height={400} className="aspect-[16/9] w-full object-cover grayscale-[35%]" />}
          <p className="mt-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#9b1c1c]">{lead.section}</p>
          <h3 className={`${serif} mt-1 text-[25px] font-bold leading-[1.1]`}>{lead.title}</h3>
          <p className={`${serif} mt-2 text-[15.5px] leading-snug text-[#1b1b18]/80`}>{lead.excerpt}</p>
          <p className="mt-2 text-[11.5px] uppercase tracking-[0.12em] text-[#1b1b18]/60">{lead.author} · {lead.ago} · {lead.replies} yanıt</p>
        </article>
        <ul>
          {rest.slice(0, 5).map((t) => (
            <li key={t.title} className="border-b border-[#1b1b18]/30 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b1c1c]">{t.section}</p>
              <p className={`${serif} mt-0.5 text-[18px] font-bold leading-snug`}>{t.title}</p>
              <p className="mt-1 text-[11.5px] uppercase tracking-[0.12em] text-[#1b1b18]/55">{t.author} · {t.ago} · {t.replies} yanıt</p>
            </li>
          ))}
        </ul>
        <p className={`${serif} py-4 text-center text-[16px] italic underline underline-offset-4`}>Daha fazla göster</p>
      </section>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t-[3px] border-double border-[#1b1b18] bg-[#f6f1e7]">
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] ${i === 0 ? "text-[#9b1c1c]" : "text-[#1b1b18]/60"}`}>
              <Icon weight={i === 0 ? "fill" : "regular"} className="size-5" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
