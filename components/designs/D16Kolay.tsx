import Image from "next/image";
import { siteConfig } from "@/config/site";
import { BellIcon, CalendarDotsIcon, CaretDownIcon, ChatCircleTextIcon, ChatsCircleIcon, CheckCircleIcon, DropIcon, HouseIcon, MagnifyingGlassIcon, PencilSimpleIcon, SquaresFourIcon, StorefrontIcon, SunIcon, TagIcon, WindIcon } from "@phosphor-icons/react/dist/ssr";
import { lexend, sourceSans } from "./fonts";
import { BADGES, MARKET, NAV, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

// Accessible & Ethical (ui-ux-pro-max): 7:1 text contrast, 18 px+ body, every icon with a word beside it, 56 px targets,
// meaning never by colour alone. Lexend headings, Source Sans 3 body. For older eyes and bright sunlight in the field.
const C = { text: "#111111", muted: "#3d3d3d", green: "#0a5c1f", greenBg: "#e6f4ea", line: "#9e9e9e", yellow: "#ffd60a", blue: "#0b4fb3" };

/** 16 · Kolay (large and clear): big type, labelled buttons, high contrast; easy to read outdoors and for older eyes. */
export function D16Kolay() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  const head = lexend.className;
  return (
    <div id="tasarim-onizleme" className={`${sourceSans.className} min-h-dvh bg-white pb-28 text-[18px]`} style={{ color: C.text }}>
      <header className="border-b-2 px-4 pb-3 pt-4" style={{ borderColor: C.text }}>
        <div className="flex items-center gap-3">
          <Image src="/brand/logo.webp" alt="" width={84} height={84} className="size-12" />
          <p className={`${head} flex-1 text-[23px] font-bold leading-tight`}>{siteConfig.name}</p>
          <span className="flex min-h-14 items-center gap-2 rounded-xl border-2 px-3 text-[17px] font-bold" style={{ borderColor: C.text }}>
            <span className="flex size-8 items-center justify-center rounded-full text-[14px] text-white" style={{ background: C.green }}>{USER.initials}</span>
            {USER.first}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            { Icon: BellIcon, label: "Bildirimler", n: BADGES.notifications },
            { Icon: ChatsCircleIcon, label: "Mesajlar", n: BADGES.messages },
          ].map(({ Icon, label, n }) => (
            <span key={label} className="flex min-h-14 items-center gap-2 rounded-xl border-2 px-3 text-[17px] font-bold" style={{ borderColor: C.text }}>
              <Icon weight="bold" className="size-6 shrink-0" />
              <span className="flex-1">{label}</span>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-[15px] font-bold" style={{ background: C.yellow }}>{n}</span>
            </span>
          ))}
        </div>
      </header>

      <div className="space-y-6 px-4 pt-5">
        <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "#f2f2f2" }}>
          <span className="text-[16px] font-semibold">Yazı boyutu</span>
          <span className="flex gap-1.5">
            {["A", "A", "A"].map((a, i) => (
              <span key={i} className={`flex size-12 items-center justify-center rounded-lg border-2 font-bold ${i === 1 ? "text-white" : ""}`} style={{ borderColor: C.text, background: i === 1 ? C.text : "#fff", fontSize: 15 + i * 5 }}>{a}</span>
            ))}
          </span>
        </div>

        <div>
          <p className={`${head} mb-2 text-[17px] font-semibold`}>Ne arıyorsunuz?</p>
          <div className="flex min-h-14 overflow-hidden rounded-xl border-2" style={{ borderColor: C.text }}>
            <span className="flex flex-1 items-center gap-2 px-3 text-[17px] text-[#555]"><MagnifyingGlassIcon weight="bold" className="size-6" style={{ color: C.text }} />Konu, ürün, ilan…</span>
            <span className="flex items-center px-5 text-[18px] font-bold text-white" style={{ background: C.green }}>Ara</span>
          </div>
        </div>

        <section className="rounded-2xl border-2 p-4" style={{ borderColor: C.text }}>
          <h2 className={`${head} flex items-center gap-2 text-[21px] font-bold`}><SunIcon weight="fill" className="size-7 text-[#b26b00]" /> Bugün {WEATHER.place}’da hava</h2>
          <p className={`${head} mt-2 text-[44px] font-bold leading-none`}>{WEATHER.temp} derece</p>
          <p className="mt-1 text-[19px]">{WEATHER.sky}. En düşük {WEATHER.min}, en yüksek {WEATHER.max} derece.</p>
          <p className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[18px] font-bold" style={{ background: C.greenBg, color: C.green }}>
            <CheckCircleIcon weight="fill" className="size-7 shrink-0" /> Evet, bugün {WEATHER.hint.toLocaleLowerCase("tr")}.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[17px]">
            <p className="flex items-center gap-2"><DropIcon weight="fill" className="size-6 text-[#0b4fb3]" /> Yağmur: %{WEATHER.rain}</p>
            <p className="flex items-center gap-2"><WindIcon weight="bold" className="size-6" /> Rüzgâr: {WEATHER.wind} km/s</p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <span className="flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-2xl text-[19px] font-bold text-white" style={{ background: C.green }}>
            <PencilSimpleIcon weight="bold" className="size-8" /> Soru sor
          </span>
          <span className="flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-2xl border-2 text-[19px] font-bold" style={{ borderColor: C.green, color: C.green }}>
            <TagIcon weight="bold" className="size-8" /> İlan ver
          </span>
        </div>

        <section className="rounded-2xl border-2 p-4" style={{ borderColor: C.text }}>
          <h2 className={`${head} flex items-center gap-2 text-[21px] font-bold`}><StorefrontIcon weight="bold" className="size-7" /> Pazar</h2>
          <p className="mt-1 text-[18px]">Şu an <b>{MARKET.count} ilan</b> var. Bugün <b>{MARKET.today} yeni ilan</b> eklendi.</p>
          <div className="mt-3 flex items-center gap-3">
            <Image src={MARKET.newest.photo} alt={MARKET.newest.title} width={160} height={160} className="size-20 shrink-0 rounded-xl object-cover" />
            <div>
              <p className="text-[18px] font-bold leading-snug">{MARKET.newest.title}</p>
              <p className="text-[18px]">{MARKET.newest.price} / {MARKET.newest.unit}</p>
              <p className="text-[16px]" style={{ color: C.muted }}>{MARKET.newest.place}</p>
            </div>
          </div>
          <p className="mt-3 flex min-h-14 items-center justify-center rounded-xl border-2 text-[18px] font-bold underline underline-offset-4" style={{ borderColor: C.text }}>Tüm ilanları gör</p>
        </section>

        <div className="rounded-2xl border-2 border-dashed p-4" style={{ borderColor: C.line }}>
          <p className="text-[15px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>Reklam (örnek)</p>
          <p className={`${head} text-[21px] font-bold`}>{SPONSOR.name}</p>
          <p className="text-[18px]">{SPONSOR.tagline}</p>
          <p className="mt-2 text-[17px] font-bold underline underline-offset-4" style={{ color: C.blue }}>Siz de reklam vermek için bize yazın</p>
        </div>

        <section>
          <h2 className={`${head} text-[26px] font-bold`}>Forum: son sorular</h2>
          <ul className="mt-3 space-y-3">
            {TOPICS.slice(0, 5).map((t) => (
              <li key={t.title} className="rounded-2xl border-2 p-4" style={{ borderColor: C.text }}>
                <p className="text-[16px] font-semibold" style={{ color: C.muted }}>{t.section}</p>
                <p className={`${head} mt-0.5 text-[20px] font-semibold leading-snug`}>{t.title}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[17px]" style={{ color: C.muted }}>
                  <span>{t.author}, {t.ago}</span>
                  <span className="flex items-center gap-1.5 font-bold" style={{ color: C.text }}><ChatCircleTextIcon weight="bold" className="size-6" /> {t.replies} yanıt</span>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-xl text-[19px] font-bold text-white" style={{ background: C.text }}>
            Daha fazla konu göster <CaretDownIcon weight="bold" className="size-5" />
          </p>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t-2 bg-white" style={{ borderColor: C.text }}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className="flex min-h-[72px] flex-col items-center justify-center gap-1 border-t-[5px] px-1 text-center text-[13.5px] font-bold leading-tight" style={{ borderColor: i === 0 ? C.green : "transparent", background: i === 0 ? C.greenBg : undefined, color: i === 0 ? C.green : C.text }}>
              <Icon weight={i === 0 ? "fill" : "bold"} className="size-7" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
