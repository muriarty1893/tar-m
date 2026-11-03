import type { Metadata } from "next";
import Link from "next/link";
import { InfoIcon } from "@phosphor-icons/react/dist/ssr";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { PriceBoard } from "@/components/farm/PriceBoard";

export const metadata: Metadata = {
  title: "Borsa fiyatları",
  description: "Tahıl, baklagil, yağlı tohum, meyve-sebze ve sanayi bitkilerinin kilogram fiyatları ve haftalık değişimleri.",
};

export default function PricesPage() {
  return (
    <>
      <ToolHeader eyebrow="Tarım borsası" title="Borsa fiyatları" intro="Ürünlerin kilogram fiyatı ve geçen haftaya göre değişimi. Ürün adına ya da borsaya göre arayın." />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <p role="note" className="flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold-soft px-4 py-3 text-lg">
          <InfoIcon aria-hidden="true" weight="duotone" className="mt-0.5 size-6 shrink-0 text-gold" />
          <span>
            <b>Örnek veriler.</b> Bu fiyatlar sayfanın nasıl çalışacağını göstermek içindir; gerçek borsa fiyatları değildir, alım satımda kullanmayın. Güncel fiyatlar için
            ilinizin ticaret borsasına bakın. Gerçek fiyatlar yakında bu sayfada olacak.
          </span>
        </p>
        <PriceBoard />
        <p className="text-muted-foreground">
          Ürününüzü satmak mı istiyorsunuz?{" "}
          <Link href="/pazar/ilan-ver" className="font-semibold text-primary underline underline-offset-4">
            Pazar’da ilan verin
          </Link>
          .
        </p>
      </div>
    </>
  );
}
