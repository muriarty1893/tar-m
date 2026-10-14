import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { modelCredit, photoCredits } from "@/data/photo-credits";

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
      <PageHero title="Görsel kaynakları" intro="Sitede kullandığımız fotoğraflar ve 3B model; yazarları, lisansları ve kaynaklarıyla." />
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-14">
        <section aria-labelledby="model">
          <h2 id="model" className="text-2xl font-bold">
            3B model
          </h2>
          <ul className="mt-4 text-lg">
            <li>
              Canlı demodaki telefon:{" "}
              <a href={modelCredit.sourceUrl} className={link} rel="noopener">
                “{modelCredit.title}”, {modelCredit.author}
              </a>{" "}
              —{" "}
              <a href={modelCredit.licenseUrl} className={link} rel="noopener license">
                {modelCredit.license}
              </a>
              , {modelCredit.note}.
            </li>
          </ul>
        </section>

        <section aria-labelledby="photos">
          <h2 id="photos" className="text-2xl font-bold">
            Fotoğraflar
          </h2>
          <p className="mt-2 text-muted-foreground">Wikimedia Commons; sitede kırpılmış ve küçültülmüş olarak kullanılmıştır.</p>
          <ul className="mt-5 divide-y divide-border">
            {photos.map((c) => (
              <li key={c.src} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
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
