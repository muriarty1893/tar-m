import Image from "next/image";
import { siteConfig } from "@/config/site";
import { BellIcon, CalendarDotsIcon, ChatCircleTextIcon, ChatsCircleIcon, DropIcon, HeartIcon, HouseIcon, MagnifyingGlassIcon, MegaphoneIcon, PlusIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { nunito } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

// Clay: soft outer shadow down-right, a light one up-left, a faint inner highlight.
const clay = "shadow-[8px_8px_18px_rgba(150,165,195,0.45),-6px_-6px_14px_rgba(255,255,255,0.95),inset_2px_2px_3px_rgba(255,255,255,0.7)]";
const AVATAR = ["bg-[#ffd6a5]", "bg-[#caffbf]", "bg-[#a0c4ff]", "bg-[#ffc6ff]", "bg-[#fdffb6]", "bg-[#9bf6ff]"];

/** 5 · Kil (claymorphism): pastel, puffy, rounded like toys; every topic a soft card of its own. */
export function D05Kil() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  return (
    <div id="tasarim-onizleme" className={`${nunito.className} min-h-dvh bg-[#eaf0fb] pb-28 text-[#2b3a55]`}>
      <header className="sticky top-0 z-10 flex items-center gap-2.5 bg-[#eaf0fb]/95 px-4 pb-3 pt-4 backdrop-blur">
        <span className={`flex flex-1 items-center gap-2 rounded-full bg-[#eaf0fb] py-1.5 pl-1.5 pr-4 ${clay}`}>
          <Image src="/brand/logo.webp" alt="" width={64} height={64} className="size-9" />
          <span className="text-[17px] font-black">{siteConfig.name}</span>
        </span>
        {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
          <span key={i} className={`relative flex size-11 items-center justify-center rounded-full bg-[#eaf0fb] ${clay}`}>
            <Icon weight="fill" className="size-5 text-[#5b6b8c]" />
            <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-[#ff8fab] text-[10px] font-black text-white">{i ? BADGES.messages : BADGES.notifications}</span>
          </span>
        ))}
        <span className={`flex size-11 items-center justify-center rounded-full bg-[#b9fbc0] text-[14px] font-black ${clay}`}>{USER.initials}</span>
      </header>

      <div className="space-y-5 px-4 pt-2">
        <div className="flex h-12 items-center gap-2.5 rounded-full bg-[#e2e9f6] px-5 text-[15px] font-semibold text-[#2b3a55]/45 shadow-[inset_4px_4px_8px_rgba(150,165,195,0.45),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]">
          <MagnifyingGlassIcon weight="bold" className="size-5" /> Forumda ve Pazar’da ara
        </div>

        <div className={`flex items-center gap-3 rounded-[28px] bg-gradient-to-br from-[#a0e7e5] to-[#b4f8c8] p-4 ${clay}`}>
          <span className={`flex size-14 items-center justify-center rounded-[20px] bg-white ${clay}`}>
            <DropIcon weight="fill" className="size-7 text-[#3a86ff]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wide text-[#2b3a55]/60">Sponsor · örnek</p>
            <p className="text-[19px] font-black leading-tight">{SPONSOR.name}</p>
            <p className="text-[13.5px] font-semibold text-[#2b3a55]/75">{SPONSOR.tagline}</p>
          </div>
        </div>

        <div className={`flex items-center gap-3 rounded-[24px] bg-[#ffe5d9] px-4 py-3 ${clay}`}>
          <MegaphoneIcon weight="fill" className="size-6 text-[#f3722c]" />
          <span className="flex-1 text-[15px] font-black">Reklam vermek için</span>
          <span className={`rounded-full bg-white px-3 py-1 text-[13px] font-black text-[#f3722c] ${clay}`}>İletişim</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-[28px] bg-[#cde7ff] p-4 ${clay}`}>
            <SunIcon weight="fill" className="size-10 text-[#ffb703] drop-shadow-[2px_3px_0_rgba(0,0,0,0.08)]" />
            <p className="mt-1 text-[38px] font-black leading-none">{WEATHER.temp}°</p>
            <p className="text-[13px] font-bold text-[#2b3a55]/70">{WEATHER.place} · {WEATHER.sky}</p>
            <p className="mt-1 text-[12.5px] font-black text-[#2a9d8f]">{WEATHER.hint}</p>
          </div>
          <div className={`rounded-[28px] bg-[#ffd6e0] p-4 ${clay}`}>
            <StorefrontIcon weight="fill" className="size-10 text-[#e5383b] drop-shadow-[2px_3px_0_rgba(0,0,0,0.08)]" />
            <p className="mt-1 text-[38px] font-black leading-none">{MARKET.count}</p>
            <p className="text-[13px] font-bold text-[#2b3a55]/70">ilan pazarda</p>
            <p className="mt-1 text-[12.5px] font-black text-[#e5383b]">+{MARKET.today} bugün</p>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-black">Forum</h2>
            <span className={`flex items-center gap-1 rounded-full bg-[#b9fbc0] px-4 py-2 text-[14px] font-black ${clay}`}>
              <PlusIcon weight="bold" className="size-4" /> Konu aç
            </span>
          </div>
          <div className="mt-3 flex gap-2.5 text-[13.5px] font-black">
            <span className={`rounded-full bg-[#2b3a55] px-4 py-2 text-white ${clay}`}>Son konular</span>
            <span className={`rounded-full bg-[#eaf0fb] px-4 py-2 ${clay}`}>Son yanıtlar</span>
            <span className={`rounded-full bg-[#eaf0fb] px-4 py-2 ${clay}`}>Popüler</span>
          </div>
          <ul className="mt-4 space-y-4">
            {TOPICS.slice(0, 5).map((t, i) => (
              <li key={t.title} className={`rounded-[26px] bg-white p-4 ${clay}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`flex size-10 items-center justify-center rounded-2xl text-[13px] font-black ${AVATAR[i % AVATAR.length]}`}>{t.initials}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-black">{t.author}</p>
                    <p className="text-[12px] font-semibold text-[#2b3a55]/55">{t.section} · {t.ago}</p>
                  </div>
                </div>
                <p className="mt-2.5 text-[16.5px] font-extrabold leading-snug">{t.title}</p>
                <div className="mt-3 flex gap-2 text-[12.5px] font-black">
                  <span className="flex items-center gap-1 rounded-full bg-[#eaf0fb] px-3 py-1"><ChatCircleTextIcon weight="fill" className="size-4 text-[#3a86ff]" />{t.replies} yanıt</span>
                  <span className="flex items-center gap-1 rounded-full bg-[#fff0f3] px-3 py-1"><HeartIcon weight="fill" className="size-4 text-[#ff4d6d]" />{t.likes}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className={`mt-5 rounded-full bg-[#eaf0fb] py-3.5 text-center text-[15px] font-black ${clay}`}>Daha fazla göster</p>
        </section>
      </div>

      <nav className={`fixed inset-x-0 bottom-0 grid grid-cols-4 rounded-t-[32px] bg-[#eaf0fb] px-2 pb-3 pt-2 ${clay}`}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className={`mx-1 flex flex-col items-center gap-0.5 rounded-[20px] py-1.5 text-[10.5px] font-black ${i === 0 ? `bg-[#b9fbc0] ${clay}` : "text-[#2b3a55]/55"}`}>
              <Icon weight="fill" className="size-6" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
