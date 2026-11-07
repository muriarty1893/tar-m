import type { Metadata } from "next";
import { ChartLineUpIcon, LightbulbIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { PartnerForm } from "@/components/PartnerForm";
import { PageHero } from "@/components/PageHero";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "İş Birliği",
  description: `Yatırımcılar, kooperatifler, ziraat odaları ve pilot çiftlikler için ${siteConfig.name} iş birliği.`,
};

const blocks = [
  {
    title: "Sorun",
    icon: WarningCircleIcon,
    points: [
      "Çiftçinin bir uzmana ya da deneyimli bir komşuya hızlıca ulaşması her zaman mümkün değil, özellikle kırsal bölgelerde.",
      "Ürününü satmak ya da alet, tohum almak isteyen çiftçi için güvenilir ve kolay bir buluşma yeri yok.",
      "Mevcut dijital araçların çoğu Türkçe değil ya da çiftçinin günlük kullanımına uygun tasarlanmamış.",
    ],
  },
  {
    title: "Çözümümüz",
    icon: LightbulbIcon,
    points: [
      "Çiftçilerin soru sorup deneyimini paylaştığı, kategorilere ayrılmış bir forum.",
      "Çiftçiden çiftçiye pazar: ilan, site içi mesajlaşma ve teklif.",
      "İle özel hava durumu ve uyarılar, borsa fiyatları, tarım takvimi, tarla ve masraf takibi tek yerde.",
      "Telefona göre tasarlandı: tarladayken de tek elle kullanılır.",
    ],
  },
  {
    title: "Pazar ve fırsat",
    icon: ChartLineUpIcon,
    points: [
      "Tarım, Türkiye ekonomisinin ve kırsal istihdamın temel taşlarından biri; milyonlarca işletme küçük ve orta ölçekli.",
      "Akıllı telefon kullanımı kırsalda da yaygınlaşıyor.",
      "Tarıma ürün ve hizmet sunan firmalar için çiftçiye doğrudan ulaşan reklam ve sponsorluk alanları.",
    ],
  },
];

export default function PartnerPage() {
  return (
    <>
      <PageHero
        title={`${siteConfig.name} ile birlikte çalışalım`}
        intro="Yatırımcılar, kooperatifler, ziraat odaları, kamu kurumları ve pilot çiftliklerle sahaya birlikte çıkmak istiyoruz."
      />
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-6">
        <div className="grid gap-3 lg:grid-cols-3">
          {blocks.map(({ title, icon: Icon, points }) => (
            <section key={title} className="overflow-hidden rounded-md border border-border bg-card">
              <h2 className="flex min-h-11 items-center gap-2 border-b border-border px-4 text-[15px] font-bold">
                <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-md bg-secondary text-primary">
                  <Icon weight="fill" className="size-4" />
                </span>
                {title}
              </h2>
              <ul className="space-y-2 p-4 text-[0.9375rem]">
                {points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-muted-foreground">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section
          id="iletisim-formu"
          className="mx-auto mt-3 max-w-4xl scroll-mt-24 rounded-md border border-border bg-card p-4 sm:mt-6 sm:p-6"
        >
          <h2 className="text-lg font-bold">Bize ulaşın</h2>
          <p className="mb-4 mt-1 text-muted-foreground">Formu doldurun, en kısa sürede size dönüş yapalım.</p>
          <PartnerForm />
        </section>
      </div>
    </>
  );
}
