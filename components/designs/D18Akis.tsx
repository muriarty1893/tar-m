import Image from "next/image";
import { siteConfig } from "@/config/site";
import {
  BookmarkSimpleIcon,
  CalendarDotsIcon,
  CaretDownIcon,
  ChartLineUpIcon,
  ChatCircleIcon,
  ChatsCircleIcon,
  ChatsTeardropIcon,
  CowIcon,
  DotsThreeIcon,
  HandCoinsIcon,
  HeartIcon,
  HouseIcon,
  ImageIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  PaperPlaneTiltIcon,
  PlantIcon,
  PlusIcon,
  SquaresFourIcon,
  StorefrontIcon,
  SunIcon,
  TractorIcon,
} from "@phosphor-icons/react/dist/ssr";
import { outfit, workSans } from "./fonts";
import { BADGES, MARKET, NAV, SECTIONS, SPONSOR, TOPICS, USER, WEATHER, type SampleTopic, type SectionId } from "./sample";

// Social Media App (ui-ux-pro-max product match): Vibrant & Block-based; stories, a composer and a photo-first feed with
// a clear action row. Outfit + Work Sans (Geometric Modern), farm green with a harvest gradient for the story rings.
const C = { text: "#0f172a", muted: "#5b6576", line: "#e8ebef", green: "#15803d", rose: "#e11d48" };
const RING = "bg-[conic-gradient(from_200deg,#f59e0b,#16a34a,#0ea5e9,#f59e0b)]";
const ICON: Record<SectionId, typeof PlantIcon> = { bitki: PlantIcon, hayvan: CowIcon, makine: TractorIcon, destek: HandCoinsIcon, pazar: ChartLineUpIcon, genel: ChatsTeardropIcon };
const AVATAR = ["#dcfce7", "#e0f2fe", "#fef3c7", "#fce7f3", "#ede9fe", "#ffedd5"];
const SHORT: Record<SectionId, string> = { bitki: "Bitki", hayvan: "Hayvan", makine: "Makine", destek: "Destek", pazar: "Pazar", genel: "Genel" };

function Post({ t, i, head }: { t: SampleTopic; i: number; head: string }) {
  return (
    <article className="border-b py-3" style={{ borderColor: C.line }}>
      <div className="flex items-center gap-2.5 px-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold" style={{ background: AVATAR[i % AVATAR.length] }}>{t.initials}</span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[14.5px] font-semibold">{t.author} <span className="font-normal" style={{ color: C.muted }}>· {t.ago}</span></p>
          <p className="text-[12.5px] font-medium" style={{ color: C.green }}>{t.section}</p>
        </div>
        <DotsThreeIcon weight="bold" className="size-6" style={{ color: C.muted }} />
      </div>
      <p className={`${head} mt-2 px-4 text-[17px] font-semibold leading-snug`}>{t.title}</p>
      <p className="mt-0.5 px-4 text-[14.5px] leading-relaxed" style={{ color: "#334155" }}>{t.excerpt}</p>
      {t.photo && (
        <div className="mt-2.5 px-4">
          <Image src={t.photo} alt="" width={720} height={540} className="aspect-[4/3] w-full rounded-2xl object-cover" />
        </div>
      )}
      <div className="mt-1.5 flex items-center px-2 text-[13.5px] font-semibold" style={{ color: C.muted }}>
        <span className="flex min-h-11 items-center gap-1.5 px-2"><HeartIcon weight={i === 0 ? "fill" : "regular"} className="size-[22px]" style={i === 0 ? { color: C.rose } : undefined} />{t.likes}</span>
        <span className="flex min-h-11 items-center gap-1.5 px-2"><ChatCircleIcon weight="regular" className="size-[22px]" />{t.replies}</span>
        <span className="flex min-h-11 items-center gap-1.5 px-2"><PaperPlaneTiltIcon weight="regular" className="size-[22px]" /></span>
        <BookmarkSimpleIcon weight="regular" className="ml-auto mr-2 size-[22px]" />
      </div>
      <p className="px-4 text-[13px]" style={{ color: C.muted }}>Son yanıt: <b className="font-semibold" style={{ color: C.text }}>{t.lastBy}</b> · tüm yanıtları gör</p>
    </article>
  );
}

