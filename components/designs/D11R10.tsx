import Image from "next/image";
import { BellIcon, CalendarDotsIcon, ChatsCircleIcon, CowIcon, DotsNineIcon, FolderIcon, HandCoinsIcon, HouseIcon, ListIcon, MagnifyingGlassIcon, NewspaperIcon, PlantIcon, SquaresFourIcon, StorefrontIcon, SunIcon, TractorIcon, ChartLineUpIcon, ChatsTeardropIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { openSans } from "./fonts";
import { BADGES, MARKET, NAV, SECTIONS, SPONSOR, TOPICS, USER, WEATHER, type SectionId } from "./sample";

// r10.net's own palette and type: #e8eaec page, #3f4257 / #494c62 slate bars, #515365 text, #38a9ff folders, Open Sans 13 px.
const R = { page: "#e8eaec", box: "#f4f6f9", line: "#d8dbe2", tab: "#3f4257", head: "#494c62", text: "#515365", blue: "#38a9ff" };
const TAG = { green: "#2e9e3e", red: "#d32f2f", blue: "#1e6fd9", orange: "#e67e22" } as const;
const ICON: Record<SectionId, typeof PlantIcon> = { bitki: PlantIcon, hayvan: CowIcon, makine: TractorIcon, destek: HandCoinsIcon, pazar: ChartLineUpIcon, genel: ChatsTeardropIcon };
const GROUPS: { title: string; ids: SectionId[] }[] = [
  { title: "Üretim", ids: ["bitki", "hayvan", "makine"] },
  { title: "Pazar, Destek ve Genel", ids: ["pazar", "destek", "genel"] },
];

/** 11 · r10.net: its layout and colours, with the site's own name and logo. */
export function D11R10() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  const byId = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));
  return (
    <div id="tasarim-onizleme" className={`${openSans.className} min-h-dvh pb-16 text-[13px]`} style={{ background: R.page, color: R.text }}>
      <header className="flex h-[62px] items-center gap-2.5 border-b bg-white px-2.5" style={{ borderColor: R.line }}>
        <Image src="/brand/logo.webp" alt="" width={84} height={84} className="size-11" />
        <div className="leading-none">
          <p className="text-[19px] font-extrabold tracking-tight text-[#3f4257]">ÇİFTÇİ DESTEK</p>
          <p className="mt-0.5 text-[11px] font-semibold text-[#3f4257]/70">Çiftçinin forumu</p>
        </div>
        <span className="ml-1 flex size-9 items-center justify-center rounded border" style={{ borderColor: R.line }}><DotsNineIcon weight="bold" className="size-5" /></span>
        <span className="ml-auto flex h-full items-center gap-0.5 border-l pl-2" style={{ borderColor: R.line }}>
          {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
            <span key={i} className="relative p-1.5">
              <Icon weight="regular" className="size-6" />
              <span className="absolute right-0 top-0 flex size-[18px] items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: R.blue }}>{i ? BADGES.messages : BADGES.notifications}</span>
            </span>
          ))}
          <span className="ml-1 flex size-8 items-center justify-center rounded-full bg-[#3f4257] text-[11px] font-bold text-white">{USER.initials}</span>
        </span>
      </header>

      <div className="p-2.5">
        <div className="flex overflow-hidden rounded border bg-white" style={{ borderColor: R.line }}>
          <span className="flex flex-1 items-center gap-2 px-3 py-2 text-[#9aa0ad]"><MagnifyingGlassIcon className="size-4" />Forumda ve Pazar’da ara</span>
          <span className="px-4 py-2 font-bold text-white" style={{ background: R.blue }}>Ara</span>
        </div>
      </div>

      {/* The sponsor strip, under the search as on the live home page. */}
      <div className="relative bg-[#1565d8] px-10 py-2 text-center text-[13.5px] font-bold leading-snug text-white">
        {SPONSOR.name.toLocaleUpperCase("tr")} <span className="rounded bg-[#ffd54f] px-1 text-[10px] text-[#3f4257]">ÖRNEK</span> — {SPONSOR.tagline} →
        <span className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/20"><XIcon weight="bold" className="size-3.5" /></span>
      </div>

      {/* Coloured strips, as r10's sponsor rows: the "advertise here" one. */}
      <div className="relative flex items-center gap-2 bg-[#f57c00] px-3 py-2 pr-10 font-bold text-white">
        <span className="text-[15px] font-extrabold italic tracking-tight">REKLAM</span>
        <span className="border-l border-white/60 pl-2 text-[13px] leading-tight">Bu alanda reklam vermek için tıklayın · İletişim →</span>
        <span className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/25"><XIcon weight="bold" className="size-3.5" /></span>
      </div>

      <div className="space-y-2.5 p-2.5">

        <div className="grid grid-cols-2 gap-2.5">
          {[
            { title: "Hava Durumu", Icon: SunIcon, big: `${WEATHER.place} ${WEATHER.temp}°`, small: `${WEATHER.sky} · ${WEATHER.hint}` },
            { title: "Pazar / İlan", Icon: StorefrontIcon, big: `${MARKET.count} ilan`, small: `Bugün ${MARKET.today} yeni ilan` },
          ].map(({ title, Icon, big, small }) => (
            <div key={title} className="overflow-hidden rounded border" style={{ borderColor: R.line, background: R.box }}>
              <p className="flex h-[30px] items-center gap-1.5 px-2.5 text-[12px] font-semibold text-white" style={{ background: R.head }}>
                <Icon weight="fill" className="size-3.5" /> {title}
              </p>
              <div className="px-2.5 py-2">
                <p className="text-[14px] font-bold">{big}</p>
                <p className="truncate text-[12px]">{small}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded border" style={{ borderColor: R.line, background: R.box }}>
          <div className="flex h-[45px] items-center gap-2 px-3 text-[14px] text-white" style={{ background: R.tab }}>
            <NewspaperIcon className="size-4" />
            <span className="border-b-2 border-white py-3 font-semibold">Son Açılan</span>
            <span className="py-3 text-white/60">Son Mesajlar</span>
            <span className="py-3 text-white/60">Popüler</span>
            <ListIcon weight="bold" className="ml-auto size-5" />
          </div>
          <ul className="px-3 py-1.5">
            {TOPICS.map((t) => (
              <li key={t.title} className="truncate py-[7px] text-[13px]">
                {t.tag && <b style={{ color: TAG[t.tag.tone] }}>{t.tag.label}: </b>}
                {t.title}
              </li>
            ))}
          </ul>
          <p className="border-t py-2.5 text-center font-semibold" style={{ borderColor: R.line, color: R.blue }}>Daha fazla göster</p>
        </div>

        {GROUPS.map((g) => (
          <div key={g.title} className="overflow-hidden rounded border" style={{ borderColor: R.line }}>
            <p className="flex h-[30px] items-center px-2.5 text-[12px] font-semibold text-white" style={{ background: R.head }}>{g.title}</p>
            <ul>
              {g.ids.map((id) => {
                const s = byId[id];
                const Icon = ICON[id];
                return (
                  <li key={id} className="flex border-b last:border-0" style={{ borderColor: R.line, background: R.box }}>
                    <span className="flex w-[50px] shrink-0 items-center justify-center border-r" style={{ borderColor: R.line }}>
                      <Icon weight="duotone" className="size-7" style={{ color: R.head }} />
                    </span>
                    <div className="min-w-0 flex-1 px-2.5 py-2.5">
                      <p className="flex items-baseline justify-between gap-2">
                        <span className="text-[13.5px] font-semibold">{s.name}</span>
                        <span className="shrink-0 text-[11px] text-[#8a8fa0]">{s.topics} konu · {s.replies} mesaj</span>
                      </p>
                      {s.subs.length > 0 && (
                        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          {s.subs.map((sub) => (
                            <span key={sub} className="flex items-center gap-1 text-[12.5px]">
                              <FolderIcon weight="fill" className="size-3.5" style={{ color: R.blue }} />
                              {sub}
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t bg-white" style={{ borderColor: R.line }}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className="flex flex-col items-center gap-0.5 py-1.5 text-[10.5px] font-semibold" style={{ color: i === 0 ? R.blue : R.text, borderTop: i === 0 ? `2px solid ${R.blue}` : "2px solid transparent" }}>
              <Icon weight={i === 0 ? "fill" : "regular"} className="size-6" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
