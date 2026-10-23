"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeftIcon, CalendarDotsIcon, CaretRightIcon, InfoIcon, LeafIcon, MapTrifoldIcon, MagnifyingGlassIcon, PlantIcon, RulerIcon, ScanIcon, WalletIcon, XCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { TASK_KINDS } from "@/data/farm-calendar";
import { EXPENSE_KINDS, FIELDS, HEALTH, fieldById, healthOf, lastScan, seasonSummary, tonsLabel, totalExpenses, upcomingTasks, type Field, type Health } from "@/data/demo-fields";
import { formatPrice } from "@/data/demo-market";
import { PRICES, PRICE_GROUPS, filterPrices, trendLabel, type PriceGroupId, type PriceSort } from "@/data/demo-prices";
import type { Nav } from "./nav";
import { BackBar, ChangePill, HEALTH_STYLE, HealthBadge, Segmented, Sparkline, enter, focusRing, scroll } from "./parts";

const CALENDAR_DAY = (day: number) => (day === 14 ? "Bugün" : day === 15 ? "Yarın" : `${day} Ekim`);
const SEASON_GRADIENT = "bg-[linear-gradient(135deg,#047857_0%,#065f46_35%,#0b3b30_75%,#0f2a2a_100%)]";

/** "Tarlalarım": the season in numbers, then each field with its health, last scan and next task. */
export function FieldsScreen({ nav }: { nav: Nav }) {
  const season = seasonSummary(FIELDS);
  return (
    <div className={`${scroll} px-3.5 pb-10 pt-[52px] ${enter}`}>
      <BackBar title="Tarlalarım" subtitle={`${FIELDS.length} tarla · Konya`} onBack={nav.back} />
      <div className={`rounded-[22px] p-3.5 text-white shadow-lift ${SEASON_GRADIENT}`}>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-emerald-300">Bu sezon</p>
        <dl className="mt-1.5 grid grid-cols-3 gap-1">
          {[
            [`${season.areaDonum} dönüm`, "Toplam alan"],
            [formatPrice(season.expenses), "Harcama"],
            [tonsLabel(season.yieldKg), "Beklenen ürün"],
          ].map(([value, label]) => (
            <div key={label}>
              <dd className="font-heading text-[16px] font-extrabold">{value}</dd>
              <dt className="text-[11px] text-white/80">{label}</dt>
            </div>
          ))}
        </dl>
      </div>
      <button type="button" onClick={() => nav.push({ name: "map" })} className={`mt-2.5 flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border bg-card text-[13.5px] font-semibold text-primary ${focusRing}`}>
        <MapTrifoldIcon aria-hidden="true" weight="duotone" className="size-5" />
        Haritada gör
      </button>
      <ul className="mt-3 space-y-2">
        {FIELDS.map((f) => (
          <li key={f.id}>
            <FieldCard field={f} onOpen={() => nav.push({ name: "field", id: f.id })} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FieldCard({ field, onOpen }: { field: Field; onOpen: () => void }) {
  const next = upcomingTasks(field, 1)[0];
  return (
    <button type="button" onClick={onOpen} className={`flex w-full cursor-pointer items-center gap-2.5 rounded-[18px] border border-border bg-card p-2 text-left transition-colors duration-150 hover:bg-secondary/50 ${focusRing}`}>
      <span className="relative size-[72px] shrink-0 overflow-hidden rounded-[14px] bg-muted">
        <Image src={field.photo} alt="" fill sizes="72px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block font-heading text-[15px] font-extrabold">{field.name}</span>
        <span className="block truncate text-[11.5px] text-muted-foreground">
          {field.crop} · {field.areaDonum} dönüm · {field.stage}
        </span>
        <span className="flex items-center gap-1.5">
          <HealthBadge health={healthOf(field)} />
          <span className="text-[11px] text-muted-foreground">Son tarama %{lastScan(field)?.successRate}</span>
        </span>
        <span className="flex items-center gap-1 truncate text-[11px]">
          <CalendarDotsIcon aria-hidden="true" weight="duotone" className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">{next ? `${CALENDAR_DAY(next.day)} ${next.time} · ${next.title}` : "Yaklaşan görev yok"}</span>
        </span>
      </span>
      <CaretRightIcon aria-hidden="true" weight="bold" className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

const CALLOUT: Record<Health, string> = {
  saglikli: "border-primary/30 bg-secondary/60",
  izlenmeli: "border-gold/40 bg-gold-soft",
  riskli: "border-destructive/30 bg-destructive/5",
};

/** One field: photo, facts, its health from the last scan, the season's expenses and the coming tasks. */
export function FieldScreen({ id, nav, onScan }: { id: string; nav: Nav; onScan: () => void }) {
  const field = fieldById(id);
  if (!field) return null;
  const health = healthOf(field);
  const scan = lastScan(field);
  const total = totalExpenses(field);
  const tasks = upcomingTasks(field);
  const { Icon } = HEALTH_STYLE[health];
  return (
    <div className={`relative h-full ${enter}`}>
      <div className={`${scroll} pb-24`}>
        <div className="relative h-[200px] bg-muted">
          <Image src={field.photo} alt={`${field.name} fotoğrafı`} fill sizes="340px" className="object-cover" />
          <button type="button" aria-label="Geri" onClick={nav.back} className={`absolute left-3.5 top-[50px] flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-soft ${focusRing}`}>
            <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-5" />
          </button>
        </div>
        <div className="relative -mt-4 space-y-2.5 rounded-t-[24px] bg-background px-3.5 pt-3.5">
          <div className="flex flex-wrap gap-1.5">
            <HealthBadge health={health} />
            <span className="rounded-full bg-muted px-2 py-px text-[11px] font-semibold text-muted-foreground">{field.stage}</span>
          </div>
          <div>
            <p className="font-heading text-[22px] font-extrabold">{field.name}</p>
            <p className="text-[12px] text-muted-foreground">
              {field.crop} · {field.place}
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-1.5">
            {[
              [RulerIcon, "Alan", `${field.areaDonum} dönüm`],
              [PlantIcon, "Beklenen ürün", tonsLabel(field.expectedYieldKg)],
              [LeafIcon, "Bitki sağlığı", field.ndvi.toFixed(2).replace(".", ",")],
            ].map(([I, label, value]) => {
              const FactIcon = I as typeof RulerIcon;
              return (
                <div key={label as string} className="rounded-[14px] border border-border bg-card p-2">
                  <FactIcon aria-hidden="true" weight="duotone" className="size-4 text-primary" />
                  <dt className="mt-0.5 text-[10.5px] text-muted-foreground">{label as string}</dt>
                  <dd className="text-[13px] font-bold">{value as string}</dd>
                </div>
              );
            })}
          </dl>
          <div className={`rounded-[18px] border p-3 ${CALLOUT[health]}`}>
            <p className="flex items-center gap-1.5 text-[13px] font-bold">
              <Icon aria-hidden="true" weight="fill" className={`size-4 ${HEALTH_STYLE[health].badge.split(" ")[1]}`} />
              {HEALTH[health].hint}
            </p>
            {scan && (
              <p className="mt-1 text-[12.5px] leading-snug">
                Son tarama: {scan.diagnosis}. Hasat başarı tahmini %{scan.successRate}.
              </p>
            )}
          </div>
          <div className="rounded-[18px] border border-border bg-card p-3">
            <p className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-heading text-[15px] font-extrabold">
                <WalletIcon aria-hidden="true" weight="duotone" className="size-5 text-primary" />
                Harcamalar
              </span>
              <span className="font-heading text-[15px] font-extrabold">{formatPrice(total)}</span>
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {field.expenses.map((e) => (
                <li key={e.kind} className="text-[12px]">
                  <span className="flex justify-between">
                    <span>{EXPENSE_KINDS[e.kind]}</span>
                    <span className="font-semibold">{formatPrice(e.amount)}</span>
                  </span>
                  <span aria-hidden="true" className="mt-0.5 block h-1.5 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${(e.amount / total) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[18px] border border-border bg-card p-3">
            <p className="flex items-center gap-1.5 font-heading text-[15px] font-extrabold">
              <CalendarDotsIcon aria-hidden="true" weight="duotone" className="size-5 text-primary" />
              Yaklaşan görevler
            </p>
            {tasks.length ? (
              <ul className="mt-1.5 divide-y divide-border">
                {tasks.map((t) => (
                  <li key={`${t.day}-${t.title}`} className="py-1.5 text-[12.5px]">
                    <span className="block font-semibold">{t.title}</span>
                    <span className="text-[11.5px] text-muted-foreground">
                      {CALENDAR_DAY(t.day)}, {t.time} · {TASK_KINDS[t.kind].label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-[12.5px] text-muted-foreground">Bu ay için görev yok.</p>
            )}
            <button type="button" onClick={() => nav.tab("calendar")} className={`mt-1 cursor-pointer text-[12.5px] font-semibold text-primary underline-offset-2 hover:underline ${focusRing}`}>
              Takvimde gör
            </button>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-border bg-card px-3.5 pb-7 pt-2.5">
        <button type="button" onClick={onScan} className={`flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary text-[14px] font-bold text-primary-foreground ${focusRing}`}>
          <ScanIcon aria-hidden="true" weight="bold" className="size-5" />
          Bu tarlayı tara
        </button>
      </div>
    </div>
  );
}

const ORDER: Health[] = ["riskli", "izlenmeli", "saglikli"];

/** "Tarla Haritası": the fields outlined on a satellite photo, tinted by plant health; pick one for its details. */
export function MapScreen({ nav }: { nav: Nav }) {
  // Open on the field that most needs a look.
  const [selectedId, setSelectedId] = useState(() => [...FIELDS].sort((a, b) => ORDER.indexOf(healthOf(a)) - ORDER.indexOf(healthOf(b)))[0].id);
  const selected = fieldById(selectedId) ?? FIELDS[0];
  const health = healthOf(selected);
  const ndvi = selected.ndvi.toFixed(2).replace(".", ",");
  return (
    <div className={`${scroll} px-3.5 pb-10 pt-[52px] ${enter}`}>
      <BackBar title="Tarla Haritası" subtitle="Uydu görüntüsü · bitki sağlığı" onBack={nav.back} />
      <div className="relative aspect-[1200/877] overflow-hidden rounded-[20px] bg-muted shadow-soft">
        <Image src="/app/harita-uydu.webp" alt="Tarlaların uydu görüntüsü" fill sizes="320px" className="object-cover" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full">
          {FIELDS.map((f) => {
            const style = HEALTH_STYLE[healthOf(f)];
            const on = f.id === selected.id;
            return (
              <polygon
                key={f.id}
                points={f.outline.map(([x, y]) => `${x * 100},${y * 100}`).join(" ")}
                fill={style.fill}
                stroke={on ? "#fff" : style.line}
                strokeWidth={on ? 3 : 2}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                className="cursor-pointer"
                onClick={() => setSelectedId(f.id)}
              />
            );
          })}
        </svg>
        {FIELDS.map((f) => {
          const h = healthOf(f);
          const TagIcon = HEALTH_STYLE[h].Icon;
          const xs = f.outline.map(([x]) => x);
          const ys = f.outline.map(([, y]) => y);
          const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
          const top = Math.min(...ys);
          const on = f.id === selected.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              aria-label={`${f.name}, ${HEALTH[h].label}`}
              onClick={() => setSelectedId(f.id)}
              className={`absolute flex h-6 -translate-x-1/2 -translate-y-[calc(100%+3px)] cursor-pointer items-center gap-0.5 rounded-full px-1.5 text-[10.5px] font-bold shadow-soft ${focusRing} ${on ? "bg-foreground text-white" : "bg-white/95"}`}
              style={{ left: `${Math.min(Math.max(cx * 100, 13), 87)}%`, top: `${top * 100}%` }}
            >
              <TagIcon aria-hidden="true" weight="fill" className={`size-3 ${on ? "" : HEALTH_STYLE[h].badge.split(" ")[1]}`} />
              {f.name.split(" ")[0]}
            </button>
          );
        })}
        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">Örnek uydu görüntüsü</span>
      </div>
      <ul aria-label="Renklerin anlamı" className="mt-2 flex flex-wrap gap-1.5">
        {ORDER.map((k) => {
          const { Icon, fill, line, badge } = HEALTH_STYLE[k];
          return (
            <li key={k} className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[11px]">
              <span aria-hidden="true" className="size-2.5 rounded-[3px] border" style={{ backgroundColor: fill, borderColor: line }} />
              <Icon aria-hidden="true" weight="fill" className={`size-3.5 ${badge.split(" ")[1]}`} />
              {HEALTH[k].label}
            </li>
          );
        })}
      </ul>
      <div aria-live="polite" className="mt-2.5 space-y-2 rounded-[20px] border border-border bg-card p-3 shadow-soft">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-heading text-[16px] font-extrabold">{selected.name}</p>
            <p className="text-[11.5px] text-muted-foreground">
              {selected.crop} · {selected.areaDonum} dönüm · {selected.stage}
            </p>
          </div>
          <HealthBadge health={health} />
        </div>
        <div>
          <p className="flex justify-between text-[12.5px]">
            <span>Bitki sağlığı</span>
            <span className="font-heading font-extrabold">{ndvi}</span>
          </p>
          <span aria-hidden="true" className="mt-1 block h-2 overflow-hidden rounded-full bg-muted">
            <span className={`block h-full rounded-full ${HEALTH_STYLE[health].bar}`} style={{ width: `${selected.ndvi * 100}%` }} />
          </span>
          <p className="mt-1 text-[11.5px] text-muted-foreground">{HEALTH[health].hint}</p>
        </div>
        <button type="button" onClick={() => nav.push({ name: "field", id: selected.id })} className={`flex h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-full bg-primary text-[13px] font-semibold text-primary-foreground ${focusRing}`}>
          Tarlaya git
          <CaretRightIcon aria-hidden="true" weight="bold" className="size-4" />
        </button>
      </div>
      <p className="mt-2.5 flex gap-1.5 rounded-[16px] bg-muted px-3 py-2.5 text-[11.5px] leading-snug text-muted-foreground">
        <InfoIcon aria-hidden="true" weight="duotone" className="size-4 shrink-0" />
        Bitki sağlığı, uydudan ölçülen yeşillikle (NDVI) hesaplanır: 1’e yaklaştıkça bitki örtüsü daha canlıdır. Görüntü ve değerler örnektir.
      </p>
    </div>
  );
}

const SORTS: { id: PriceSort; label: string }[] = [
  { id: "az", label: "A–Z" },
  { id: "degisim", label: "En çok değişen" },
];

/** "Borsa fiyatları": every crop's sample price per kilo, by group, searchable and sortable. */
export function PricesScreen({ nav }: { nav: Nav }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<PriceGroupId>("tumu");
  const [sort, setSort] = useState<PriceSort>("az");
  const rows = filterPrices(PRICES, { group, query, sort });
  return (
    <div className={`${scroll} space-y-2.5 px-3.5 pb-10 pt-[52px] ${enter}`}>
      <BackBar title="Borsa fiyatları" subtitle="Kilo fiyatları · Türkiye geneli" onBack={nav.back} />
      <label className="flex h-10 items-center gap-2 rounded-full border border-input bg-card pl-3 pr-1 shadow-soft focus-within:border-primary">
        <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="size-4 shrink-0 text-muted-foreground" />
        <span className="sr-only">Ürün ya da borsa ara</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ürün ya da borsa ara" className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground" />
        {query && (
          <button type="button" aria-label="Aramayı temizle" onClick={() => setQuery("")} className={`flex size-8 cursor-pointer items-center justify-center rounded-full ${focusRing}`}>
            <XCircleIcon aria-hidden="true" weight="fill" className="size-5 text-muted-foreground" />
          </button>
        )}
      </label>
      <div role="radiogroup" aria-label="Ürün grupları" className="flex flex-wrap gap-1.5">
        {PRICE_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="radio"
            aria-checked={group === g.id}
            onClick={() => setGroup(g.id)}
            className={`min-h-8 cursor-pointer rounded-full border px-2.5 text-[12px] font-semibold transition-colors duration-150 ${focusRing} ${group === g.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"}`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <Segmented label="Sıralama" value={sort} options={SORTS} onChange={setSort} />
      <p aria-live="polite" className="text-[11.5px] text-muted-foreground">
        {rows.length} ürün · örnek fiyatlar
      </p>
      {rows.length ? (
        <ul className="space-y-1.5">
          {rows.map((p) => (
            <li key={p.name} aria-label={`${p.name}, ${p.exchange}: kilosu ${p.price.toFixed(2).replace(".", ",")} lira, ${trendLabel(p.change)}`} className="flex items-center gap-2 rounded-[16px] border border-border bg-card px-3 py-2">
              <span aria-hidden="true" className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-bold">{p.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{p.exchange}</span>
              </span>
              <Sparkline line={p.line} change={p.change} />
              <span aria-hidden="true" className="flex flex-col items-end gap-0.5">
                <span className="font-heading text-[14px] font-extrabold">
                  {p.price.toFixed(2).replace(".", ",")} ₺<span className="text-[10.5px] font-normal text-muted-foreground"> /kg</span>
                </span>
                <ChangePill change={p.change} />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[18px] border border-dashed border-border px-4 py-5 text-center">
          <p className="font-heading text-[15px] font-extrabold">Ürün bulunamadı</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setGroup("tumu");
            }}
            className={`mt-2 min-h-9 cursor-pointer rounded-full bg-primary px-4 text-[12.5px] font-semibold text-primary-foreground ${focusRing}`}
          >
            Filtreleri temizle
          </button>
        </div>
      )}
    </div>
  );
}
