"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  ArrowLeftIcon,
  ChatCircleDotsIcon,
  CheckCircleIcon,
  ClockIcon,
  HandshakeIcon,
  HeartIcon,
  InfoIcon,
  ListIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PackageIcon,
  PlusIcon,
  ShieldCheckIcon,
  TagIcon,
  TrashIcon,
  WarningCircleIcon,
  XCircleIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { priceStep } from "@/data/demo-chat";
import {
  CATEGORIES,
  CONDITIONS,
  DESCRIPTION_MAX,
  LISTINGS,
  ME,
  SOLD_BY_UNIT,
  UNITS,
  categoryLabel,
  conditionLabel,
  filterListings,
  formatPrice,
  listingById,
  parsePrice,
  sellerById,
  validateDraft,
  type CategoryId,
  type DraftField,
  type Listing,
  type ListingCategory,
  type ListingDraft,
  type MarketView,
} from "@/data/demo-market";
import { agoLabel, demoNow, fromYear } from "@/lib/demo-clock";
import type { DemoMarket } from "./use-demo-market";
import { InboxList } from "./MessageScreens";
import type { MarketSection, Nav } from "./nav";
import { Avatar, CATEGORY_ICONS, ListingCard, Rating, SafetyStrip, Segmented, Sheet, enter, focusRing, scroll } from "./parts";

const VIEWS: { id: MarketView; label: string }[] = [
  { id: "kesfet", label: "Keşfet" },
  { id: "favoriler", label: "Favoriler" },
  { id: "ilanlarim", label: "İlanlarım" },
];

const chip = (on: boolean) =>
  `flex min-h-9 cursor-pointer items-center gap-1 rounded-full border px-2.5 text-[12.5px] font-semibold transition-colors duration-150 ${focusRing} ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"}`;

/**
 * "Pazar": the farmers' market in one place, "İlanlar" (search, Keşfet / Favoriler / İlanlarım, categories,
 * the listings; "İlan ver" one tap away) and "Mesajlar" (the listing chats).
 */
export function MarketScreen({ market, nav, section, onSection }: { market: DemoMarket; nav: Nav; section: MarketSection; onSection: (s: MarketSection) => void }) {
  const top = (
    <div className="space-y-2.5 px-3.5 pb-2.5 pt-[54px]">
      <p className="font-heading text-[24px] font-extrabold tracking-tight">Pazar</p>
      <Segmented
        label="Pazar bölümleri"
        value={section}
        onChange={onSection}
        options={[
          { id: "ilanlar", label: "İlanlar" },
          { id: "mesajlar", label: "Mesajlar", badge: market.unreadChats },
        ]}
      />
    </div>
  );
  if (section === "mesajlar")
    return (
      <div className={`flex h-full flex-col ${enter}`}>
        {top}
        <InboxList market={market} nav={nav} onBrowse={() => onSection("ilanlar")} />
      </div>
    );
  return (
    <div className={`flex h-full flex-col ${enter}`}>
      {top}
      <Listings market={market} nav={nav} />
    </div>
  );
}

