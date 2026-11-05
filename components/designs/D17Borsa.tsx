import Image from "next/image";
import { siteConfig } from "@/config/site";
import { BellIcon, CalendarDotsIcon, CaretDownIcon, CaretUpIcon, ChatsCircleIcon, CloudIcon, CloudRainIcon, CloudSunIcon, EqualsIcon, HouseIcon, MagnifyingGlassIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { firaCode, firaSans } from "./fonts";
import { BADGES, FORECAST, MARKET, NAV, PRICES, SECTIONS, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

// Data-Dense Dashboard (ui-ux-pro-max): light grey canvas, compact white cards, 8 px gaps, 36 px rows, green/red with arrows
// (never colour alone), Fira Sans with Fira Code for every number.
const C = { bg: "#f1f3f5", card: "#ffffff", line: "#dfe3e8", text: "#111827", muted: "#4b5563", up: "#15803d", down: "#b91c1c", blue: "#1d4ed8", ink: "#0f172a" };
const SKY = { sun: SunIcon, cloudSun: CloudSunIcon, cloud: CloudIcon, rain: CloudRainIcon } as const;
const tr = (n: number, d = 1) => n.toLocaleString("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d });

function Change({ v, mono }: { v: number; mono: string }) {
  const Icon = v > 0 ? CaretUpIcon : v < 0 ? CaretDownIcon : EqualsIcon;
  const color = v > 0 ? C.up : v < 0 ? C.down : C.muted;
  return (
    <span className={`${mono} inline-flex items-center justify-end gap-0.5 text-[12px] font-semibold`} style={{ color }}>
      <Icon weight="fill" className="size-3" aria-hidden="true" />
      {v > 0 ? "+" : ""}
      {tr(v)}%
    </span>
  );
}

function Spark({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data);
  const span = Math.max(...data) - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 56},${18 - ((v - min) / span) * 16 - 1}`).join(" ");
  return (
    <svg viewBox="0 0 56 18" className="h-[18px] w-14" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={up ? C.up : C.down} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** 17 · Borsa (data dashboard): a price ticker, small figures, a price table with 7-day lines and the forum as a dense table. */
export function D17Borsa() {
  const icons = [HouseIcon, StorefrontIcon, CalendarDotsIcon, SquaresFourIcon];
  const mono = firaCode.className;
  const topics = SECTIONS.reduce((n, s) => n + s.topics, 0);
  return (
    <div id="tasarim-onizleme" className={`${firaSans.className} min-h-dvh pb-20 text-[13px]`} style={{ background: C.bg, color: C.text }}>
      <header className="flex h-[52px] items-center gap-1 border-b bg-white px-2.5" style={{ borderColor: C.line }}>
        <Image src="/brand/logo.webp" alt="" width={56} height={56} className="size-8" />
        <p className="ml-1 flex-1 text-[16px] font-bold tracking-tight">{siteConfig.name}</p>
        {[BellIcon, ChatsCircleIcon].map((Icon, i) => (
          <span key={i} className="relative flex size-11 items-center justify-center">
            <Icon weight="regular" className="size-[22px]" />
            <span className={`${mono} absolute right-1 top-1.5 flex h-4 min-w-4 items-center justify-center rounded px-0.5 text-[10px] font-bold text-white`} style={{ background: C.blue }}>{i ? BADGES.messages : BADGES.notifications}</span>
          </span>
        ))}
        <span className="flex size-8 items-center justify-center rounded-md text-[11.5px] font-bold text-white" style={{ background: C.ink }}>{USER.initials}</span>
      </header>

      {/* Price ticker. */}
      <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap px-2.5 py-2 text-white" style={{ background: C.ink }}>
        {PRICES.map((p) => (
          <span key={p.name} className="flex items-center gap-1.5">
            <span className="text-[11.5px] font-semibold uppercase tracking-wide text-white/75">{p.name}</span>
            <span className={`${mono} text-[12.5px] font-semibold`}>{p.price}</span>
            <span className={`${mono} flex items-center text-[11.5px] font-semibold`} style={{ color: p.change > 0 ? "#4ade80" : p.change < 0 ? "#f87171" : "#cbd5e1" }}>
              {p.change > 0 ? <CaretUpIcon weight="fill" className="size-3" /> : p.change < 0 ? <CaretDownIcon weight="fill" className="size-3" /> : <EqualsIcon weight="bold" className="size-3" />}
              {tr(Math.abs(p.change))}%
            </span>
          </span>
        ))}
      </div>

      <div className="space-y-2 p-2">
        <div className="flex h-10 items-center gap-2 rounded-md border bg-white px-2.5 text-[13.5px]" style={{ borderColor: C.line, color: C.muted }}>
          <MagnifyingGlassIcon weight="bold" className="size-4" />
          Forumda, Pazar’da ve fiyatlarda ara
          <span className={`${mono} ml-auto rounded border px-1.5 text-[11px]`} style={{ borderColor: C.line }}>/</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "Hava", v: `${WEATHER.temp}°`, s: `${WEATHER.place} · ${WEATHER.sky}` },
            { k: "İlan", v: String(MARKET.count), s: `+${MARKET.today} bugün` },
            { k: "Konu", v: topics.toLocaleString("tr-TR"), s: "6 bölüm" },
          ].map((x) => (
            <div key={x.k} className="rounded-md border bg-white px-2.5 py-2" style={{ borderColor: C.line }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>{x.k}</p>
              <p className={`${mono} text-[22px] font-semibold leading-tight`}>{x.v}</p>
              <p className="truncate text-[11.5px]" style={{ color: C.muted }}>{x.s}</p>
            </div>
          ))}
        </div>

        <section className="rounded-md border bg-white" style={{ borderColor: C.line }}>
          <div className="flex items-center justify-between border-b px-2.5 py-2" style={{ borderColor: C.line }}>
            <h2 className="text-[13.5px] font-bold">Borsa fiyatları <span className="font-normal" style={{ color: C.muted }}>₺/kg</span></h2>
            <span className="text-[11px]" style={{ color: C.muted }}>Konya TB · örnek · 5 Kas</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide" style={{ color: C.muted }}>
                <th className="px-2.5 py-1.5 font-semibold">Ürün</th>
                <th className="py-1.5 text-right font-semibold">Fiyat</th>
                <th className="py-1.5 text-right font-semibold">Gün</th>
                <th className="px-2.5 py-1.5 text-right font-semibold">7 gün</th>
              </tr>
            </thead>
            <tbody>
              {PRICES.map((p) => (
                <tr key={p.name} className="h-9 border-t" style={{ borderColor: C.line }}>
                  <td className="px-2.5 font-medium">{p.name}</td>
                  <td className={`${mono} text-right font-semibold`}>{p.price}</td>
                  <td className="text-right"><Change v={p.change} mono={mono} /></td>
                  <td className="px-2.5 text-right"><span className="inline-block align-middle"><Spark data={p.week} up={p.week[6] >= p.week[0]} /></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-md border bg-white" style={{ borderColor: C.line }}>
          <div className="flex items-center justify-between border-b px-2.5 py-2" style={{ borderColor: C.line }}>
            <h2 className="text-[13.5px] font-bold">Hava · {WEATHER.place}</h2>
            <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: "#dcfce7", color: C.up }}>{WEATHER.hint}</span>
          </div>
          <div className="grid grid-cols-5 divide-x" style={{ borderColor: C.line }}>
            {FORECAST.map((f) => {
              const Icon = SKY[f.sky];
              return (
                <div key={f.day} className="flex flex-col items-center py-2" style={{ borderColor: C.line }}>
                  <span className="text-[11.5px] font-semibold" style={{ color: C.muted }}>{f.day}</span>
                  <Icon weight="duotone" className="my-1 size-5" style={{ color: f.sky === "rain" ? C.blue : f.sky === "sun" ? "#b45309" : C.muted }} />
                  <span className={`${mono} text-[12px] font-semibold`}>{f.max}°<span className="font-normal" style={{ color: C.muted }}>/{f.min}°</span></span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex items-center gap-2 rounded-md border bg-white px-2.5 py-2" style={{ borderColor: C.line }}>
          <span className="rounded px-1.5 py-0.5 text-[10.5px] font-bold uppercase" style={{ background: "#fef3c7", color: "#92400e" }}>Sponsor</span>
          <p className="min-w-0 flex-1 truncate"><b>{SPONSOR.name}</b> <span style={{ color: C.muted }}>· {SPONSOR.tagline}</span></p>
          <span className="shrink-0 text-[12px] font-semibold" style={{ color: C.blue }}>Reklam ver</span>
        </div>

        <section className="rounded-md border bg-white" style={{ borderColor: C.line }}>
          <div className="flex items-center gap-3 border-b px-2.5 text-[13px]" style={{ borderColor: C.line }}>
            <h2 className="py-2 font-bold">Forum</h2>
            <span className="border-b-2 py-2 font-semibold" style={{ borderColor: C.blue, color: C.blue }}>Son</span>
            <span className="py-2" style={{ color: C.muted }}>Yanıtlanan</span>
            <span className="py-2" style={{ color: C.muted }}>Popüler</span>
            <span className="ml-auto rounded px-2 py-1 text-[12px] font-semibold text-white" style={{ background: C.blue }}>+ Konu</span>
          </div>
          <div className="grid grid-cols-[1fr_36px_44px] gap-x-2 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
            <span>Konu</span>
            <span className="text-right">Yan.</span>
            <span className="text-right">Gör.</span>
          </div>
          <ul>
            {TOPICS.map((t) => (
              <li key={t.title} className="grid grid-cols-[1fr_36px_44px] items-center gap-x-2 border-t px-2.5 py-1.5" style={{ borderColor: C.line }}>
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.title}</p>
                  <p className="truncate text-[11.5px]" style={{ color: C.muted }}>{t.section} · {t.ago} · son: {t.lastBy}</p>
                </div>
                <span className={`${mono} text-right text-[12px] font-semibold`}>{t.replies}</span>
                <span className={`${mono} text-right text-[12px]`} style={{ color: C.muted }}>{t.views.toLocaleString("tr-TR")}</span>
              </li>
            ))}
          </ul>
          <p className="border-t py-2.5 text-center font-semibold" style={{ borderColor: C.line, color: C.blue }}>Daha fazla göster</p>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t bg-white" style={{ borderColor: C.line }}>
        {NAV.map((label, i) => {
          const Icon = icons[i];
          return (
            <span key={label} className="flex flex-col items-center gap-0.5 py-1.5 text-[10.5px] font-semibold" style={{ color: i === 0 ? C.blue : C.muted }}>
              <Icon weight={i === 0 ? "fill" : "regular"} className="size-[22px]" />
              {label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
