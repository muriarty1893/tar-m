import Link from "next/link";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr";

/** The market's standing safety reminder. */
export function SafetyNote({ className = "" }: { className?: string }) {
  return (
    <p className={`flex items-start gap-3 rounded-lg border border-gold/25 bg-gold-soft px-4 py-3 ${className}`}>
      <ShieldCheckIcon aria-hidden="true" weight="duotone" className="mt-0.5 size-6 shrink-0 text-gold" />
      <span>
        <b>Güvenli alışveriş:</b> Ürünü görmeden kapora ya da ödeme göndermeyin; buluşmayı gündüz ve kalabalık bir yerde yapın.{" "}
        <Link href="/pazar/kurallar" className="font-semibold text-primary underline underline-offset-4">
          Pazar kuralları
        </Link>
      </span>
    </p>
  );
}
