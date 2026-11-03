"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ChatsCircleIcon, HandCoinsIcon, PaperPlaneRightIcon } from "@phosphor-icons/react/dist/ssr";
import { startConversation } from "@/app/pazar/actions";
import { QUICK_REPLIES, formatPrice, parsePrice } from "@/lib/market";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/forms/fields";

/** The buyer's box on a listing: a first message (with suggestions) or an offer, which opens the chat. */
export function ContactSeller({
  listingId,
  price,
  unit,
  negotiable,
  sold,
  signInHref,
  conversationId,
}: {
  listingId: string;
  price: number;
  unit: string | null;
  negotiable: boolean;
  sold: boolean;
  /** Set when signed out. */
  signInHref: string | null;
  conversationId: string | null;
}) {
  const [mode, setMode] = useState<"message" | "offer">("message");
  const [text, setText] = useState(QUICK_REPLIES.buyer[0]);
  const [offer, setOffer] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (signInHref) {
    return (
      <div className="space-y-3">
        <Link href={signInHref} className={buttonVariants({ size: "lg", className: "w-full" })}>
          <ChatsCircleIcon aria-hidden="true" weight="duotone" />
          Satıcıya mesaj gönder
        </Link>
        <p className="text-center text-muted-foreground">Mesaj göndermek için giriş yapın; hesap ücretsizdir.</p>
      </div>
    );
  }
  if (conversationId) {
    return (
      <Link href={`/mesajlar/${conversationId}`} className={buttonVariants({ size: "lg", className: "w-full" })}>
        <ChatsCircleIcon aria-hidden="true" weight="duotone" />
        Satıcıyla sohbete git
      </Link>
    );
  }
  if (sold) return <p className="rounded-2xl bg-muted px-4 py-3 text-center font-semibold">Bu ilan satıldı; satıcıya yeni mesaj gönderilemiyor.</p>;

  const amount = parsePrice(offer);
  const submit = () =>
    start(async () => {
      setError("");
      const r = await startConversation(listingId, mode === "message" ? text : "", mode === "offer" ? offer : "");
      if (r?.message) setError(r.message);
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-4"
      aria-label="Satıcıyla iletişim"
    >
      <div role="group" aria-label="Mesaj ya da teklif" className="grid grid-cols-2 gap-1 rounded-[var(--btn-radius)] bg-muted p-1">
        {(
          [
            ["message", "Mesaj yaz", ChatsCircleIcon],
            ["offer", "Teklif ver", HandCoinsIcon],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => {
              setMode(id);
              setError("");
            }}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[calc(var(--btn-radius)-2px)] font-semibold text-muted-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-soft"
          >
            <Icon aria-hidden="true" weight="duotone" className="size-5" />
            {label}
          </button>
        ))}
      </div>

      {mode === "message" ? (
        <div className="space-y-3">
          <label htmlFor="ilk-mesaj" className="block font-semibold">
            Mesajınız
          </label>
          <Textarea id="ilk-mesaj" value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1000} required />
          <div className="flex flex-wrap gap-2" aria-label="Hazır mesajlar">
            {QUICK_REPLIES.buyer.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setText(q)}
                className="min-h-11 cursor-pointer rounded-full border border-border px-3 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-secondary"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="teklif" className="block font-semibold">
            Teklifiniz (₺{unit ? ` / ${unit}` : ""})
          </label>
          <Input
            id="teklif"
            inputMode="decimal"
            autoComplete="off"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            placeholder={formatPrice(Math.round(price * 0.9))}
            aria-describedby="teklif-not"
          />
          <p id="teklif-not" className="text-muted-foreground">
            İlan fiyatı {formatPrice(price)}
            {unit ? ` / ${unit}` : ""}.{negotiable ? " Satıcı pazarlığa açık." : " Satıcı pazarlık payı belirtmedi."}
            {amount > 0 && ` İlan fiyatına oranı: %${Math.round((amount / price) * 100)}.`}
          </p>
        </div>
      )}

      {error && <FieldError id="iletisim-hata">{error}</FieldError>}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? (
          <span aria-hidden="true" className="size-5 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />
        ) : (
          <PaperPlaneRightIcon aria-hidden="true" weight="fill" />
        )}
        {pending ? "Gönderiliyor…" : mode === "message" ? "Mesajı gönder" : "Teklifi gönder"}
      </Button>
    </form>
  );
}