/** 18 · Akış (social feed): stories for the forum's sections, a composer and a photo-first feed; a phone-native feel. */
export function D18Akis() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  const head = outfit.className;
  const [a, b, ...rest] = TOPICS;
  return (
    <div id="tasarim-onizleme" className={`${workSans.className} min-h-dvh bg-white pb-20`} style={{ color: C.text }}>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-1 border-b bg-white/95 px-3 backdrop-blur" style={{ borderColor: C.line }}>
        <Image src="/brand/logo.webp" alt="" width={56} height={56} className="size-8" />
        <p className={`${head} ml-1.5 flex-1 text-[21px] font-bold tracking-tight`}>{siteConfig.name}</p>
        <span className="flex size-11 items-center justify-center"><MagnifyingGlassIcon weight="bold" className="size-6" /></span>
        {[HeartIcon, ChatsCircleIcon].map((Icon, i) => (
          <span key={i} className="relative flex size-11 items-center justify-center">
            <Icon weight="bold" className="size-6" />
            <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ring-2 ring-white" style={{ background: C.rose }}>{i ? BADGES.messages : BADGES.notifications}</span>
          </span>
        ))}
      </header>

      {/* Stories: one per forum section. */}
      <div className="flex gap-3.5 overflow-x-auto border-b px-3 py-3" style={{ borderColor: C.line }}>
        <span className="flex w-[68px] shrink-0 flex-col items-center gap-1">
          <span className="relative flex size-[64px] items-center justify-center rounded-full bg-[#f1f5f9] text-[16px] font-bold">
            {USER.initials}
            <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full text-white ring-2 ring-white" style={{ background: C.green }}><PlusIcon weight="bold" className="size-3.5" /></span>
          </span>
          <span className="text-[12px] font-medium">Konu aç</span>
        </span>
        {SECTIONS.map((s) => {
          const Icon = ICON[s.id];
          return (
            <span key={s.id} className="flex w-[68px] shrink-0 flex-col items-center gap-1">
              <span className={`flex size-[64px] items-center justify-center rounded-full p-[2.5px] ${RING}`}>
                <span className="flex size-full items-center justify-center rounded-full border-[3px] border-white bg-[#f0fdf4]">
                  <Icon weight="duotone" className="size-7" style={{ color: C.green }} />
                </span>
              </span>
              <span className="text-[12px] font-medium">{SHORT[s.id]}</span>
            </span>
          );
        })}
      </div>

      {/* Composer. */}
      <div className="flex items-center gap-2.5 border-b px-4 py-3" style={{ borderColor: C.line }}>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: C.green }}>{USER.initials}</span>
        <span className="flex h-11 flex-1 items-center rounded-full border px-4 text-[14.5px]" style={{ borderColor: C.line, color: C.muted }}>Ne sormak istersin, {USER.first}?</span>
        <ImageIcon weight="regular" className="size-6" style={{ color: C.green }} />
      </div>

      {/* Quick cards: weather, market, advertise. */}
      <div className="flex gap-2.5 overflow-x-auto px-4 py-3">
        <div className="flex w-[150px] shrink-0 flex-col rounded-2xl bg-gradient-to-br from-[#38bdf8] to-[#2563eb] p-3 text-white">
          <SunIcon weight="fill" className="size-7 text-[#fde047]" />
          <p className={`${head} mt-1 text-[30px] font-bold leading-none`}>{WEATHER.temp}°</p>
          <p className="text-[12.5px] font-medium">{WEATHER.place} · {WEATHER.sky}</p>
          <p className="mt-1.5 self-start rounded-full bg-white/25 px-2 py-0.5 text-[11.5px] font-semibold">{WEATHER.hint}</p>
        </div>
        <div className="relative w-[150px] shrink-0 overflow-hidden rounded-2xl text-white">
          <Image src={MARKET.newest.photo} alt="" fill sizes="150px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className={`${head} text-[24px] font-bold leading-none`}>{MARKET.count} ilan</p>
            <p className="text-[12px] font-medium">+{MARKET.today} bugün · Pazar</p>
          </div>
        </div>
        <div className="flex w-[150px] shrink-0 flex-col justify-between rounded-2xl bg-[#fff7ed] p-3">
          <MegaphoneIcon weight="fill" className="size-7 text-[#c2410c]" />
          <p className="text-[14px] font-bold leading-tight text-[#7c2d12]">Reklam vermek için</p>
          <p className="text-[12.5px] font-semibold text-[#c2410c]">İletişim →</p>
        </div>
      </div>

      <div className="flex gap-5 border-y px-4 text-[14px] font-semibold" style={{ borderColor: C.line }}>
        <span className="border-b-2 py-2.5" style={{ borderColor: C.text }}>Sana özel</span>
        <span className="py-2.5" style={{ color: C.muted }}>Son konular</span>
        <span className="py-2.5" style={{ color: C.muted }}>Popüler</span>
      </div>

      <Post t={a} i={0} head={head} />
      <Post t={b} i={1} head={head} />

      {/* Sponsored post. */}
      <article className="border-b py-3" style={{ borderColor: C.line }}>
        <div className="flex items-center gap-2.5 px-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#e0f2fe] text-[13px] font-bold text-[#0369a1]">SU</span>
          <div className="flex-1 leading-tight">
            <p className="text-[14.5px] font-semibold">{SPONSOR.name}</p>
            <p className="text-[12.5px]" style={{ color: C.muted }}>Sponsorlu · örnek</p>
          </div>
        </div>
        <div className="mx-4 mt-2.5 flex aspect-[16/9] flex-col justify-end rounded-2xl bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#065f46] p-4 text-white">
          <p className={`${head} text-[22px] font-bold leading-tight`}>{SPONSOR.tagline}</p>
        </div>
        <div className="mx-4 mt-2.5 flex items-center justify-between rounded-xl bg-[#f1f5f9] px-3 py-2.5">
          <span className="text-[13.5px] font-semibold">sukocu.com</span>
          <span className="rounded-lg px-3 py-1.5 text-[13px] font-bold text-white" style={{ background: C.text }}>İncele</span>
        </div>
      </article>

      {rest.slice(0, 2).map((t, i) => (
        <Post key={t.title} t={t} i={i + 2} head={head} />
      ))}
      <p className="mx-4 my-4 flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-[#f1f5f9] text-[14.5px] font-bold">
        Daha fazla göster <CaretDownIcon weight="bold" className="size-4" />
      </p>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t bg-white" style={{ borderColor: C.line }}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className="flex flex-col items-center gap-0.5 py-1.5 text-[10.5px] font-semibold" style={{ color: i === 0 ? C.text : C.muted }}>
              <Icon weight={i === 0 ? "fill" : "regular"} className="size-[25px]" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
