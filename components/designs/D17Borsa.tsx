import Image from "next/image";
import { siteConfig } from "@/config/site";
import { BellIcon, CalendarDotsIcon, CaretDownIcon, CaretUpIcon, ChatCircleIcon, ChatsCircleIcon, CloudIcon, CloudRainIcon, CloudSunIcon, EqualsIcon, EyeIcon, HouseIcon, MagnifyingGlassIcon, MegaphoneIcon, SquaresFourIcon, StorefrontIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { firaCode, firaSans } from "./fonts";
import { BADGES, FORECAST, MARKET, NAV, NEWS, PRICES, SECTIONS, SPONSOR, TOPICS, USER, WEATHER } from "./sample";

// Data-Dense Dashboard (ui-ux-pro-max): light grey canvas, compact white cards, 8 px gaps, 36 px rows, green/red with arrows
// (never colour alone), Fira Sans with Fira Code for every number.
const C = { bg: "#f1f3f5", card: "#ffffff", line: "#dfe3e8", text: "#111827", muted: "#4b5563", up: "#15803d", down: "#b91c1c", blue: "#1d4ed8", ink: "#0f172a", red: "#dc2626" };
// The label colour of each kind of news item in the ticker.
const KIND = { Destek: "#15803d", Duyuru: "#b45309", Haber: "#1d4ed8" } as const;
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

/** The ticker's headlines; drawn twice (the second copy hidden from screen readers) so the loop has no seam. */
function NewsRow({ copy, mono }: { copy?: boolean; mono: string }) {
  return (
    <ul className={`${copy ? "kayan-serit__kopya" : "flex"} items-center`} aria-hidden={copy || undefined}>
      {NEWS.map((n) => (
        <li key={n.title} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap pr-5 text-[12.5px]">
          <span className={`${mono} text-[10px] font-bold uppercase`} style={{ color: KIND[n.kind] }}>{n.kind}</span>
          <span className="font-medium">{n.title}</span>
        </li>
      ))}
    </ul>
  );
}

/** 17 · Borsa (data dashboard): a news ticker, compact weather and market panels, and the forum in dense lines. */
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

      <div className="space-y-2 p-2">
        <div className="flex h-10 items-center gap-2 rounded-md border bg-white px-2.5 text-[13.5px]" style={{ borderColor: C.line, color: C.muted }}>
          <MagnifyingGlassIcon weight="bold" className="size-4" />
          Forumda, Pazar’da ve fiyatlarda ara
          <span className={`${mono} ml-auto rounded border px-1.5 text-[11px]`} style={{ borderColor: C.line }}>/</span>
        </div>

        <div className="flex items-center gap-2 rounded-md border bg-white px-2.5 py-2" style={{ borderColor: C.line }}>
          <span className="rounded px-1.5 py-0.5 text-[10.5px] font-bold uppercase" style={{ background: "#fef3c7", color: "#92400e" }}>Sponsor</span>
          <p className="min-w-0 flex-1 truncate"><b>{SPONSOR.name}</b> <span style={{ color: C.muted }}>· {SPONSOR.tagline}</span></p>
          <span className="shrink-0 text-[11px]" style={{ color: C.muted }}>örnek</span>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-dashed bg-white px-2.5 py-2" style={{ borderColor: "#c4cad3" }}>
          <MegaphoneIcon weight="bold" className="size-4" style={{ color: C.muted }} />
          <p className="flex-1">Bu alanda reklam vermek için</p>
          <span className="shrink-0 text-[12px] font-semibold" style={{ color: C.blue }}>İletişim →</span>
        </div>

        <section aria-label="Çiftçi destekleri ve haberler" className="flex h-8 items-stretch overflow-hidden rounded-md border bg-white" style={{ borderColor: C.line }}>
          <h2 className="flex shrink-0 items-center border-r px-2 text-[11px] font-bold leading-none" style={{ color: C.red, borderColor: C.line }}>Çiftçi destekleri & haberler</h2>
          <div className="kayan-serit flex min-w-0 flex-1 items-center pl-2.5">
            <div className="kayan-serit__ray">
              <NewsRow mono={mono} />
              <NewsRow copy mono={mono} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <section className="rounded-md border bg-white" style={{ borderColor: C.line }}>
            <div className="flex items-center justify-between border-b px-2.5 py-1.5" style={{ borderColor: C.line }}>
              <h2 className="flex items-center gap-1.5 text-[12.5px] font-bold">
                <span className="flex size-6 items-center justify-center rounded-md" style={{ background: "#dbeafe" }}>
                  <CloudSunIcon weight="fill" className="size-4" style={{ color: C.blue }} aria-hidden="true" />
                </span>
                Hava · {WEATHER.place}
              </h2>
            </div>
            <div className="px-2.5 pt-1.5">
              <p className={`${mono} text-[26px] font-semibold leading-tight`}>{WEATHER.temp}°</p>
              <p className="text-[11.5px]" style={{ color: C.muted }}>{WEATHER.sky} · %{WEATHER.rain} yağış</p>
              <p className="mt-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: "#dcfce7", color: C.up }}>{WEATHER.hint}</p>
            </div>
            <ul className="mt-1.5 border-t px-2.5 py-1" style={{ borderColor: C.line }}>
              {FORECAST.slice(1, 4).map((f) => {
                const Icon = SKY[f.sky];
                return (
                  <li key={f.day} className="flex h-6 items-center gap-1.5 text-[11.5px]">
                    <span className="w-8 font-semibold" style={{ color: C.muted }}>{f.day}</span>
                    <Icon weight="duotone" className="size-4" style={{ color: f.sky === "rain" ? C.blue : f.sky === "sun" ? "#b45309" : C.muted }} />
                    <span className={`${mono} ml-auto font-semibold`}>{f.max}°<span className="font-normal" style={{ color: C.muted }}>/{f.min}°</span></span>
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="rounded-md border bg-white" style={{ borderColor: C.line }}>
            <div className="flex items-center justify-between border-b px-2.5 py-1.5" style={{ borderColor: C.line }}>
              <h2 className="flex items-center gap-1.5 text-[12.5px] font-bold">
                <span className="flex size-6 items-center justify-center rounded-md" style={{ background: "#ffe4e6" }}>
                  <StorefrontIcon weight="fill" className="size-4" style={{ color: "#be123c" }} aria-hidden="true" />
                </span>
                Pazar
              </h2>
              <span className={`${mono} text-[11px] font-semibold`} style={{ color: C.up }}>+{MARKET.today} bugün</span>
            </div>
            <div className="px-2.5 pt-1.5">
              <p className={`${mono} text-[26px] font-semibold leading-tight`}>{MARKET.count}</p>
              <p className="text-[11.5px]" style={{ color: C.muted }}>aktif ilan</p>
            </div>
            <ul className="mt-1.5 border-t px-2.5 py-1" style={{ borderColor: C.line }}>
              {PRICES.slice(0, 3).map((p) => (
                <li key={p.name} className="flex h-6 items-center gap-1 text-[11.5px]">
                  <span className="font-medium">{p.name}</span>
                  <span className={`${mono} ml-auto font-semibold`}>{p.price}</span>
                  <Change v={p.change} mono={mono} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="rounded-md border bg-white" style={{ borderColor: C.line }}>
          <div className="flex items-center gap-3 border-b px-2.5 text-[13px]" style={{ borderColor: C.line }}>
            <h2 className="py-2 font-bold">Forum <span className={`${mono} text-[11px] font-normal`} style={{ color: C.muted }}>{topics.toLocaleString("tr-TR")}</span></h2>
            <span className="border-b-2 py-2 font-semibold" style={{ borderColor: C.blue, color: C.blue }}>Son</span>
            <span className="py-2" style={{ color: C.muted }}>Yanıtlanan</span>
            <span className="py-2" style={{ color: C.muted }}>Popüler</span>
            <span className="ml-auto rounded px-2 py-1 text-[12px] font-semibold text-white" style={{ background: C.red }}>+ Konu</span>
          </div>
          <ul>
            {TOPICS.map((t) => (
              <li key={t.title} className="border-t px-2.5 py-1.5" style={{ borderColor: C.line }}>
                <p className="truncate font-medium">{t.title}</p>
                <p className="flex items-center gap-2 text-[11.5px]" style={{ color: C.muted }}>
                  <span className="min-w-0 truncate">{t.section} · {t.ago} · son: {t.lastBy}</span>
                  <span className={`${mono} flex shrink-0 items-center gap-2 text-[11px]`}>
                    <span className="inline-flex items-center gap-0.5" style={{ color: C.text }}>
                      <ChatCircleIcon weight="bold" className="size-3.5" aria-hidden="true" />
                      {t.replies}
                      <span className="sr-only"> yanıt</span>
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <EyeIcon weight="bold" className="size-3.5" aria-hidden="true" />
                      {t.views.toLocaleString("tr-TR")}
                      <span className="sr-only"> görüntülenme</span>
                    </span>
                  </span>
                </p>
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
