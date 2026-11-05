import type { Metadata } from "next";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr";
import { DESIGNS } from "@/components/designs";

export const metadata: Metadata = { title: "Tasarım seçenekleri", robots: { index: false, follow: false } };

/**
 * Temporary: the home page in 11 designs, as phone-sized previews to scroll and compare. Goes once one
 * is chosen.
 */
export default function DesignsPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Tasarım seçenekleri</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        Aynı ana sayfa, {DESIGNS.length} farklı tasarım: düzen, yazı tipi, kutular, menüler ve renkler her birinde başka. İçerik örnektir. Her önizlemenin içinde
        kaydırabilirsiniz; “Tam ekran” telefonda tek başına açar. Beğendiğinizin numarasını yazın.
      </p>
      <ol className="mt-8 grid gap-x-6 gap-y-10 [grid-template-columns:repeat(auto-fill,minmax(400px,1fr))] max-sm:grid-cols-1">
        {DESIGNS.map((d, i) => {
          const href = `/tasarimlar/${i + 1}`;
          return (
            <li key={d.name} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold">
                    <span className="text-muted-foreground">{i + 1}.</span> {d.name} <span className="text-base font-medium text-muted-foreground">· {d.style}</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">{d.about}</p>
                </div>
                <a href={href} target="_blank" rel="noopener" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold hover:bg-secondary">
                  Tam ekran
                  <ArrowSquareOutIcon aria-hidden="true" weight="bold" className="size-4" />
                </a>
              </div>
              <div className="mt-3 w-[390px] max-w-full self-center overflow-hidden rounded-[2.2rem] border-[7px] border-neutral-900 bg-neutral-900 shadow-lift">
                <iframe src={href} title={`Tasarım ${i + 1}: ${d.name}`} loading="lazy" className="block h-[780px] w-[376px] max-w-full rounded-[1.7rem] bg-white" />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
