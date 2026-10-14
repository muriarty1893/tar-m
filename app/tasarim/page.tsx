import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { TASARIMLAR } from "@/lib/tasarim";
import { ScaledFrame } from "./ScaledFrame";

export const metadata: Metadata = {
  title: "Tasarım seçenekleri",
  description: "Sitenin dört beyaz tasarım seçeneği, yan yana.",
  robots: { index: false, follow: false },
};

/** Temporary: the four design candidates side by side, each a live, scrollable copy of the home page. */
export default function TasarimPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Dört beyaz tasarım</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Her kutu ana sayfanın canlı bir kopyası; içinde kaydırabilirsiniz. Bir sürümü tüm sayfalarda denemek için altındaki
        bağlantıyı kullanın ya da köşedeki seçiciden harf değiştirin. Canlı demodaki telefon her sürümde aynı kalır.
      </p>
      <ul className="mt-10 grid gap-10 lg:grid-cols-2">
        {TASARIMLAR.map((t) => (
          <li key={t.id} className="flex flex-col">
            <h2 className="flex items-baseline gap-3 text-2xl font-bold">
              <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-lg bg-foreground text-lg text-background">
                {t.id.toUpperCase()}
              </span>
              {t.name}
            </h2>
            <p className="mt-2 text-muted-foreground">{t.summary}</p>
            <ScaledFrame src={`/?tasarim=${t.id}`} title={`${t.name} tasarımıyla ana sayfa`} className="mt-4" />
            <Link href={`/?tasarim=${t.id}`} className={buttonVariants({ variant: "outline", className: "mt-4 self-start" })}>
              Siteyi {t.id.toUpperCase()} sürümüyle gezin
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
