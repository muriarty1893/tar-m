import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { photoCredits } from "@/data/photo-credits";

export const metadata: Metadata = {
  title: "Görsel kaynakları",
  description: "Sitede kullanılan fotoğrafların ve 3B modelin yazarları, lisansları ve kaynakları.",
};

const link = "font-medium text-primary underline underline-offset-4 hover:text-foreground";

/** Credits the CC BY / CC BY-SA licences require, for every photo and the 3D phone model. */
export default function SourcesPage() {
  const photos = photoCredits.filter((c, i, all) => all.findIndex((o) => o.sourceUrl === c.sourceUrl) === i);
  return (
    <>
      <PageHero title="Görsel kaynakları" intro="Sitede kullandığımız fotoğraflar; yazarları, lisansları ve kaynaklarıyla." />
      <div className="mx-auto max-w-4xl space-y-6 px-3 py-3 sm:px-4 sm:py-6">
        <section aria-labelledby="photos" className="overflow-hidden rounded-md border border-border bg-card">
          <div className="border-b border-border px-4 py-2.5">
            <h2 id="photos" className="text-[15px] font-bold">
              Fotoğraflar
            </h2>
            <p className="text-[13px] text-muted-foreground">Wikimedia Commons; sitede kırpılmış ve küçültülmüş olarak kullanılmıştır.</p>
          </div>
          <ul className="divide-y divide-border text-[0.9375rem]">
            {photos.map((c) => (
              <li key={c.src} className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <a href={c.sourceUrl} className={link} rel="noopener">
                  {c.label}
                </a>
                <span className="text-muted-foreground">
                  {c.author} —{" "}
                  {c.licenseUrl ? (
                    <a href={c.licenseUrl} className={link} rel="noopener license">
                      {c.license}
                    </a>
                  ) : (
                    c.license
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
