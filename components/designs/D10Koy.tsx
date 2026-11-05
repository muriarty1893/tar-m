import Image from "next/image";
import { siteConfig } from "@/config/site";
import { BellIcon, CalendarDotsIcon, ChatsCircleIcon, HouseIcon, LeafIcon, MagnifyingGlassIcon, MegaphoneIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { nunito, robotoSlab } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

const slab = robotoSlab.className;
const C = { paper: "#f3e7cf", ink: "#3b2a1a", olive: "#56652a", terra: "#b04a24", mustard: "#d9a21b", wood: "#7a4a26" };

/** 10 · Köy Pazarı (retro): kraft paper, a wooden sign for the sponsor, a ticket for the ad, stamps, a slab serif. */
export function D10Koy() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  return (
    <div id="tasarim-onizleme" className={`${nunito.className} min-h-dvh pb-24`} style={{ background: C.paper, color: C.ink, backgroundImage: "radial-gradient(rgba(59,42,26,0.07) 1px, transparent 1px)", backgroundSize: "14px 14px" }}>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-2 px-4 shadow-[0_3px_0_rgba(0,0,0,0.15)]" style={{ background: C.olive, color: C.paper }}>
        <Image src="/brand/logo.webp" alt="" width={64} height={64} className="size-10 rounded-full ring-2 ring-[#f3e7cf]" />
        <div className="min-w-0 flex-1 leading-none">
          <p className={`${slab} text-[19px] font-bold`}>{siteConfig.name}</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">Çiftçinin meydanı</p>
        </div>
        {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
          <span key={i} className="relative p-1.5">
            <Icon weight="fill" className="size-6" />
            <span className="absolute -right-0.5 top-0 flex size-[18px] items-center justify-center rounded-full text-[10px] font-black" style={{ background: C.mustard, color: C.ink }}>{i ? BADGES.messages : BADGES.notifications}</span>
          </span>
        ))}
        <span className={`${slab} flex size-9 items-center justify-center rounded-full text-[13px] font-bold`} style={{ background: C.paper, color: C.olive }}>{USER.initials}</span>
      </header>

      <div className="space-y-4 px-4 pt-4">
        <div className="flex h-12 items-center gap-2 rounded-xl border-2 border-dashed px-4 text-[15px] font-semibold opacity-80" style={{ borderColor: `${C.ink}66`, background: "#fbf4e3" }}>
          <MagnifyingGlassIcon weight="bold" className="size-5" /> Forumda ve Pazar’da ara
        </div>

        <div className="relative -rotate-[0.6deg] rounded-md px-5 py-4 text-center shadow-[0_6px_0_rgba(0,0,0,0.25)]" style={{ background: C.wood, color: "#fbefd5", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 2px, transparent 2px 22px)" }}>
          {[["left-2 top-2"], ["right-2 top-2"], ["left-2 bottom-2"], ["right-2 bottom-2"]].map(([pos]) => (
            <span key={pos} className={`absolute ${pos} size-2 rounded-full bg-[#2a1a0e]/70`} />
          ))}
          <p className="text-[11px] font-black uppercase tracking-[0.25em] opacity-80">Sponsor</p>
          <p className={`${slab} text-[26px] font-bold leading-tight`}>{SPONSOR.name}</p>
          <p className="text-[14.5px] font-semibold">{SPONSOR.tagline}</p>
          <span className={`${slab} absolute -right-2 -top-3 rotate-12 rounded-full border-2 px-2 py-1 text-[11px] font-bold`} style={{ borderColor: C.terra, color: C.terra, background: C.paper }}>ÖRNEK</span>
        </div>

        <div className="relative flex items-center gap-3 border-2 border-dashed px-5 py-3" style={{ borderColor: C.ink, background: C.mustard }}>
          <span className="absolute -left-2 top-1/2 size-4 -translate-y-1/2 rounded-full" style={{ background: C.paper }} />
          <span className="absolute -right-2 top-1/2 size-4 -translate-y-1/2 rounded-full" style={{ background: C.paper }} />
          <MegaphoneIcon weight="fill" className="size-6" />
          <span className={`${slab} flex-1 text-[16px] font-bold`}>Reklam vermek için</span>
          <span className="text-[13px] font-black uppercase tracking-wide">İletişim →</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: WEATHER.place, value: `${WEATHER.temp}°`, note: WEATHER.hint, Icon: SunIcon },
            { label: "Pazar", value: String(MARKET.count), note: `ilan · +${MARKET.today} bugün`, Icon: StorefrontIcon },
          ].map(({ label, value, note, Icon }) => (
            <div key={label} className="rounded-md border-[3px] border-double p-3" style={{ borderColor: C.ink, background: "#fbf4e3" }}>
              <p className="flex items-center justify-between text-[12px] font-black uppercase tracking-[0.14em]">{label}<Icon weight="fill" className="size-5" style={{ color: C.terra }} /></p>
              <p className={`${slab} text-[40px] font-bold leading-none`}>{value}</p>
              <p className="mt-1 text-[12.5px] font-bold" style={{ color: C.olive }}>{note}</p>
            </div>
          ))}
        </div>

        <section className="pt-2">
          <div className="flex items-center gap-2">
            <LeafIcon weight="fill" className="size-6" style={{ color: C.olive }} />
            <h2 className={`${slab} flex-1 text-[26px] font-bold`}>Köy Kahvesi</h2>
            <span className={`${slab} rounded-md px-3 py-1.5 text-[14px] font-bold text-[#fbefd5]`} style={{ background: C.terra }}>Konu aç</span>
          </div>
          <p className="text-[13px] font-semibold opacity-70">Forum: sorun, anlatın, yanıtlayın</p>
          <div className="mt-3 flex gap-4 border-b-2 text-[14px] font-black" style={{ borderColor: C.ink }}>
            <span className="-mb-0.5 border-b-4 pb-1" style={{ borderColor: C.terra }}>Son konular</span>
            <span className="pb-1 opacity-55">Son yanıtlar</span>
            <span className="pb-1 opacity-55">Popüler</span>
          </div>
          <ul style={{ backgroundImage: `repeating-linear-gradient(transparent 0 calc(100% - 1px), ${C.ink}22 calc(100% - 1px) 100%)` }}>
            {TOPICS.slice(0, 6).map((t) => (
              <li key={t.title} className="border-b py-3.5" style={{ borderColor: `${C.ink}33` }}>
                <span className="rounded-full border-2 px-2 text-[10.5px] font-black uppercase tracking-wide" style={{ borderColor: C.olive, color: C.olive }}>{t.section}</span>
                <p className={`${slab} mt-1.5 text-[17px] font-bold leading-snug`}>{t.title}</p>
                <p className="mt-1 text-[12.5px] font-semibold opacity-70">
                  {t.author} · {t.ago} · <b style={{ color: C.terra }}>{t.replies} yanıt</b>
                </p>
              </li>
            ))}
          </ul>
          <p className={`${slab} mt-4 rounded-md py-3 text-center text-[16px] font-bold text-[#fbefd5] shadow-[0_4px_0_rgba(0,0,0,0.25)]`} style={{ background: C.terra }}>Daha fazla göster</p>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 pb-2 pt-1.5" style={{ background: C.olive, color: C.paper }}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className="flex flex-col items-center gap-0.5 text-[10.5px] font-black" style={{ color: i === 0 ? C.mustard : C.paper }}>
              <Icon weight={i === 0 ? "fill" : "regular"} className="size-6" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