function Listings({ market, nav }: { market: DemoMarket; nav: Nav }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId>("tumu");
  const [view, setView] = useState<MarketView>("kesfet");
  const listings = filterListings([...market.myListings, ...LISTINGS], { query, category, view, favorites: market.favorites, status: market.listingStatus });
  const filtered = !!query.trim() || category !== "tumu";
  const now = demoNow();
  const empty = filtered
    ? { title: "Sonuç bulunamadı", body: "Başka bir kelime deneyin ya da filtreleri temizleyin.", action: "Filtreleri temizle", go: () => (setQuery(""), setCategory("tumu")) }
    : view === "favoriler"
      ? { title: "Henüz favori yok", body: "Beğendiğiniz ilanlardaki kalbe dokunun; burada toplansın.", action: "Pazara göz at", go: () => setView("kesfet") }
      : { title: "Henüz ilanınız yok", body: "Ürününüzü, aletinizi ya da aracınızı birkaç adımda satışa çıkarın.", action: "İlan ver", go: () => nav.push({ name: "new-listing" }) };

  return (
    <div className="relative min-h-0 flex-1">
      <div className={`${scroll} space-y-2.5 px-3.5 pb-28`}>
        <label className="flex h-10 items-center gap-2 rounded-full border border-input bg-card pl-3 pr-1 shadow-soft focus-within:border-primary">
          <MagnifyingGlassIcon aria-hidden="true" weight="bold" className="size-4 shrink-0 text-muted-foreground" />
          <span className="sr-only">Pazarda ara</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Traktör, buğday, pulverizatör…" className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground" />
          {query && (
            <button type="button" aria-label="Aramayı temizle" onClick={() => setQuery("")} className={`flex size-8 cursor-pointer items-center justify-center rounded-full ${focusRing}`}>
              <XCircleIcon aria-hidden="true" weight="fill" className="size-5 text-muted-foreground" />
            </button>
          )}
        </label>
        <Segmented label="Görünüm" value={view} options={VIEWS} onChange={setView} />
        <div role="radiogroup" aria-label="Kategoriler" className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c.id];
            const on = c.id === category;
            return (
              <button key={c.id} type="button" role="radio" aria-checked={on} onClick={() => setCategory(c.id)} className={chip(on)}>
                <Icon aria-hidden="true" weight="duotone" className={`size-4 ${on ? "" : "text-primary"}`} />
                {c.label}
              </button>
            );
          })}
        </div>
        {view === "kesfet" && <SafetyStrip />}
        <p aria-live="polite" className="text-[12px] text-muted-foreground">
          {listings.length} ilan{view === "kesfet" ? " · Konya ve çevresi" : ""}
        </p>
        {listings.length ? (
          <ul aria-label="İlanlar" className="grid grid-cols-2 gap-2">
            {listings.map((l) => (
              <li key={l.id}>
                <ListingCard
                  listing={l}
                  favorite={market.favorites.includes(l.id)}
                  status={market.listingStatus[l.id]}
                  now={now}
                  onOpen={() => nav.push({ name: "listing", id: l.id })}
                  onFavorite={() => market.toggleFavorite(l.id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-1.5 rounded-[20px] border border-dashed border-border px-5 py-6 text-center">
            <p className="font-heading text-[16px] font-extrabold">{empty.title}</p>
            <p className="text-[12.5px] leading-snug text-muted-foreground">{empty.body}</p>
            <button type="button" onClick={empty.go} className={`mt-1.5 min-h-9 cursor-pointer rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground ${focusRing}`}>
              {empty.action}
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => nav.push({ name: "new-listing" })}
        className={`absolute bottom-[100px] right-4 z-10 flex h-11 cursor-pointer items-center gap-1.5 rounded-full bg-primary pl-3.5 pr-4 text-[14px] font-bold text-primary-foreground shadow-lift transition-transform duration-150 active:scale-95 ${focusRing}`}
      >
        <PlusIcon aria-hidden="true" weight="bold" className="size-5" />
        İlan ver
      </button>
    </div>
  );
}

const SAFETY_TIPS = ["Ürünü yerinde görmeden kapora göndermeyin.", "Araç ve makinelerde ruhsat ve fatura isteyin.", "Görüşmeleri uygulama içi mesajlarda tutun."];

/** One listing: photo, price, facts, specs, description, the seller, safety tips; message or offer at the bottom. */
export function ListingScreen({ id, fresh, market, nav }: { id: string; fresh?: boolean; market: DemoMarket; nav: Nav }) {
  const [offering, setOffering] = useState(false);
  const [removing, setRemoving] = useState(false);
  const l = listingById(id, market.myListings);
  const seller = l && sellerById(l.sellerId);
  const status = market.listingStatus[id];
  if (!l || !seller || status === "removed") return null;

  const mine = l.sellerId === ME.id;
  const sold = status === "sold";
  const favorite = market.favorites.includes(l.id);
  const condition = conditionLabel(l.condition);
  const CategoryIcon = CATEGORY_ICONS[l.category];
  const chat = () => nav.push({ name: "chat", id: market.openConversation(l.id) });
  const offer = (amount: number) => {
    setOffering(false);
    const chatId = market.openConversation(l.id);
    market.sendOffer(chatId, amount);
    nav.push({ name: "chat", id: chatId });
  };

  return (
    <div className={`relative h-full ${enter}`}>
      <div className={`${scroll} pb-28`}>
        <div className="relative h-[230px] bg-muted">
          <Image src={l.photos[0]} alt={l.stockPhoto ? `${l.title}: temsilî görsel` : `${l.title} fotoğrafı`} fill sizes="340px" className="object-cover" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.4)_0%,transparent_40%)]" />
          <div className="absolute inset-x-3.5 top-[50px] flex items-center justify-between">
            <RoundButton label="Geri" onClick={nav.back}>
              <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-5" />
            </RoundButton>
            {!mine && (
              <RoundButton label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"} pressed={favorite} onClick={() => market.toggleFavorite(l.id)}>
                <HeartIcon aria-hidden="true" weight={favorite ? "fill" : "bold"} className={`size-5 ${favorite ? "text-destructive" : ""}`} />
              </RoundButton>
            )}
          </div>
          {l.stockPhoto && <span className="absolute bottom-6 left-3.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white">Temsilî görsel</span>}
          {sold && <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 font-heading text-[13px] font-extrabold tracking-[0.15em] text-white">SATILDI</span>}
        </div>

        <div className="relative -mt-4 space-y-2.5 rounded-t-[24px] bg-background px-3.5 pt-3.5">
          {fresh && !sold && (
            <p role="status" className="flex items-center gap-2 rounded-[14px] bg-secondary px-3 py-2.5 text-[12.5px] font-semibold text-primary">
              <CheckCircleIcon aria-hidden="true" weight="fill" className="size-5 shrink-0" />
              İlanınız yayında. Gelen mesajlar Mesajlar’a düşecek.
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11.5px] font-semibold text-primary">
              <CategoryIcon aria-hidden="true" weight="duotone" className="size-3.5" />
              {categoryLabel(l.category)}
            </span>
            {condition && <span className="rounded-full bg-secondary px-2 py-0.5 text-[11.5px] font-semibold text-primary">{condition}</span>}
          </div>
          <div>
            <p className="font-heading text-[18px] font-extrabold leading-snug">{l.title}</p>
            <p className="mt-1 font-heading text-[23px] font-extrabold">
              {formatPrice(l.price)}
              {l.unit && <span className="text-[13px] font-medium text-muted-foreground"> / {l.unit}</span>}
            </p>
            {l.negotiable && (
              <p className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-gold">
                <HandshakeIcon aria-hidden="true" weight="duotone" className="size-4" />
                Pazarlık payı var
              </p>
            )}
          </div>
          <dl className="grid grid-cols-3 gap-1.5">
            <Fact Icon={MapPinIcon} label="Konum" value={l.km ? `${l.location.split(",")[0]} · ${l.km} km` : l.location.split(",")[0]} />
            <Fact Icon={ClockIcon} label="İlan tarihi" value={agoLabel(new Date(l.postedAt), demoNow())} />
            {l.quantity ? <Fact Icon={PackageIcon} label="Miktar" value={l.quantity} /> : <Fact Icon={InfoIcon} label="Durum" value={condition ?? "—"} />}
          </dl>
          {l.specs.length > 0 && (
            <Panel Icon={ListIcon} label="Özellikler">
              <dl className="mt-0.5 divide-y divide-border text-[12.5px]">
                {l.specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 py-1.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          )}
          {l.description && (
            <Panel Icon={TagIcon} label="Açıklama">
              <p className="mt-0.5 text-[13px] leading-relaxed">{l.description}</p>
            </Panel>
          )}
          <div className="rounded-[18px] border border-border bg-card p-3">
            <div className="flex items-center gap-2.5">
              <Avatar seller={seller} size={44} />
              <div className="min-w-0">
                <p className="font-heading text-[15px] font-extrabold">{mine ? `${seller.name} (siz)` : seller.name}</p>
                <p className="text-[11.5px] text-muted-foreground">
                  {seller.place} · {fromYear(seller.memberSince)} beri üye
                </p>
                <Rating seller={seller} />
              </div>
            </div>
            <p className="mt-2 flex items-center gap-1 border-t border-border pt-2 text-[11.5px] text-muted-foreground">
              <ClockIcon aria-hidden="true" weight="bold" className="size-3.5" />
              Genelde {seller.replies} yanıt verir
            </p>
          </div>
          <div className="rounded-[18px] bg-gold-soft p-3">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold">
              <ShieldCheckIcon aria-hidden="true" weight="duotone" className="size-5 text-gold" />
              Güvenli alışveriş
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[12.5px] leading-snug marker:text-gold">
              {SAFETY_TIPS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex gap-2 border-t border-border bg-card px-3.5 pb-7 pt-2.5">
        {mine ? (
          <>
            <button type="button" onClick={() => market.setListingStatus(l.id, sold ? null : "sold")} className={`flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border text-[13px] font-semibold ${focusRing}`}>
              <CheckCircleIcon aria-hidden="true" weight="duotone" className="size-5 text-primary" />
              {sold ? "Satışa geri al" : "Satıldı olarak işaretle"}
            </button>
            <button type="button" aria-label="İlanı kaldır" onClick={() => setRemoving(true)} className={`flex size-11 cursor-pointer items-center justify-center rounded-full border border-destructive/50 ${focusRing}`}>
              <TrashIcon aria-hidden="true" weight="duotone" className="size-5 text-destructive" />
            </button>
          </>
        ) : sold ? (
          <p className="flex h-11 flex-1 items-center justify-center rounded-full bg-muted text-[13px] font-semibold text-muted-foreground">Bu ilan satıldı</p>
        ) : (
          <>
            <button type="button" onClick={() => setOffering(true)} className={`flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-primary/50 text-[13px] font-semibold text-primary ${focusRing}`}>
              <TagIcon aria-hidden="true" weight="duotone" className="size-5" />
              Teklif ver
            </button>
            <button type="button" onClick={chat} className={`flex h-11 flex-[1.3] cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary text-[13px] font-semibold text-primary-foreground ${focusRing}`}>
              <ChatCircleDotsIcon aria-hidden="true" weight="fill" className="size-5" />
              Mesaj gönder
            </button>
          </>
        )}
      </div>

      {offering && <OfferSheet listing={l} onClose={() => setOffering(false)} onOffer={offer} />}
      {removing && (
        <Sheet title="İlan kaldırılsın mı?" description={`“${l.title}” Pazar’dan kalkar ve alıcılar artık göremez.`} onClose={() => setRemoving(false)}>
          <div className="flex gap-2">
            <button type="button" onClick={() => setRemoving(false)} className={`h-11 flex-1 cursor-pointer rounded-full border border-border text-[13.5px] font-semibold ${focusRing}`}>
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => {
                market.setListingStatus(l.id, "removed");
                nav.back();
              }}
              className={`h-11 flex-1 cursor-pointer rounded-full bg-destructive text-[13.5px] font-semibold text-white ${focusRing}`}
            >
              Kaldır
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function RoundButton({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} aria-pressed={pressed} onClick={onClick} className={`flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/95 text-foreground shadow-soft ${focusRing}`}>
      {children}
    </button>
  );
}

function Fact({ Icon, label, value }: { Icon: typeof MapPinIcon; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[14px] border border-border bg-card px-2 py-2">
      <Icon aria-hidden="true" weight="duotone" className="size-4 text-primary" />
      <dt className="mt-0.5 text-[10.5px] text-muted-foreground">{label}</dt>
      <dd className="line-clamp-2 text-[12px] font-semibold leading-snug">{value}</dd>
    </div>
  );
}

/** The result screen's info block: a green icon tile, a small caps label, then the content. */
export function Panel({ Icon, label, children }: { Icon: typeof MapPinIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-[18px] bg-card p-3">
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon weight="duotone" className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        {children}
      </div>
    </div>
  );
}

const QUICK_DISCOUNTS = [5, 10, 15];

/** "Teklif ver": an amount with quick discounts, checked before it's sent. */
export function OfferSheet({ listing, onClose, onOffer }: { listing: Listing; onClose: () => void; onOffer: (amount: number) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const step = priceStep(listing.price);
  const unit = listing.unit ? ` / ${listing.unit}` : "";
  const amountAt = (pct: number) => Math.round((listing.price * (1 - pct / 100)) / step) * step;
  const submit = () => {
    const amount = parsePrice(value);
    if (!(amount > 0)) return setError("Geçerli bir tutar girin.");
    if (amount >= listing.price) return setError(`Teklif, ilan fiyatından (${formatPrice(listing.price)}) düşük olmalı.`);
    onOffer(amount);
  };
  return (
    <Sheet title="Teklif ver" description={`İlan fiyatı ${formatPrice(listing.price)}${unit}. Satıcı teklifinizi kabul edebilir ya da karşı teklif verebilir.`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-2"
      >
        <label htmlFor="teklif" className="text-[12.5px] font-semibold">
          Teklifiniz (₺{unit})
        </label>
        <div className={`flex h-12 items-center rounded-[14px] border bg-background px-3 focus-within:border-primary ${error ? "border-destructive" : "border-input"}`}>
          <span aria-hidden="true" className="font-heading text-[18px] font-extrabold text-muted-foreground">
            ₺
          </span>
          <input
            id="teklif"
            inputMode="decimal"
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder={formatPrice(amountAt(10)).replace(" ₺", "")}
            aria-invalid={!!error}
            aria-describedby={error ? "teklif-hata" : undefined}
            className="h-full min-w-0 flex-1 bg-transparent pl-2 font-heading text-[18px] font-extrabold outline-none placeholder:font-semibold placeholder:text-muted-foreground"
          />
        </div>
        {error && (
          <p id="teklif-hata" role="alert" className="text-[12px] text-destructive">
            {error}
          </p>
        )}
        <div className="flex gap-1.5">
          {QUICK_DISCOUNTS.map((pct) => (
            <button
              key={pct}
              type="button"
              aria-label={`Yüzde ${pct} indirimli teklif`}
              onClick={() => {
                setValue(formatPrice(amountAt(pct)).replace(" ₺", ""));
                setError(null);
              }}
              className={`h-9 flex-1 cursor-pointer rounded-full border border-primary/40 bg-secondary text-[12.5px] font-semibold text-primary ${focusRing}`}
            >
              %{pct} az
            </button>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className={`h-11 flex-1 cursor-pointer rounded-full border border-border text-[13.5px] font-semibold ${focusRing}`}>
            Vazgeç
          </button>
          <button type="submit" className={`h-11 flex-1 cursor-pointer rounded-full bg-primary text-[13.5px] font-semibold text-primary-foreground ${focusRing}`}>
            Teklifi gönder
          </button>
        </div>
      </form>
    </Sheet>
  );
}

const FIELD_ORDER: DraftField[] = ["title", "category", "unit", "price", "location", "description"];
const FIELD_NAMES: Partial<Record<DraftField, string>> = { title: "Başlık", category: "Kategori", unit: "Birim", price: "Fiyat", location: "Konum", description: "Açıklama" };
const EMPTY: ListingDraft = { title: "", category: null, condition: "ikinci-el", price: "", unit: "", quantity: "", location: ME.place, description: "", negotiable: true, photos: [] };
const input = (error?: string) => `h-10 w-full rounded-[12px] border bg-card px-3 text-[13.5px] outline-none focus:border-primary ${error ? "border-destructive" : "border-input"}`;

/** "İlan ver": what it is, the price, where; checked as you go and before publishing. (The demo uses the category's stock photo.) */
export function NewListingScreen({ market, nav }: { market: DemoMarket; nav: Nav }) {
  const [draft, setDraft] = useState<ListingDraft>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<DraftField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const errors = validateDraft(draft);
  const shown = (f: DraftField) => (submitted || touched[f] ? errors[f] : undefined);
  const set = <K extends DraftField>(field: K, value: ListingDraft[K]) => setDraft((d) => ({ ...d, [field]: value }));
  const blur = (field: DraftField) => () => setTouched((t) => ({ ...t, [field]: true }));
  const byUnit = !!draft.category && SOLD_BY_UNIT.includes(draft.category);
  const summary = submitted ? FIELD_ORDER.filter((f) => errors[f]) : [];
  const form = useRef<HTMLFormElement>(null);

  const publish = () => {
    setSubmitted(true);
    if (Object.keys(errors).length) {
      form.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    nav.replace({ name: "listing", id: market.addListing(draft), fresh: true });
  };

  return (
    <div className={`flex h-full flex-col bg-background ${enter}`}>
      <div className="flex items-center gap-2 border-b border-border px-3.5 pb-2.5 pt-[52px]">
        <button type="button" aria-label="Kapat" onClick={nav.back} className={`flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-secondary ${focusRing}`}>
          <XIcon aria-hidden="true" weight="bold" className="size-5" />
        </button>
        <p className="font-heading text-[18px] font-extrabold">İlan ver</p>
      </div>
      <form
        ref={form}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          publish();
        }}
        className={`${scroll} min-h-0 flex-1 space-y-3.5 px-3.5 pb-8 pt-3`}
      >
        {summary.length > 0 && (
          <div role="alert" className="space-y-1 rounded-[14px] border border-destructive/40 bg-destructive/5 p-3">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-destructive">
              <WarningCircleIcon aria-hidden="true" weight="fill" className="size-5" />
              Yayınlamadan önce düzeltin
            </p>
            <ul className="space-y-0.5 text-[12px] text-destructive">
              {summary.map((f) => (
                <li key={f}>
                  {/* Focuses the field inside the phone; a #link would scroll the whole page. */}
                  <button type="button" onClick={() => document.getElementById(`ilan-${f}`)?.focus()} className="cursor-pointer text-left underline">
                    {FIELD_NAMES[f]}: {errors[f]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="rounded-[14px] bg-muted px-3 py-2 text-[12px] leading-snug text-muted-foreground">Demoda fotoğraf eklenmez; ilan, kategorinin örnek fotoğrafıyla yayınlanır.</p>

        <FormField id="title" label="Başlık" required error={shown("title")} hint="Ne sattığınızı kısaca yazın: “Massey Ferguson 3085, 1994”.">
          <input id="ilan-title" value={draft.title} onChange={(e) => set("title", e.target.value)} onBlur={blur("title")} maxLength={70} aria-invalid={!!shown("title")} className={input(shown("title"))} />
        </FormField>

        <FormField id="category" label="Kategori" required error={shown("category")}>
          <div id="ilan-category" tabIndex={-1} role="radiogroup" aria-label="Kategori" className="flex flex-wrap gap-1.5">
            {CATEGORIES.filter((c) => c.id !== "tumu").map((c) => {
              const Icon = CATEGORY_ICONS[c.id];
              const on = draft.category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    set("category", c.id as ListingCategory);
                    setTouched((t) => ({ ...t, category: true }));
                  }}
                  className={chip(on)}
                >
                  <Icon aria-hidden="true" weight="duotone" className={`size-4 ${on ? "" : "text-primary"}`} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </FormField>

        {draft.category && draft.category !== "urun" && (
          <FormField id="condition" label="Durum">
            <div role="radiogroup" aria-label="Durum" className="flex gap-1.5">
              {CONDITIONS.map((c) => (
                <button key={c.id} type="button" role="radio" aria-checked={draft.condition === c.id} onClick={() => set("condition", c.id)} className={chip(draft.condition === c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </FormField>
        )}

        {byUnit && (
          <FormField id="unit" label="Fiyat birimi" required error={shown("unit")}>
            <div id="ilan-unit" tabIndex={-1} role="radiogroup" aria-label="Fiyat birimi" className="flex flex-wrap gap-1.5">
              {UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  role="radio"
                  aria-checked={draft.unit === u}
                  onClick={() => {
                    set("unit", u);
                    setTouched((t) => ({ ...t, unit: true }));
                  }}
                  className={chip(draft.unit === u)}
                >
                  {u}
                </button>
              ))}
            </div>
          </FormField>
        )}

        <div className="flex gap-2">
          <div className="flex-[1.3]">
            <FormField id="price" label={byUnit && draft.unit ? `Fiyat (₺ / ${draft.unit})` : "Fiyat (₺)"} required error={shown("price")}>
              <input id="ilan-price" inputMode="decimal" placeholder="Örn. 145.000" value={draft.price} onChange={(e) => set("price", e.target.value)} onBlur={blur("price")} aria-invalid={!!shown("price")} className={input(shown("price"))} />
            </FormField>
          </div>
          {byUnit && (
            <div className="flex-1">
              <FormField id="quantity" label={draft.unit ? `Miktar (${draft.unit})` : "Miktar"}>
                <input id="ilan-quantity" inputMode="decimal" placeholder="Örn. 25" value={draft.quantity} onChange={(e) => set("quantity", e.target.value)} className={input()} />
              </FormField>
            </div>
          )}
        </div>

        <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-border bg-card px-3 py-2">
          <span>
            <span className="block text-[13.5px] font-semibold">Pazarlık payı var</span>
            <span className="block text-[11.5px] text-muted-foreground">Alıcılar size teklif gönderebilir.</span>
          </span>
          <input type="checkbox" role="switch" checked={draft.negotiable} onChange={(e) => set("negotiable", e.target.checked)} className="size-5 accent-[var(--primary)]" />
        </label>

        <FormField id="location" label="Konum" required error={shown("location")} hint="İlçe ve il; tam adresinizi yazmayın.">
          <input id="ilan-location" value={draft.location} onChange={(e) => set("location", e.target.value)} onBlur={blur("location")} aria-invalid={!!shown("location")} className={input(shown("location"))} />
        </FormField>

        <FormField id="description" label="Açıklama" error={shown("description")} hint={`${draft.description.length}/${DESCRIPTION_MAX}`}>
          <textarea
            id="ilan-description"
            rows={3}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            onBlur={blur("description")}
            placeholder="Durumu, kullanımı, teslimat…"
            aria-invalid={!!shown("description")}
            className={`${input(shown("description"))} h-auto py-2`}
          />
        </FormField>

        <button type="submit" className={`h-12 w-full cursor-pointer rounded-full bg-primary text-[14.5px] font-bold text-primary-foreground shadow-lift ${focusRing}`}>
          İlanı yayınla
        </button>
      </form>
    </div>
  );
}

function FormField({ id, label, required, error, hint, children }: { id: string; label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={`ilan-${id}`} className="block text-[12.5px] font-semibold">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[11.5px] text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11.5px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
